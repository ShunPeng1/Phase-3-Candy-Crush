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

        
        this.tileGrid.on('tilesSwapped', this.tweenSwapTiles, this);

        
        this.tileSwapper.setCanMove(false);
        // Start the simulation
        const onComplete = () => {
            console.log("Simulation complete");
            this.simulationController.off('complete', onComplete);
            this.tileSwapper.setCanMove(true);
            this.checkMatches();
        };

        this.simulationController.on('complete', onComplete);
        this.simulationController.startSimulation(true);
    }

    

    private checkMatches(): boolean {
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
            this.tileSwapper.setCanMove(false);

            this.simulationController.startSimulation(true);
            const onComplete = () => {
                this.simulationController.off('complete', onComplete);
                this.tileSwapper.setCanMove(true);
                this.checkMatches();
            };
    
            this.simulationController.on('complete', onComplete);
            this.simulationController.startSimulation(true);

            return true;
        }

        return false;
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

    private tweenSwapTiles(firstSelectedTile: Tile, secondSelectedTile: Tile): void {
        let tweenSimulation1 = new TweenSimulation(this.add.tween({
            targets: firstSelectedTile,
            x: secondSelectedTile.x,
            y: secondSelectedTile.y,
            ease: 'Linear',
            duration: 400,
            repeat: 0,
            yoyo: false
        }));

        let tweenSimulation2 = new TweenSimulation(this.add.tween({
            targets: secondSelectedTile,
            x: firstSelectedTile.x,
            y: firstSelectedTile.y,
            ease: 'Linear',
            duration: 400,
            repeat: 0,
            yoyo: false,
        }));

        this.simulationController.addSimulation(tweenSimulation1);
        this.simulationController.addSimulation(tweenSimulation2);
        
        const onComplete = () => {
            console.log("Swap complete");
            this.simulationController.off('complete', onComplete);
            let match = this.checkMatches();

            if (!match) {
                console.log("No match found");
                // No match so just swap the tiles back to their original position and reset
                if (this.tileSwapper.checkIsSwapping()){
                    console.log("Unswapping tiles");
                    this.tileSwapper.unswapTiles();
                }
                else{
                    console.log("Resetting selected tiles");
                    this.tileSwapper.resetSelectedTile();
                    this.tileSwapper.setCanMove(true);
                }
            }
            else{
                console.log("Match found");
                this.tileSwapper.resetSelectedTile();
            }
        };

        this.simulationController.on('complete', onComplete);
        this.simulationController.startSimulation(true);
    }
}


export default GameScene;