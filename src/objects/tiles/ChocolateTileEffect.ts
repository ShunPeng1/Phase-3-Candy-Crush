import { GameObjects, Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";
import TweenChainSimulation from "../../simulation/TweenChainSimulation";
import TileGrid from "../grids/TileGrid";
import { CandyColorKey, candyColors } from "../../const/const";
import TimerEventSimulation from "../../simulation/TimerEventSimulation";

class ChocolateTileEffect extends TileEffect {
    
    private tileGrid: TileGrid;
    private tileIndex: Phaser.Math.Vector2;
    private tileToDestroy: Tile[] = [];

	constructor(scene : Scene, tile : Tile, color: string, texture: string){ 
        super(scene, tile, color, texture, "COLOR_CLEAR");
    }

	public onTilePop(): void {
        let randomColor = candyColors[Math.floor(Math.random() * candyColors.length)];
        this.popTileColor(randomColor);
        
	}

	public onTileDestroy(): void {
		let simulationController = this.scene.data.get("simulationController") as SimulationController;
		let matrix = this.tile.getWorldPosition();
		
    
        // Add score for each tile destroyed
        let scoreController = this.scene.data.get("scoreController");
        scoreController.addScore(1);


        let fakeTile = this.scene.add.image(matrix.tx, matrix.ty, this.texture);
        fakeTile.setDisplaySize(this.tile.displayWidth, this.tile.displayHeight);
        
        let duration = Math.max(300, Math.min(100*this.tileToDestroy.length, 2000));
        


        let tween = this.scene.tweens.add({
            targets: fakeTile,
            rotation: '+=6.28319',
            duration: 200,
            repeat: -1,
        });

        const emitter = this.scene.add.particles(matrix.tx, matrix.ty, 'lightning-3-sheet', {
            anim: 'lightning-bolt',
            rotate: { min: 0, max: 360 },
            scale: { start: 0.25, end: 0.5 },
            lifespan: 500,
            duration: duration,
            frequency: 100,
        });

        emitter.start();

        simulationController.addSimulation(new TimerEventSimulation(this.scene, duration,  () => {
            tween.stop();
            fakeTile.destroy();
            emitter.destroy();

            let particles = this.scene.add.particles(matrix.tx, matrix.ty, this.texture, {
                radial: true,
                angle: { min: 0, max: 360 },
                speed: { min: 100, max: 200 },
                quantity: 15,
                lifespan: 500,
                alpha: { start: 1, end: 0 },
                scale: { min: 0.125, max: 0.25 }, // Random size variation 
                rotate: { min: 0, max: 360}, // Random spinning angles
                
            });
            
            particles.explode(25);
        }), true);

        let thisWorldPosition = this.tile.getWorldPosition();
        this.tileToDestroy.forEach((element, index) => {

            let lightningStrikeSprite = this.scene.add.sprite(thisWorldPosition.tx, thisWorldPosition.ty, "lightning-strike");
            lightningStrikeSprite.play("lightning-strike-start");
            lightningStrikeSprite.once("animationcomplete", () => {
                lightningStrikeSprite.play("lightning-strike-loop");
            });

            let angle = Phaser.Math.Angle.Between(element.x, element.y, this.tile.x, this.tile.y);
            lightningStrikeSprite.setRotation(angle - Math.PI/2);
            lightningStrikeSprite.setOrigin(0.5, 1);
            const finalScale = 0.5;
        
            let elementWorldPosition = element.getWorldPosition();
            elementWorldPosition.tx += lightningStrikeSprite.displayHeight * finalScale/2 * Math.cos(angle);
            elementWorldPosition.ty += lightningStrikeSprite.displayHeight * finalScale/2 * Math.sin(angle);


            let lightningBlast = this.scene.add.sprite(elementWorldPosition.tx, elementWorldPosition.ty, "lightning-1-sheet");
            lightningBlast.setVisible(false);
            lightningBlast.setScale(0.3);

            
            lightningStrikeSprite.setScale(0);
            let chainTween = this.scene.tweens.chain({
                tweens : [
                    {
                        delay: (duration/this.tileToDestroy.length)*index,
                        targets: lightningStrikeSprite,
                        x: elementWorldPosition.tx,
                        y: elementWorldPosition.ty,
                        scaleX: finalScale,
                        scaleY: finalScale,
                        duration: 500,
                    }
                ],
                
                onComplete: () => {

                    lightningStrikeSprite.play("lightning-strike-end");
                    lightningStrikeSprite.once("animationcomplete", () => {
                        lightningStrikeSprite.destroy();
                    });

                    lightningBlast.setVisible(true);
                    lightningBlast.play("lightning-blast");
                    lightningBlast.once("animationcomplete", () => {
                        lightningBlast.destroy();
                        
                    });

                    
                    this.tileGrid.destroyPopTile(element, this);
                }
            });

            simulationController.addSimulation(new TweenChainSimulation(chainTween), true);


        });


    }

    public onTileSwapPop(other: ITileEffect): void {
        if (other.type === "COLOR_CLEAR"){
            this.popTileColor(candyColors);
            this.popTileColor('');//pop chocolate tile
        }
        else{
            this.popTileColor(other.color as CandyColorKey);
        }    
        
    }

    private popTileColor(color: CandyColorKey[] | CandyColorKey | string): void {  
        if (Array.isArray(color)){
            color.forEach(element => {
                this.popTileColor(element);
            });
            return;
        }
        
		let tileGrid = this.tile.getTileGrid();
        this.tileGrid = tileGrid;

        let flattenGrid = tileGrid.getFlattenTileGrid();
        if (flattenGrid.length === 0){
            return;
        }

        let chocolateTiles = flattenGrid.filter(tile => tile.getColor() === '');
        let sameColorTiles = flattenGrid.filter(tile => tile.getColor() === color);
        if (color !== '' && chocolateTiles.length != flattenGrid.length){ // Not chocolate tile
            while (sameColorTiles.length == 0){
                color = candyColors[Math.floor(Math.random() * candyColors.length)];
                sameColorTiles = flattenGrid.filter(tile => tile.getColor() === color);   
            }
        }

        this.tileToDestroy = [...this.tileToDestroy,...sameColorTiles];

        tileGrid.popTiles(sameColorTiles);
    }
}

export default ChocolateTileEffect;