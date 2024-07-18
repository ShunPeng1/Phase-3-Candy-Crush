import { GameObjects, Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";
import TweenChainSimulation from "../../simulation/TweenChainSimulation";
import TileGrid from "../grids/TileGrid";
import { CandyColorKey, candyColors } from "../../const/const";

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

            console.log(elementWorldPosition.tx, elementWorldPosition.ty, lightningStrikeSprite.displayHeight * finalScale, angle, Math.cos(angle), Math.sin(angle));

            lightningStrikeSprite.setScale(0);
            let chainTween = this.scene.tweens.chain({
                tweens : [
                    {
                        delay: 50*index,
                        targets: lightningStrikeSprite,
                        x: elementWorldPosition.tx,
                        y: elementWorldPosition.ty,
                        scaleX: finalScale,
                        scaleY: finalScale,
                        duration: 700,
                    }
                ],
                
                onComplete: () => {
                    this.tileGrid.destroyPopTile(element, this);

                    lightningStrikeSprite.play("lightning-strike-end");
                    lightningStrikeSprite.once("animationcomplete", () => {
                        lightningStrikeSprite.destroy();
                    });
                }
            });

            simulationController.addSimulation(new TweenChainSimulation(chainTween), true);


        });


    }

    public onTileSwapPop(other: ITileEffect): void {
        if (other.type === "COLOR_CLEAR"){
            this.popTileColor(candyColors);
        }
        else{
            this.popTileColor(other.color as CandyColorKey);
        }    
        
    }

    private popTileColor(color: CandyColorKey[] | CandyColorKey): void {  
        if (Array.isArray(color)){
            color.forEach(element => {
                this.popTileColor(element);
            });
            return;
        }
        
		let tileGrid = this.tile.getTileGrid();
        this.tileGrid = tileGrid;

        let flattenGrid = tileGrid.getFlattenTileGrid();
        let sameColorTiles = flattenGrid.filter(tile => tile.getColor() === color);
        this.tileToDestroy = [...this.tileToDestroy,...sameColorTiles];

        tileGrid.popTiles(sameColorTiles);
    }
}

export default ChocolateTileEffect;