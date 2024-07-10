import { GameObjects, Scene } from "phaser";
import TileGrid from "../objects/grids/TileGrid";
import TileSwapper from "../objects/grids/TileSwapper";
import Tile from "../objects/tiles/Tile";

class GameInputHandler extends Phaser.Events.EventEmitter {
    private tileSwapper: TileSwapper;
    private selectingTile: Tile | null;
    private tileHovered : Tile | null;

    constructor(scene: Scene, tileSwapper : TileSwapper) {
        super();
        this.tileSwapper = tileSwapper;
        this.registerInputEvents(scene);
    }

    private registerInputEvents(scene: Scene): void {
        // Existing gameobjectdown event
        scene.input.on('gameobjectdown', (pointer: any, gameobject: Tile, event: any) => {

            if (this.tileSwapper.getCanMove() === true) {
                this.tileSwapper.selectTile(gameobject);
                this.selectingTile = gameobject;
            }

        });

        scene.input.on('gameobjectup', (pointer: any, gameobject: Tile, event: any) => {
            if (this.tileSwapper.getCanMove() && this.selectingTile && this.selectingTile !== gameobject) {
                this.tileSwapper.selectTile(gameobject);
                this.selectingTile = null;
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