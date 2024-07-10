import { GameObjects, Scene } from "phaser";
import TileGrid from "../objects/grids/TileGrid";
import TileSwapper from "../objects/grids/TileSwapper";
import Tile from "../objects/tiles/Tile";

class GameInputHandler extends Phaser.Events.EventEmitter {
    private scene: Scene;
    private tileSwapper: TileSwapper;
    private selectingTile: Tile | null;
    private tileHovered : Tile | null;
    private indicator: GameObjects.Sprite;
    

    constructor(scene: Scene, tileSwapper : TileSwapper) {
        super();
        this.scene = scene;
        this.tileSwapper = tileSwapper;
        this.selectingTile = null;
        this.tileHovered = null;

            
        this.scene.anims.create({
            key: 'indicator-animation',
            frames: [
                { key: 'indicator-0' },
                { key: 'indicator-1' },
                { key: 'indicator-2' },
                { key: 'indicator-3' }
                // Add more frames as needed
            ],
            frameRate: 10,
            repeat: -1 // Loop indefinitely
        });

        this.indicator = this.scene.add.sprite(0, 0, 'indicator-0');
        this.indicator.setVisible(false);
        this.indicator.setScale(2.3);
        this.indicator.play('indicator-animation');

        this.registerInputEvents(scene);


    }

    private registerInputEvents(scene: Scene): void {
        // Existing gameobjectdown event
        scene.input.on('gameobjectdown', (pointer: any, gameobject: Tile, event: any) => {

            if (this.tileSwapper.getCanMove() === true) {
                this.tileSwapper.selectTile(gameobject);

                if (!this.tileSwapper.checkIsSwapped()){
                    this.selectingTile = gameobject;
                    this.indicator.setVisible(true);
                    let worldPosition = this.selectingTile.getWorldTransformMatrix()
                    this.indicator.setPosition(worldPosition.tx, worldPosition.ty);
                
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
                    this.tileHovered = gameObject; 
                }  
                
            });
        });

        // Optionally, handle pointerout for when the mouse leaves a game object
        scene.input.on('pointerout', (pointer: any, gameObjects: any[]) => {
            //gameObjects.forEach((gameObject: { onHoverOut: (arg0: any) => void; }) => {
            gameObjects.forEach((gameObject: GameObjects.GameObject): void => {
            
            
                if (gameObject instanceof Tile){
                    this.tileHovered = gameObject; 
                }  
                


            });
        });
    }
}


export default GameInputHandler;