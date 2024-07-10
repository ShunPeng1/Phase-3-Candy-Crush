import { GameObjects } from "phaser";
import Tile from "../tiles/Tile";
import { CandyColorKey } from "../../const/const";
import TileFactory from "../tiles/TileFactory";

class TileGrid extends GameObjects.Container {
    private tileGrid: (Tile|null)[][];
    
    private gridWidth: number;
    private gridHeight: number;

    private tileWidth: number;
    private tileHeight: number;

    private tileFactory: TileFactory;
    private gridTextures: string[];

    constructor(scene: Phaser.Scene, x: number, y: number, gridWidth: number, gridHeight: number, tileWidth: number, tileHeight: number, tileFactory : TileFactory, gridTextures: string[] = []) {
        super(scene, x, y);
        this.scene = scene;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.tileFactory = tileFactory;
        this.gridTextures = gridTextures;

        this.scene.add.existing(this);

        this.initializeGrid();

    }
    
    private initializeGrid() :void{
        if (this.gridTextures.length == 0){
            return;
        }

        if (this.gridTextures.length === 1){
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    let gridImage = this.scene.add.image(x * this.tileWidth, y * this.tileHeight, this.gridTextures[0]);
                    gridImage.setDisplaySize(this.tileWidth, this.tileHeight);
                    gridImage.setOrigin(0,0);
                    this.add(gridImage);
                    this.sendToBack(gridImage);
                }
            }
        }

        else if (this.gridTextures.length === 2){
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    let gridImage = this.scene.add.image(x * this.tileWidth, y * this.tileHeight, this.gridTextures[(x + y) % 2]);
                    gridImage.setDisplaySize(this.tileWidth, this.tileHeight);
                    gridImage.setOrigin(0,0);
                    this.add(gridImage);
                    this.sendToBack(gridImage);
                }
            }
        }
    }


    public initializeTiles(){
        this.tileGrid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.tileGrid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                let tile = this.createRandomTile(x, (y - this.gridHeight));
                
                
                this.tileGrid[y][x] = tile;
                this.emit('tileAdded', tile, x, (y - this.gridHeight), x, y);
                
            }
        }

    }


    

    public getTilePos(tile: Tile): Phaser.Math.Vector2  | null {
        let pos : Phaser.Math.Vector2 | null = null;

        //Find the position of a specific tile in the grid
        for (let y = 0; y < this.tileGrid.length; y++) {
            for (let x = 0; x < this.tileGrid[y].length; x++) {
                //There is a match at this position so return the grid coords
                if (tile === this.tileGrid[y][x]) {
                    pos = new Phaser.Math.Vector2(x, y);
                    break;
                }
            }
        }

        return pos;
    }

    
    public gravitateTile(): void {
        
        for (let y = this.tileGrid.length - 1; y >= 0; y--) {// Loop through each row from bottom to top
            for (let x = this.tileGrid[y].length - 1; x >= 0; x--) { // Loop through each tile in the row from right to left
                if (this.tileGrid[y][x] !== null) {
                    continue;
                }
                
                // If this space is blank, but the one above it is not, move the one above down
                let aboveTile = null;
                let aboveIndex = y - 1;
                for (let i = y - 1; i >= 0; i--) { // Start at the top of the column and move down
                    if (aboveTile === null) {
                        aboveTile = this.tileGrid[i][x];
                        aboveIndex = i;
                    }
                    else{
                        break;
                    }
                }
                
                if (aboveTile !== null) {
                    // Move the tile above down one
                    this.tileGrid[y][x] = aboveTile;
                    this.tileGrid[aboveIndex][x] = null;

                    this.emit('tileMoved', aboveTile, x, aboveIndex, x, y);

                    //The positions have changed so start this process again from the bottom
                    //NOTE: This is not set to me.tileGrid[i].length - 1 because it will immediately be decremented as
                    //we are at the end of the loop.
                    //x = this.tileGrid[y].length; 
                }
            }
        }
    }

    public fillEmptyWithTile(): void {
        //Check for blank spaces in the grid and add new tiles at that position
        for (var y = 0; y < this.tileGrid.length; y++) {
            for (var x = 0; x < this.tileGrid[y].length; x++) {
                if (this.tileGrid[y][x] !== null) {
                    continue;
                }

                let belowIndex = this.tileGrid.length;
                for (let i = y + 1; i < this.tileGrid.length; i++) { // Start at the top of the column and move down
                    if (this.tileGrid[i][x] !== null) {
                        belowIndex = i;
                        break;
                    }
                }

                const fromYIndex = belowIndex - y;
                //Found a blank spot so lets add animate a tile there
                let tile = this.createRandomTile(x, (y - belowIndex));
                
                this.tileGrid[y][x] = tile;

                this.emit('tileAdded', tile, x, (y - belowIndex), x, y);
                
                //And also update our "theoretical" grid
                
                
            }
        }
    }

    public removeTileGroup(matches: Tile[][]): void {
        // Loop through all the matches and remove the associated tiles
        for (var i = 0; i < matches.length; i++) {
            var tempArr = matches[i];

            for (var j = 0; j < tempArr.length; j++) {
                let tile = tempArr[j];
                //Find where this tile lives in the theoretical grid
                let tilePos = this.getTilePos(tile);

                // Remove the tile from the theoretical grid
                if (tilePos) {
                    this.remove(tile);
                    tile.destroy();
                    this.tileGrid[tilePos.y][tilePos.x] = null;
                }
            }
        }
    }

    public swapTiles(firstSelectedTile : Tile, secondSelectedTile : Tile ): void {
        if (!firstSelectedTile || !secondSelectedTile) {
            return;
        }

        // Get the position of the two tiles
        let firstTilePosition = {
            x: firstSelectedTile.x,
            y: firstSelectedTile.y
        };

        let secondTilePosition = {
            x: secondSelectedTile.x,
            y: secondSelectedTile.y
        };

        // Swap them in our grid with the tiles
        this.tileGrid[firstTilePosition.y / this.tileHeight -0.5][firstTilePosition.x / this.tileWidth -0.5] = secondSelectedTile;
        this.tileGrid[secondTilePosition.y / this.tileHeight -0.5][secondTilePosition.x / this.tileWidth -0.5] = firstSelectedTile;

        this.emit('tilesSwapped', firstSelectedTile, secondSelectedTile);
            
    }

    public getDistance(firstTile: Tile, secondTile: Tile): number {
        return Math.abs(firstTile.x - secondTile.x) + Math.abs(firstTile.y - secondTile.y);
    }

    public getMahattanDistance(firstTile: Tile, secondTile: Tile): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(Math.abs(firstTile.x - secondTile.x), Math.abs(firstTile.y - secondTile.y));
    }

    public getMahattanIndexDistance(firstTile: Tile, secondTile: Tile): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(Math.abs(firstTile.x - secondTile.x) / this.tileWidth,
            Math.abs(firstTile.y - secondTile.y) / this.tileHeight);
    }


    public getRow(y: number): (Tile|null)[] {
        return this.tileGrid[y];
    }

    public getColumn(x: number): (Tile|null)[] {
        let column: (Tile|null)[] = [];
        for (let y = 0; y < this.tileGrid.length; y++) {
            column.push(this.tileGrid[y][x]);
        }
        return column;
    }

    public getTile(x: number, y: number): Tile | null {
        return this.tileGrid[y][x];
    }

    public getRowCount(): number {
        return this.gridHeight;
    }

    public getColumnCount(): number {
        return this.gridWidth;
    }

    private createRandomTile(xIndex: number, yIndex: number): Tile {
        let tile = this.tileFactory.createRandomTile((xIndex +0.5) * this.tileWidth, (yIndex + 0.5) * this.tileHeight, this.tileWidth, this.tileHeight);
    
        //this.scene.add.existing(tile);
        this.add(tile);

        return tile;
    }


}


export default TileGrid;