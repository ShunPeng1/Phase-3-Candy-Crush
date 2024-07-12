import { GameObjects, Scene } from "phaser";
import TileGrid from "../objects/grids/TileGrid";
import TileSwapper from "../objects/grids/TileSwapper";
import Tile from "../objects/tiles/Tile";

class GameInputHandler extends Phaser.Events.EventEmitter {
    private scene: Scene;
    private tileSwapper: TileSwapper;

    private downPosition: Phaser.Math.Vector2;
    private selectingTile: Tile | null;
    private indicator: GameObjects.Sprite;
    
    private timer: Phaser.Time.TimerEvent;
    private timeoutDuration = 3000;

    public static readonly NO_INPUT_PERIOD_EVENT = 'no input period';
    public static readonly CLICKED_INPUT_EVENT = 'clicked input';

    constructor(scene: Scene, tileSwapper : TileSwapper) {
        super();
        this.scene = scene;
        this.tileSwapper = tileSwapper;
        this.selectingTile = null;
        


        this.indicator = this.scene.add.sprite(0, 0, 'indicator-0');
        this.indicator.setVisible(false);
        this.indicator.setScale(2.3);
        this.indicator.play('indicator-animation');

        this.createTimer();

        this.registerInputEvents(scene);

        this.on(GameInputHandler.CLICKED_INPUT_EVENT, () => {
            this.resetTimer();
        });
    }

    private createTimer(): void {
        this.timer = this.scene.time.addEvent({
            delay: this.timeoutDuration,
            loop: true,
            callback: () => {
                this.emit(GameInputHandler.NO_INPUT_PERIOD_EVENT);
            },
            
        });

        
    }

    private registerInputEvents(scene: Scene): void {
        // Existing gameobjectdown event
        scene.input.on('gameobjectdown', (pointer: any, gameobject: Tile, event: any) => {
            this.emit(GameInputHandler.CLICKED_INPUT_EVENT);

            if (this.tileSwapper.getCanMove() === true) {
                this.tileSwapper.selectTile(gameobject);

                if (!this.tileSwapper.checkIsSwapped()){
                    this.selectingTile = gameobject;
                    this.indicator.setVisible(true);
                    let worldPosition = this.selectingTile.getWorldTransformMatrix()
                    this.indicator.setPosition(worldPosition.tx, worldPosition.ty);
                    this.downPosition = new Phaser.Math.Vector2(pointer.x, pointer.y);
                }
                else{
                    this.selectingTile = null;
                    this.indicator.setVisible(false);
                }

                if (!this.tileSwapper.checkFirstTileSelected()){
                    
                    this.selectingTile = null;
                    this.indicator.setVisible(false);
                }
            }

        });

        scene.input.on('gameobjectup', (pointer: any, gameobject: Tile, event: any) => {
            this.emit(GameInputHandler.CLICKED_INPUT_EVENT);
            
            if (this.tileSwapper.getCanMove() && this.selectingTile && this.selectingTile !== gameobject) {
                this.tileSwapper.selectTile(gameobject);
                this.selectingTile = null;
                this.indicator.setVisible(false);
            }
        });


        // New hover event (pointerover)
        scene.input.on('pointerover', (pointer: any, gameObjects: any[]) => {
            gameObjects.forEach((gameObject: GameObjects.GameObject): void => {
            
                if (gameObject instanceof Tile){

                    if (this.tileSwapper.getCanMove() && this.selectingTile && this.selectingTile !== gameObject) {
                        this.tileSwapper.selectTile(gameObject);
                        this.selectingTile = null;
                        this.indicator.setVisible(false);
                    }
                }  
                
            });
        });

    }

    public resetTimer(): void {
        this.timer.reset({
            delay: this.timeoutDuration,
            loop: true,
            callback: () => {
                this.emit(GameInputHandler.NO_INPUT_PERIOD_EVENT);
            }}
        );
    }

    public stopTimer(): void {
        this.timer.paused = true;
        this.timer.reset({
            delay: this.timeoutDuration,
            loop: true,
            callback: () => {
                this.emit(GameInputHandler.NO_INPUT_PERIOD_EVENT);
            }}
        );
    }

    public startTimer(): void {
        this.timer.paused = false;
    }
}


export default GameInputHandler;