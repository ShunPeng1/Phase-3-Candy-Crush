import CONST, { CandyColorKey, candyColors } from "../const/const";
import TileGrid from "../objects/grids/TileGrid";
import TileMatcher from "../objects/grids/TileMatcher";
import Tile from "../objects/tiles/Tile";
import TileFactory from "../objects/tiles/TileFactory";

import SimulationController from "../simulation/SimulationController";
import TweenSimulation from "../simulation/TweenSimulation";


class GameScene extends Phaser.Scene {
    // Variables
    private canMove: boolean;

    private tileGrid : TileGrid;
    private tileMatcher: TileMatcher;

    // Selected Tiles
    private firstSelectedTile: Tile | null;
    private secondSelectedTile: Tile | null;

    private simulationController: SimulationController;

    constructor() {
        super({
        key: 'GameScene'
        });
    }

    init(): void {
        // Init variables
        this.canMove = true;

        this.simulationController = new SimulationController(this);

        // set background color
        this.cameras.main.setBackgroundColor(0x78aade);

        // Init grid with tiles
        this.tileGrid = new TileGrid(this, 400, 100, CONST.gridWidth, CONST.gridHeight, CONST.tileWidth, CONST.tileHeight,
            new TileFactory(this, candyColors)); 
        this.tileMatcher = new TileMatcher();


        // Selected Tiles
        this.firstSelectedTile = null;
        this.secondSelectedTile = null;

        // Input
        this.input.on('gameobjectdown', this.tileDown, this);

        const onTileAdded = (tile: Tile, x: number, y: number, endX: number, endY: number) => {
            //console.log("Tile added", tile.texture.key, "at", x, y, "to", endX, endY);  
            this.tweenDropdownTile(tile, y, endY);
        }

        this.tileGrid.on('tileAdded', onTileAdded);

        this.tileGrid.on('tileMoved', onTileAdded);

        this.tileGrid.initializeGrid();


        // Start the simulation
        const onComplete = () => {
            console.log("Simulation complete");
            this.simulationController.off('complete', onComplete);
            this.checkMatches();
        };

        this.simulationController.on('complete', onComplete);
        this.simulationController.startSimulation(true);
    }

    /**
     * Add a new random tile at the specified position.
     * @param x
     * @param y
     */
    

    /**
     * This function gets called, as soon as a tile has been pressed or clicked.
     * It will check, if a move can be done at first.
     * Then it will check if a tile was already selected before or not (if -> else)
     * @param pointer
     * @param gameobject
     * @param event
     */
    private tileDown(pointer: any, gameobject: any, event: any): void {
        if (!this.canMove) {
            return;
        }

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
        dx = Math.abs(this.firstSelectedTile.x - this.secondSelectedTile.x) /
            CONST.tileWidth;
        dy = Math.abs(this.firstSelectedTile.y - this.secondSelectedTile.y) /
            CONST.tileHeight;
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

    /**
     * This function will take care of the swapping of the two selected tiles.
     * It will only work, if two tiles have been selected.
     */
    private swapTiles(): void {
        if (this.firstSelectedTile && this.secondSelectedTile) {
            
            this.tileGrid.swapTiles(this.firstSelectedTile, this.secondSelectedTile);
            
            const tileSwappedCallback = () => {
                this.checkMatches();
                this.tileGrid.off('tilesSwapped', tileSwappedCallback);
            }
            this.tileGrid.on('tilesSwapped', tileSwappedCallback);


            // Reset the selected tiles
            const tempSelectedTile = this.firstSelectedTile;
            this.firstSelectedTile = this.secondSelectedTile;
            this.secondSelectedTile = tempSelectedTile;
        }
    }

    private checkMatches(): void {
        //Call the getMatches function to check for spots where there is
        //a run of three or more tiles in a row
        let matches = this.tileMatcher.getMatches(this.tileGrid);
        
        //If there are matches, remove them
        if (matches.length > 0) {
            //Remove the tiles
            this.tileGrid.removeTileGroup(matches);
            // Move the tiles currently on the board into their new positions
            this.tileGrid.gravitateTile();
            //Fill the board with new tiles wherever there is an empty spot
            this.tileGrid.fillEmptyWithTile();
            this.resetSelectedTile();

            this.simulationController.startSimulation(true);
            const onComplete = () => {
                this.simulationController.off('complete', onComplete);
                this.checkMatches();
            };
    
            this.simulationController.on('complete', onComplete);
            this.simulationController.startSimulation(true);
        } else {
            // No match so just swap the tiles back to their original position and reset
            this.swapTiles();
            this.resetSelectedTile();
            this.canMove = true;
        }
    }

    
    private resetSelectedTile(): void {
        // Reset active tiles
        this.firstSelectedTile = null;
        this.secondSelectedTile = null;
    }

    

    private getTilePos(tileGrid: (Tile|null)[][], tile: Tile): any {
        let pos = { x: -1, y: -1 };

        //Find the position of a specific tile in the grid
        for (let y = 0; y < tileGrid.length; y++) {
            for (let x = 0; x < tileGrid[y].length; x++) {
                //There is a match at this position so return the grid coords
                if (tile === tileGrid[y][x]) {
                    pos.x = x;
                    pos.y = y;
                    break;
                }
            }
        }

        return pos;
    }


    private tweenDropdownTile(tile: Tile, fromY: number, endY: number): void {
        //console.log("Tweening tile", tile.texture.key, "from", fromY, "to", endY);

        let tweenSimulation = new TweenSimulation(this.tweens.add({
            targets: tile,
            y: endY * CONST.tileHeight,
            ease: 'Linear',
            duration: 200 * (endY - fromY),
            repeat: 0,
            yoyo: false
        }));
        
        this.simulationController.addSimulation(tweenSimulation);

    }
}


export default GameScene;