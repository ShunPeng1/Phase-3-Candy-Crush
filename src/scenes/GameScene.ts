import CONST, { CandyColorKey, candyColors } from "../const/const";
import GameInputHandler from "../handlers/GameInputHandler";
import TileGrid from "../objects/grids/TileGrid";
import TileGridDirector from "../objects/simulations/TileGridDirector";
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
import ConffetiParticleEmitter from "../objects/particles/ConffetiParticleEmitter";

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

    private isReachTargetedScore : boolean = false;

    private progressUi : ProgressUi;

    constructor() {
        super({ key: 'GameScene' });
    }

    

    create(): void {
        this.initializeVariables();
        this.initializeBindEvents();
        this.setBackground();
        this.initializeGrid();
        
        this.startCheckMatch();
    }

    private initializeVariables(): void {
        this.simulationController = new SimulationController(this);
        this.scoreController = new ScoreController(50, 1);

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

    private initializeBindEvents(): void {
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

        this.scoreController.on(ScoreController.TARGET_SCORE_REACHED_EVENT, () => {
            this.isReachTargetedScore = true;
            this.scoreController.setEnable(false);
        });


    }

    private startCheckMatch(): void {
        
        this.tileSwapper.setCanMove(false);

        let isMatch = false;

        const onComplete = () => {
            isMatch = this.checkMatches();
        };

        const onEnd = () => {
            if (isMatch) {
                this.startCheckMatch();
            }
            else if (this.isReachTargetedScore) {
                this.isReachTargetedScore = false;
                this.scoreController.setEnable(true);
                this.scoreController.setCurrentScore(0);
                
                shuffleTiles();
            }
            else{
                checkForInputable();
            }
        }

        const shuffleTiles = () => {
            this.tileGridDirector.startShuffle(690, 370, 5000, () =>{
                let isMatchAfterShuffle = this.checkMatches();
                if (isMatchAfterShuffle) {
                    this.startCheckMatch();
                }
                else{
                    checkForInputable();
                    
                }
            });

            
            let conffeti1 = new ConffetiParticleEmitter(this, 0, 800, 4000, new Phaser.Math.Vector2(1, -2), 900, 30, 5);
            let conffeti2 = new ConffetiParticleEmitter(this, 1400, 800, 4000, new Phaser.Math.Vector2(-1, -2), 900, 30, 5);
        }

        const checkForInputable = () => {
            let potentialMatches = this.tileMatcher.getPotentialMatches();
            if (potentialMatches.length == 0) {
                shuffleTiles();
            }
            else{
                this.tileSwapper.setCanMove(true);
            }
        }

        this.simulationController.startSimulation(onComplete, onEnd);
    
    }


    private checkMatches(): boolean {
        let matches = this.tileMatcher.getMatches();

        if (matches.length > 0) {
            let originTileToPosition = new Map<Tile, {x : number, y : number}>();
            let originTileSpecialTile = new Map<Tile, Tile>();
            matches.forEach((match) => {
                if (match.specialTileType !== "NONE") {
                    originTileToPosition.set(match.originTile, {x: match.originTile.x, y: match.originTile.y});
                }

                this.tileGrid.popTiles(match.matchTiles);
            });
            matches.forEach((match) => {
                //console.log("Match", match.count, match.specialTileType, this.tileGrid.getTileIndex(match.originTile), match.matchTilesExceptOrigin.map(tile => this.tileGrid.getTileIndex(tile)));
                if (match.specialTileType !== "NONE") {
                    let specialTile= this.tileFactory.createSpecialTile(match.originTile.getColor() as CandyColorKey, match.specialTileType, match.originTile.x, match.originTile.y);
                    this.tileGrid.addTileAtLocalPosition(specialTile, originTileToPosition.get(match.originTile)!.x, originTileToPosition.get(match.originTile)!.y);

                    let tileEffects = match.matchTilesExceptOrigin.map(tile => tile.getTileEffect()) as ITileEffect[];
                    specialTile.setAppear(tileEffects);

                    originTileSpecialTile.set(match.originTile, specialTile);
                }
                else{
                }
            });

            this.tileGrid.gravitateTile();
            this.tileGrid.fillEmptyGridWithTile();
            
            matches.forEach((match) => {
                match.matchTiles.forEach((tile) => {
                    if (match.specialTileType !== "NONE") {
                        this.tileGrid.destroyPopTile(tile, originTileSpecialTile.get(match.originTile)!.getTileEffect(), true);
                    }
                    else{
                        this.tileGrid.destroyPopTile(tile);
                    }

                });
            });

            return true;
        }

        return false;
    }

    private checkSwap(firstSelectedTile: Tile, secondSelectedTile : Tile) : boolean {
        let firstType = firstSelectedTile.getTileEffect().type;
        let secondType = secondSelectedTile.getTileEffect().type;
        
        if (firstType === "NONE" && secondType === "NONE") {
            return false;
        }

        if (firstType === "NONE" && secondType !== "COLOR_CLEAR") {
            return false;
        }

        if (secondType === "NONE" && firstType !== "COLOR_CLEAR") {
            return false;
        }
        
        if (firstType === "NONE"){
            const temp = firstSelectedTile;
            firstSelectedTile = secondSelectedTile;
            secondSelectedTile = temp;
        }

        this.tileGrid.swapPopTiles(firstSelectedTile, secondSelectedTile);

                
        this.tileGrid.gravitateTile();
        this.tileGrid.fillEmptyGridWithTile();
        
        this.tileGrid.destroyPopTile(firstSelectedTile);
        this.tileGrid.destroyPopTile(secondSelectedTile, firstSelectedTile.getTileEffect(), false);

        return true;

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
            //console.log("Disable Tile Interaction")
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
                    //console.log("Enable Tile Interaction")
                    
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

        let isMatch = false;
        let isSwapSpecialTile = false;
        const onComplete = () => {
            isSwapSpecialTile = this.checkSwap(firstSelectedTile, secondSelectedTile);
            if (isSwapSpecialTile) {
                return;
            }
            else{
                isMatch = this.checkMatches();
            }
        };

        const onEnd = () => {

            if (!isSwapSpecialTile && !isMatch) {
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


        this.simulationController.startSimulation(onComplete, onEnd);
    }
}

export default GameScene;