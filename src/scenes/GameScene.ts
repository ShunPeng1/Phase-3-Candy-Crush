import CONST, { CandyColorKey, candyColors } from "../const/const";
import GameInputHandler from "../handlers/GameInputHandler";
import TileGrid from "../objects/grids/TileGrid";
import TileGridDirector from "../objects/grids/TileGridDirector";
import TileHinter from "../objects/grids/TileHinter";
import TileMatcher from "../objects/grids/TileMatcher";
import TileSwapper from "../objects/grids/TileSwapper";
import ScoreController from "../objects/score/ScoreController";
import Tile from "../objects/tiles/Tile";
import TileFactory from "../objects/tiles/TileFactory";
import ProgressUi from "../objects/ui/ProgressUi";
import SimulationController from "../simulation/SimulationController";
import TweenChainSimulation from "../simulation/TweenChainSimulation";
import TweenSimulation from "../simulation/TweenSimulation";

class GameScene extends Phaser.Scene {
    private tileGrid: TileGrid;
    private tileFactory: TileFactory;
    private tileMatcher: TileMatcher;
    private tileSwapper: TileSwapper;
    private tileHinter: TileHinter;
    private tileGridDirector: TileGridDirector;
    private simulationController: SimulationController;
    private scoreController: ScoreController;
    private gameInputHandler : GameInputHandler;


    private progressUi : ProgressUi;

    constructor() {
        super({ key: 'GameScene' });
    }

    

    create(): void {
        this.initializeVariables();
        this.bindEvents();
        this.setBackground();
        this.initializeGrid();
        
        this.startCheckMatch();
    }

    private initializeVariables(): void {
        this.simulationController = new SimulationController(this);
        this.scoreController = new ScoreController(50, 1.1);

        this.data.set('simulationController', this.simulationController);
        this.data.set('scoreController', this.scoreController);

        this.tileFactory = new TileFactory(this, candyColors, CONST.tileWidth, CONST.tileHeight);
        this.tileGrid = new TileGrid(this, 400, 70, CONST.gridWidth, CONST.gridHeight, CONST.tileWidth, CONST.tileHeight,
            this.tileFactory, ["item-spot-01", "item-spot-02"]);
        this.tileMatcher = new TileMatcher(this.tileGrid);
        this.tileSwapper = new TileSwapper(this, this.tileGrid);
        this.tileHinter = new TileHinter(this, this.tileMatcher);
        this.gameInputHandler = new GameInputHandler(this, this.tileSwapper);
        this.tileGridDirector = new TileGridDirector(this, this.tileGrid);

        this.progressUi = new ProgressUi(this, 200, 360, 600, 40);
        this.progressUi.setDepth(100);
        
    }

    private setBackground(): void {
        this.cameras.main.setBackgroundColor(0x78aade);
        
        const background = this.add.image(0, 0, 'background-01');
        background.setOrigin(0, 0);
        background.setDisplaySize(this.game.canvas.width + 50, this.game.canvas.height + 50);
        background.setDepth(-100);
    }

    private initializeGrid(): void {
        this.tileGrid.on(TileGrid.TILE_ADD_EVENT, this.tweenDropdownTile, this);
        this.tileGrid.on(TileGrid.TILE_GRAVITATE_EVENT, this.tweenDropdownTile, this);
        this.tileGrid.on(TileGrid.TILE_SWAP_EVENT, this.tweenSwapTiles, this);

        this.tileGrid.initializeTiles();
    }


    private checkMatches(): boolean {
        let matches = this.tileMatcher.getMatches();

        if (matches.length > 0) {
            let map = new Map<Tile, {x : number, y : number}>();
            
            matches.forEach((match) => {
                if (match.specialTileType !== "NONE") {
                    map.set(match.originTile, {x: match.originTile.x, y: match.originTile.y});
                }

                this.tileGrid.popTiles(match.matchTiles);
            });
            matches.forEach((match) => {
                //console.log("Match", match.count, match.specialTileType, this.tileGrid.getTileIndex(match.originTile), match.matchTilesExceptOrigin.map(tile => this.tileGrid.getTileIndex(tile)));
                if (match.specialTileType !== "NONE") {
                    let specialTile= this.tileFactory.createSpecialTile(match.originTile.getColor() as CandyColorKey, match.specialTileType, match.originTile.x, match.originTile.y);
                    this.tileGrid.addTileAtLocalPosition(specialTile, map.get(match.originTile)!.x, map.get(match.originTile)!.y);
                }
                else{
                }
            });

            this.tileGrid.gravitateTile();
            this.tileGrid.fillEmptyGridWithTile();
            
            matches.forEach((match) => {
                match.matchTiles.forEach((tile) => {
                    tile.destroy();
                });
            });

            return true;
        }

        return false;
    }

    private bindEvents(): void {
        let idleCount = 0;
        this.gameInputHandler.on(GameInputHandler.NO_INPUT_PERIOD_EVENT, () => {
            idleCount++;
            if (idleCount % 3 === 0) {
                this.tileGridDirector.startIdle();
            }
            else{
                this.tileHinter.startHintTiles();
            }
            
        });

        

        this.simulationController.on(SimulationController.END_EVENT, () => {
            this.gameInputHandler.startTimer();
        });

        this.simulationController.on(SimulationController.START_EVENT, () => {
            this.gameInputHandler.stopTimer();
        });

        this.scoreController.on(ScoreController.SCORE_CHANGED_EVENT, (currentScore : number, addedScore : number, targetScore : number) => {
            this.progressUi.setProgress(currentScore/targetScore);
        });




    }

    private startCheckMatch(): void {
        
        this.tileSwapper.setCanMove(false);

        const onComplete = () => {
            this.simulationController.off(SimulationController.COMPLETE_EVENT, onComplete);
            
            let isMatch = this.checkMatches();
            
            if (isMatch) {
                this.startCheckMatch();
            }
            else{
                this.tileSwapper.setCanMove(true);
            }
        };

        this.simulationController.on(SimulationController.COMPLETE_EVENT, onComplete);
        this.simulationController.startSimulation();
    }


    private tweenDropdownTile(tile: Tile, fromX: number, fromY: number, endX: number, endY: number): void {
        
        
        const tweenSimulation = new TweenChainSimulation(this.tweens.chain({
            tweens: [{
            targets: tile,
            delay: 1500 / (endY ** 2 + 3),
            y: (endY+0.5) * CONST.tileHeight,
            ease: "Cubic.In", // Directly reference the custom easing function
            duration: Math.max(150 * (endY - fromY), 300),
            repeat: 0,
            yoyo: false
        }],
        onActive: () => {
            console.log("Disable Tile Interaction")
            tile.disableTileInteraction();
        }, 
        onComplete: () => {
            // Squash effect
            
            tile.getMapTween("displaySize")?.stop();
            
            const originalHeight = tile.displayHeight;
            const originalWidth = tile.displayWidth;
            

            let squashTween = this.tweens.add({
                targets: tile,
                y : tile.y - 4 * (endY-fromY),
                displayHeight: originalHeight * 0.8, // Squash the tile a bit
                displayWidth: originalWidth * 1.2, // Compensate for the squashing to maintain volume
                ease: "Quad.Out",
                duration: 100,
                yoyo: true, // Return to original scale
                repeat: 0,
                onComplete: () => {
                    //tile.off('pointerover', pauseTween);
                    //tile.off('pointerout', unpauseTween);
                    console.log("Enable Tile Interaction")
                    
                    tile.removeMapTween("displaySize");
                    tile.enableTileInteraction();
                },
                onStop: () => {
                    tile.setDisplaySize(originalWidth, originalHeight);
                    tile.removeMapTween("displaySize");
                }
            });
            
            tile.addMapTween("displaySize", squashTween);

            
        }}));

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
            this.simulationController.off(SimulationController.COMPLETE_EVENT, onComplete);
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
                this.startCheckMatch();
            }
        };

        this.simulationController.on(SimulationController.COMPLETE_EVENT, onComplete);
        this.simulationController.startSimulation();
    }
}

export default GameScene;