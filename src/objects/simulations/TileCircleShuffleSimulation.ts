import { GameObjects } from "phaser";
import Tile from "../tiles/Tile";
import TileSimulation from "./TileSimulation";
import TileGrid from "../grids/TileGrid";
import TilePlaceholder from "./TilePlaceholder";

class TileCircleShuffleSimulation extends TileSimulation {
    private tileGrid : TileGrid;
    private radius: number;
    private duration: number;
    private x: number;
    private y: number;

    private callback : ()=>void;


    constructor(scene: Phaser.Scene, tileGrid : TileGrid, x: number, y: number, radius: number, duration : number, callback : ()=>void = () =>{}) {
        super(scene, tileGrid.getTileGrid());
        this.tileGrid = tileGrid;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.duration = duration;
        this.callback = callback;
    }
    
    public start(): void {
        super.start();

        let placeholders : TilePlaceholder[] = []; 
        
        let tiles = this.getFlattenTiles();
        tiles.forEach((tile) => {
            tile.disableTileInteraction();
            let worldPosition = this.tileGrid.getWorldPositionFromTile(tile);
            let index = this.tileGrid.getTileIndex(tile);

            if (index === null) {
                console.error('TileCircleShuffleSimulation: Tile is not in the grid');
                return;
            }

            this.tileGrid.removeTile(tile);
            tile.setPosition(worldPosition.x, worldPosition.y);
            placeholders.push(new TilePlaceholder(this.scene, worldPosition.x, worldPosition.y, index));
        });

        Phaser.Utils.Array.Shuffle(placeholders);
        const placeholderGroup = this.scene.add.group(placeholders);
        
        const tileGroup = this.scene.add.group(tiles);

        const circle = new Phaser.Geom.Circle(this.x, this.y, this.radius);

        Phaser.Actions.PlaceOnCircle(placeholderGroup.getChildren(), circle);


        let count = 0;
        tiles.forEach((tile, index) => {
            const placeholder = placeholders[index];
            const matrix = placeholder.getWorldTransformMatrix();
            const worldPosition = this.tileGrid.getWorldPositionFromIndex(placeholder.index.x, placeholder.index.y);
                        

            this.scene.tweens.chain({
                tweens : [{
                targets: tile,
                x: matrix.tx,
                y: matrix.ty,
                ease: 'Cubic.easeInOut',
                duration: this.duration/4,
                },{

                targets: circle,
                radius: this.radius,
                ease: 'Linear',
                duration: this.duration/2,
                onUpdate: () => {
                    Phaser.Actions.RotateAroundDistance(tileGroup.getChildren(), { x: this.x, y: this.y }, 0.0006, circle.radius);
                }},{
                    targets: tile,
                    x: worldPosition.x,
                    y: worldPosition.y,
                    ease: 'Cubic.easeInOut',
                    duration: this.duration/4
                                

                }],
                onComplete: () => {
                    this.tileGrid.addTileAtIndex(tile, placeholder.index.x, placeholder.index.y);
                    tile.enableTileInteraction();
                    
                    if (++count === tiles.length) {
                        this.callback();
                    }
                }
            });
        });


    }

    
}

export default TileCircleShuffleSimulation;
