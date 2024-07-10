import { Scene } from "phaser";
import Tile from "../tiles/Tile";
import TileGrid from "./TileGrid";

class TileSwapper {
    
    // Selected Tiles
    private scene: Scene;
    
    private canMove: boolean;
    private isSwapped : boolean;

    private tileGrid: TileGrid;

    private firstSelectedTile: Tile | null;
    private secondSelectedTile: Tile | null;

    constructor(scene : Scene, tileGrid: TileGrid) {
        this.scene = scene;
        this.firstSelectedTile = null;
        this.secondSelectedTile = null;
        this.canMove = true;
        this.isSwapped = false;
        this.tileGrid = tileGrid;
    
    }

    public swapTiles(): void {
        if (this.firstSelectedTile && this.secondSelectedTile) {
            this.isSwapped = true;

            this.tileGrid.swapTiles(this.firstSelectedTile, this.secondSelectedTile);

            // Swap the selected tiles
            const tempSelectedTile = this.firstSelectedTile;
            this.firstSelectedTile = this.secondSelectedTile;
            this.secondSelectedTile = tempSelectedTile;

            
        }
    }

    public unswapTiles(): void {
        if (this.firstSelectedTile && this.secondSelectedTile) {
            this.isSwapped = false;
            this.tileGrid.swapTiles(this.firstSelectedTile, this.secondSelectedTile);

            // Swap the selected tiles
            const tempSelectedTile = this.firstSelectedTile;
            this.firstSelectedTile = this.secondSelectedTile;
            this.secondSelectedTile = tempSelectedTile;
            
        }
    }

    public selectTile(gameobject: Tile): void {
        if (!this.canMove) {
            return;
        }

        console.log("Tile selected", gameobject.texture.key, this.tileGrid.getTilePos(gameobject))
        if (!this.firstSelectedTile) {
            this.firstSelectedTile = gameobject;
            //console.log("First tile selected", this.firstSelectedTile?.texture.key, this.tileGrid.getTilePos(this.firstSelectedTile!))
            return;
        } 

        // So if we are here, we must have selected a second tile
        
        if (this.firstSelectedTile === gameobject) {
            // If the same tile is clicked twice, deselect it
            this.resetSelectedTile();
            return;
        }

        this.secondSelectedTile = gameobject;

        let dx = 0;
        let dy = 0;
        if (this.firstSelectedTile && this.secondSelectedTile) {
            let indexDistance = this.tileGrid.getMahattanIndexDistance(this.firstSelectedTile, this.secondSelectedTile);
            dx = indexDistance.x;
            dy = indexDistance.y;
        }

        // Check if the selected tiles are both in range to make a move
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            this.canMove = false;
            this.swapTiles();
        }
        else{
            // If the selected tiles are not in range, select the second tile
            this.firstSelectedTile = gameobject;
            this.secondSelectedTile = null;
        }
    
    
    }
    
    public resetSelectedTile(): void {
        // Reset active tiles
        this.firstSelectedTile = null;
        this.secondSelectedTile = null;
        this.isSwapped = false;
    }

    public setCanMove(canMove: boolean): void {
        this.canMove = canMove;
    }

    public checkIsSwapped(): boolean {
        return this.isSwapped;
    }

    public getCanMove() : boolean {
        return this.canMove;
    }    

}

export default TileSwapper;