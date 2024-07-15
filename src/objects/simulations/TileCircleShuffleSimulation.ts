import { GameObjects } from "phaser";
import Tile from "../tiles/Tile";
import TileSimulation from "./TileSimulation";

class TileCircleShuffleSimulation extends TileSimulation {
    private radius: number;
    private duration: number;
    private x: number;
    private y: number;


    constructor(scene: Phaser.Scene, tiles : (Tile|null)[][], x: number, y: number, radius: number, duration: number) {
        super(scene, tiles);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.duration = duration;

    }
    
    public start(): void {
        super.start();

        let placeholders : GameObjects.GameObject[] = []; 
        let tiles = this.getFlattenTiles();
        tiles.forEach((tile) => {
            tile.disableTileInteraction();
            placeholders.push(new GameObjects.Graphics(this.scene));
        });

        
        const placeholderGroup = this.scene.add.group(placeholders);
        
        const circle = new Phaser.Geom.Circle(this.x, this.y, this.radius);

        Phaser.Actions.PlaceOnCircle(placeholderGroup.getChildren(), circle);


        let once = true;
        tiles.forEach((tile, index) => {
            const placeholder = placeholders[index] as GameObjects.Graphics;
            const matrix = placeholder.getWorldTransformMatrix();
            

            this.scene.tweens.add({
                targets: tile,
                x: matrix.tx,
                y: matrix.ty,
                ease: 'Quintic.easeInOut',
                duration: this.duration,
                onComplete: () => {
                    if (!once) return;

                    once = false;
                    const tileGroup = this.scene.add.group(tiles);
                    this.scene.tweens.add({
                        targets: circle,
                        radius: this.radius,
                        ease: 'Quintic.easeInOut',
                        duration: this.duration,
                        yoyo: true,
                        repeat: 1,
                        onUpdate: () => {
                            Phaser.Actions.RotateAroundDistance(tileGroup.getChildren(), { x: this.x, y: this.y }, 0.02, circle.radius);
                        },
                        onComplete: () => {
                            placeholderGroup.destroy(true);
                            tiles.forEach((tile) => {
                                tile.enableTileInteraction();
                            });
                            
                        }
                    });
                }
            });
        });


    }

    
}

export default TileCircleShuffleSimulation;
