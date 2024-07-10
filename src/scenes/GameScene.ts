import CONST, { CandyColorKey, candyColors } from "../const/const";
import GameInputHandler from "../handlers/GameInputHandler";
import TileGrid from "../objects/grids/TileGrid";
import TileMatcher from "../objects/grids/TileMatcher";
import TileSwapper from "../objects/grids/TileSwapper";
import Tile from "../objects/tiles/Tile";
import TileFactory from "../objects/tiles/TileFactory";
import SimulationController from "../simulation/SimulationController";
import TweenSimulation from "../simulation/TweenSimulation";

class GameScene extends Phaser.Scene {
    private tileGrid: TileGrid;
    private tileFactory: TileFactory;
    private tileMatcher: TileMatcher;
    private tileSwapper: TileSwapper;
    private simulationController: SimulationController;
    private gameInputHandler : GameInputHandler;

    constructor() {
        super({ key: 'GameScene' });
    }

    

    create(): void {
        this.initializeVariables();
        this.setBackground();
        this.initializeGrid();
        
        this.startCheckMatch();
    }

    private initializeVariables(): void {
        this.simulationController = new SimulationController(this);
        this.tileFactory = new TileFactory(this, candyColors, CONST.tileWidth, CONST.tileHeight);
        this.tileGrid = new TileGrid(this, 400, 100, CONST.gridWidth, CONST.gridHeight, CONST.tileWidth, CONST.tileHeight,
            this.tileFactory, ["item-spot-01", "item-spot-02"]);
        this.tileMatcher = new TileMatcher(this.tileGrid);
        this.tileSwapper = new TileSwapper(this, this.tileGrid);

        this.gameInputHandler = new GameInputHandler(this, this.tileSwapper);
    }

    private setBackground(): void {
        this.cameras.main.setBackgroundColor(0x78aade);
        
        const background = this.add.image(0, 0, 'background-01');
        background.setOrigin(0, 0);
        background.setDisplaySize(this.game.canvas.width, this.game.canvas.height);
        background.setDepth(-100);
    }

    private initializeGrid(): void {
        this.tileGrid.on('tileAdded', this.tweenDropdownTile, this);
        this.tileGrid.on('tileMoved', this.tweenDropdownTile, this);
        this.tileGrid.on('tilesSwapped', this.tweenSwapTiles, this);

        this.tileGrid.initializeTiles();
    }


    private checkMatches(): boolean {
        let matches = this.tileMatcher.getMatches();

        if (matches.length > 0) {
            matches.forEach((match) => {
                
                //console.log("Match", match.count, match.specialTileType, this.tileGrid.getTileIndex(match.originTile), match.matchTilesExceptOrigin.map(tile => this.tileGrid.getTileIndex(tile)));
                if (match.specialTileType !== "NONE") {
                    let specialTile= this.tileFactory.createSpecialTile(match.originTile.tileType.color as CandyColorKey, match.specialTileType, match.originTile.x, match.originTile.y);
                    this.tileGrid.replaceTile(match.originTile, specialTile);
                    this.tileGrid.removeTiles(match.matchTilesExceptOrigin);

                }
                else{
                    this.tileGrid.removeTiles(match.matchTiles);
                }
            });


            this.tileGrid.gravitateTile();
            this.tileGrid.fillEmptyWithTile();
            
            this.startCheckMatch();

            return true;
        }

        return false;
    }

    private startCheckMatch(): void {
        
        this.tileSwapper.setCanMove(false);

        const onComplete = () => {
            this.simulationController.off('complete', onComplete);
            this.tileSwapper.setCanMove(true);
            this.checkMatches();
        };

        this.simulationController.on('complete', onComplete);
        this.simulationController.startSimulation(true);
    }


    private tweenDropdownTile(tile: Tile, fromX: number, fromY: number, endX: number, endY: number): void {
        const tweenSimulation = new TweenSimulation(this.tweens.add({
            targets: tile,
            y: (endY+0.5) * CONST.tileHeight,
            ease: 'Linear',
            duration: 150 * (endY - fromY),
            repeat: 0,
            yoyo: false
        }));

        this.simulationController.addSimulation(tweenSimulation);
    }

    private tweenSwapTiles(firstSelectedTile: Tile, secondSelectedTile: Tile): void {
        const tweenSimulation1 = new TweenSimulation(this.add.tween({
            targets: firstSelectedTile,
            x: secondSelectedTile.x,
            y: secondSelectedTile.y,
            ease: 'Linear',
            duration: 250,
            repeat: 0,
            yoyo: false
        }));

        const tweenSimulation2 = new TweenSimulation(this.add.tween({
            targets: secondSelectedTile,
            x: firstSelectedTile.x,
            y: firstSelectedTile.y,
            ease: 'Linear',
            duration: 250,
            repeat: 0,
            yoyo: false
        }));

        this.simulationController.addSimulation(tweenSimulation1);
        this.simulationController.addSimulation(tweenSimulation2);

        const onComplete = () => {
            this.simulationController.off('complete', onComplete);
            const match = this.checkMatches();

            if (!match) {
                if (this.tileSwapper.checkIsSwapped()) {
                    this.tileSwapper.unswapTiles();
                } else {
                    this.tileSwapper.resetSelectedTile();
                    this.tileSwapper.setCanMove(true);
                }
            } else {
                this.tileSwapper.resetSelectedTile();
            }
        };

        this.simulationController.on('complete', onComplete);
        this.simulationController.startSimulation(true);
    }
}

export default GameScene;