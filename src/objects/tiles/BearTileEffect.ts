import { GameObjects, Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";
import TweenChainSimulation from "../../simulation/TweenChainSimulation";
import TileGrid from "../grids/TileGrid";

class BearTileEffect extends TileEffect {
    private tileGrid: TileGrid;
    private tileIndex: Phaser.Math.Vector2;
    private tileToDestroy1: Tile;
    private tileToDestroy2: Tile;

	constructor(scene: Scene, tile: Tile, color: string, texture: string) {
		super(scene, tile, color, texture);

        
	}

	public onTilePop(): void {
		let tileGrid = this.tile.getTileGrid();
        this.tileGrid = tileGrid;
		let flattenGrid = tileGrid.getFlattenTileGrid();

        let randomTile1 = flattenGrid[Math.floor(Math.random() * flattenGrid.length)];
        let randomTile2 = flattenGrid[Math.floor(Math.random() * flattenGrid.length)];

        if (flattenGrid.length < 2) return;

        while (randomTile1 === this.tile || randomTile2 === this.tile || randomTile1 === randomTile2) {
            randomTile1 = flattenGrid[Math.floor(Math.random() * flattenGrid.length)];
            randomTile2 = flattenGrid[Math.floor(Math.random() * flattenGrid.length)];
        }

        this.tileToDestroy1 = randomTile1;
        this.tileToDestroy2 = randomTile2;

        tileGrid.popTiles([randomTile1, randomTile2]);
        
        //tileGrid.destroyPopTile(this.tile);
	}

	public onTileDestroy(): void {
		let simulationController = this.scene.data.get("simulationController") as SimulationController;
		let matrix = this.tile.getWorldPosition();
		
        let particles = this.scene.add.particles(matrix.tx, matrix.ty, this.texture, {
            radial: true,
            angle: { min: 0, max: 360 },
            speed: { min: 500, max: 1000 },
            quantity: 15,
            lifespan: 500,
            alpha: { start: 1, end: 0 },
            scale: { min: 0.5, max: 1 }, // Random size variation 
            rotate: { min: 0, max: 360}, // Random spinning angles
            
        });
        
        particles.setScale(0.15);

        particles.explode(25);
        
        this.scene.time.delayedCall(2000, () => {
            particles.destroy();
        });



        let bearProjectileTweenChain1 = this.createExplosionAnimation(this.tileToDestroy1);
        let bearProjectileTweenChain2 = this.createExplosionAnimation(this.tileToDestroy2);
        

		simulationController.addSimulation(new TweenChainSimulation(bearProjectileTweenChain1), true);
        simulationController.addSimulation(new TweenChainSimulation(bearProjectileTweenChain2), true);
	}

    private createExplosionAnimation(tileToDestroy : Tile): Phaser.Tweens.TweenChain {
        let matrix = this.tile.getWorldPosition();
        let target = tileToDestroy.getWorldPosition();
        
        let bearProjectile1 = this.scene.add.image(matrix.tx, matrix.ty, this.texture);
        bearProjectile1.setFlipX(Math.random() > 0.5);

        let smallBomb = this.scene.add.image(target.tx, target.ty, "bomb-selection-01");
        smallBomb.setVisible(false);
        smallBomb.setPosition(target.tx, target.ty);
        

        let tweenChain1 = this.scene.tweens.chain({
            tweens: [
                {
                    targets: bearProjectile1,
                    scale: {from: 0.25, to: 1},
                    x: {from : matrix.tx, to: (target.tx+ matrix.tx) / 2},
                    y: {from : matrix.ty, to: (target.ty+ matrix.ty) / 2},
                    duration: 300,
                    ease: "Quart.easeOut",
                },
                {
                    targets: bearProjectile1,
                    scale: {from: 1, to: 0.25},
                    x: {from :(target.tx+ matrix.tx) / 2, to: target.tx},
                    y: {from : (target.ty+ matrix.ty) / 2, to: target.ty},
                    
                    duration: 300,
                    ease: "Sine.easeIn",
                    onComplete: () => {
                        bearProjectile1.destroy();
                    }
                },
                {
                    targets: smallBomb,
                    scale: {from: 0.25, to: 1},
                    alpha: {from: 0.5, to: 2},
                    duration: 300,
                    ease: "Linear",
                    onStart: () => {
                        smallBomb.setVisible(true);
                    },
                    onComplete: () => {
                        smallBomb.setVisible(false);
                        smallBomb.destroy();

                        this.tileGrid.destroyPopTile(tileToDestroy);
                    }
                }
            ]
        });

        return tweenChain1;
    }

}

export default BearTileEffect;