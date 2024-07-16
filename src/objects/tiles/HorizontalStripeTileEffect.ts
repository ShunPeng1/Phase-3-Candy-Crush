import { Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";
import TweenChainSimulation from "../../simulation/TweenChainSimulation";

class HorizontalStripeTileEffect extends TileEffect {
    private tileIndex: Phaser.Math.Vector2;
    private popTilesRight : Tile[] = [];
    private popTilesLeft : Tile[] = [];

    constructor(scene: Scene, tile: Tile, color: string, texture: string) {
        super(scene, tile, color, texture, "ROW_CLEAR");
    }

    public onTilePop(): void {
        let tileGrid = this.tile.getTileGrid();
        
        let tileIndex = tileGrid.getTileIndex(this.tile, true)!;
        this.tileIndex = tileIndex;

        for (let i = tileIndex.x + 1; i < tileGrid.getRowCount(); i++) {
            let tile = tileGrid.getTileAtIndex(i, tileIndex.y);
            if (tile != null && tile != this.tile) {
                this.popTilesLeft.push(tile);
            }
        }

        for (let i = tileIndex.x - 1; i >= 0; i--) {
            let tile = tileGrid.getTileAtIndex(i, tileIndex.y);
            if (tile != null && tile != this.tile) {
                this.popTilesRight.push(tile);
            }
        }

        tileGrid.popTiles(this.popTilesRight);
        tileGrid.popTiles(this.popTilesLeft);

        //tileGrid.destroyPopTile(this.tile);
    }

    public onTileDestroy(): void {
        let simulationController = this.scene.data.get("simulationController") as SimulationController;
        let matrix = this.tile.getWorldPosition();
        let tileGrid = this.tile.getTileGrid();
        
        let stripeDestroyRight = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyRight.setOrigin(1, 0.5); // Adjust origin for horizontal movement

        let destroyedSet = new Set<number>();
        const dynamicDestroy = (tween : Phaser.Tweens.Tween) => {
            const value = tween.getValue();
            const array = tween.targets as Tile[];

            if (destroyedSet.has(Math.floor(value))) {
                return;
            }

            tileGrid.destroyPopTile(array[Math.floor(value)], this);
        }

        let chainRight = this.scene.tweens.chain({
            tweens: [{
                targets: stripeDestroyRight,
                x: { from: matrix.tx, to: matrix.tx + 500},
                scaleY: {from: 0.8, to: 1.2 },
                scaleX: {from: 1, to: 4 },
                duration: 250,
                ease: 'Cubic.in'
            }, {
                targets: stripeDestroyRight,
                x: { from: matrix.tx + 500, to: matrix.tx + 1000},
                duration: 250,
                ease: 'Cubic.out'
            }]
        });

        let stripeDestroyLeft = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyLeft.setOrigin(0, 0.5); // Adjust origin for horizontal movement
        let chainLeft = this.scene.tweens.chain({
            tweens: [{
                targets: stripeDestroyLeft,
                x: { from: matrix.tx, to: matrix.tx - 500},
                scaleY: {from: 0.8, to: 1.2 },
                scaleX: {from: 1, to: 4 },
                duration: 250,
                ease: 'Cubic.in'
            }, {
                targets: stripeDestroyLeft,
                x: { from: matrix.tx - 500, to: matrix.tx - 1000},
                duration: 250,
                ease: 'Cubic.out'
            }]
        });

        // Adjust these tweens for horizontal movement
        let destroyRight = this.scene.add.tween({
            targets: this.popTilesRight,
            values: { from: 0, to: this.popTilesRight.length - 1},
            duration: 400,
            ease: 'Linear', // Corrected easing function name
            onUpdate: dynamicDestroy
        });

        let destroyLeft = this.scene.add.tween({
            targets: this.popTilesLeft,
            values: { from: 0, to: this.popTilesLeft.length - 1},
            duration: 400,
            ease: 'Linear', // Corrected easing function name
            onUpdate: dynamicDestroy
        });

        simulationController.addSimulation(new TweenChainSimulation(chainRight), true);
        simulationController.addSimulation(new TweenChainSimulation(chainLeft), true);
        simulationController.addSimulation(new TweenSimulation(destroyRight), true);
        simulationController.addSimulation(new TweenSimulation(destroyLeft), true);


        this.scene.time.delayedCall(500, () => {
            stripeDestroyRight.destroy();
            stripeDestroyLeft.destroy();
        });

        // Add score for each tile destroyed
        let scoreController = this.scene.data.get("scoreController");
        scoreController.addScore(1);
    }

    
    public onTileSwapPop(other: ITileEffect): void {
        // To do, implement the swap effect
    }

}

export default HorizontalStripeTileEffect;