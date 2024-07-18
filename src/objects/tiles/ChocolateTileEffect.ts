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


        this.tileToDestroy.forEach(element => {
            this.tileGrid.destroyPopTile(element, this);
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