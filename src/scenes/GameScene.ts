import CONST, { CandyColorKey, candyColors } from "../const/const";
import TileGrid from "../objects/grids/TileGrid";
import TileMatcher from "../objects/grids/TileMatcher";
import TileSwapper from "../objects/grids/TileSwapper";
import Tile from "../objects/tiles/Tile";
import TileFactory from "../objects/tiles/TileFactory";

import SimulationController from "../simulation/SimulationController";
import TweenSimulation from "../simulation/TweenSimulation";


class GameScene extends Phaser.Scene {
    // Variables

    private tileGrid : TileGrid;
    private tileMatcher: TileMatcher;
    private tileSwapper: TileSwapper;


    private simulationController: SimulationController;

    constructor() {
        super({
        key: 'GameScene'
        });
    }

    init(): void {
        // Init variables

        this.simulationController = new SimulationController(this);

        // set background color
        this.cameras.main.setBackgroundColor(0x78aade);

        // Init grid with tiles
        this.tileGrid = new TileGrid(this, 400, 100, CONST.gridWidth, CONST.gridHeight, CONST.tileWidth, CONST.tileHeight,
            new TileFactory(this, candyColors)); 
        this.tileMatcher = new TileMatcher();
        this.tileSwapper = new TileSwapper(this.tileGrid);


        // Input
        this.input.on('gameobjectdown', this.tileSwapper.selectTile, this.tileSwapper);

        const onTileAdded = (tile: Tile, x: number, y: number, endX: number, endY: number) => {
            //console.log("Tile added", tile.texture.key, "at", x, y, "to", endX, endY);  
            this.tweenDropdownTile(tile, y, endY);
        }

        this.tileGrid.on('tileAdded', onTileAdded);

        this.tileGrid.on('tileMoved', onTileAdded);

        this.tileGrid.initializeGrid();

        
        const tileSwappedCallback = () => {
            this.checkMatches();
        }
        this.tileGrid.on('tilesSwapped', tileSwappedCallback);

        // Start the simulation
        const onComplete = () => {
            console.log("Simulation complete");
            this.simulationController.off('complete', onComplete);
            this.checkMatches();
        };

        this.simulationController.on('complete', onComplete);
        this.simulationController.startSimulation(true);
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
            this.tileSwapper.resetSelectedTile();

            this.simulationController.startSimulation(true);
            const onComplete = () => {
                this.simulationController.off('complete', onComplete);
                this.checkMatches();
            };
    
            this.simulationController.on('complete', onComplete);
            this.simulationController.startSimulation(true);
        } else {
            // No match so just swap the tiles back to their original position and reset
            this.tileSwapper.unswapTiles();
            this.tileSwapper.resetSelectedTile();
            this.tileSwapper.setCanMove(true);
        }
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