import { GameObjects } from "phaser";
import Tile from "../tiles/Tile";
import TileSimulation from "./TileSimulation";
import TileGrid from "../grids/TileGrid";
import TilePlaceholder from "./TilePlaceholder";

class TileSquareShuffleSimulation extends TileSimulation {
    private tileGrid: TileGrid;
    private size: number;
    private duration: number;
    private x: number;
    private y: number;

    private callback: () => void;

    constructor(scene: Phaser.Scene, tileGrid: TileGrid, x: number, y: number, size: number, duration: number, callback: () => void = () => {}) {
        super(scene, tileGrid.getTileGrid());
        this.tileGrid = tileGrid;
        this.x = x;
        this.y = y;
        this.size = size;
        this.duration = duration;
        this.callback = callback;
    }

    public start(): void {
        super.start();

        let inPlaceholders: TilePlaceholder[] = [];
        let outPlaceholders: TilePlaceholder[] = [];

        let tiles = this.getFlattenTiles();
        tiles.forEach((tile) => {
            tile.disableTileInteraction();
            let worldPosition = this.tileGrid.getWorldPositionFromTile(tile);
            let index = this.tileGrid.getTileIndex(tile);

            if (index === null) {
                console.error('TileSquareShuffleSimulation: Tile is not in the grid');
                return;
            }

            this.tileGrid.removeTile(tile);
            tile.setPosition(worldPosition.x, worldPosition.y);
            inPlaceholders.push(new TilePlaceholder(this.scene, worldPosition.x, worldPosition.y, index));
            outPlaceholders.push(new TilePlaceholder(this.scene, this.x, this.y, index));
        });

        Phaser.Utils.Array.Shuffle(tiles);
        Phaser.Utils.Array.Shuffle(outPlaceholders);
        const inPlaceholderGroup = this.scene.add.group(inPlaceholders);
        const outPlaceholderGroup = this.scene.add.group(outPlaceholders);

        const tileGroup = this.scene.add.group(tiles);

        const square = new Phaser.Geom.Rectangle(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

        Phaser.Actions.PlaceOnRectangle(inPlaceholderGroup.getChildren(), square);

        let count = 0;
        tiles.forEach((tile, index) => {
            const inPlaceholder = inPlaceholders[index];
            const inMatrix = inPlaceholder.getWorldTransformMatrix();

            const outPlaceholder = outPlaceholders[index];
            const outWorldPosition = this.tileGrid.getWorldPositionFromIndex(outPlaceholder.index.x, outPlaceholder.index.y);

            this.scene.tweens.chain({
                tweens: [{
                    targets: tile,
                    x: inMatrix.tx,
                    y: inMatrix.ty,
                    ease: Phaser.Math.Easing.Cubic.InOut,
                    duration: this.duration / 4,
                },{
                    targets: square,
                    value: {from: 0, to: 1},
                    ease: Phaser.Math.Easing.Linear,
                    duration: this.duration / 2,
                    onUpdate: (tween) => {
                        let value = tween.getValue();

                        value = value + index / tiles.length;
                        if (value > 1) {
                            value -= 1;
                        }
                        let point : Phaser.Geom.Point = new Phaser.Geom.Point();
                        square.getPoint(value, point);
                        

                        // Translate point to origin for rotation
                        let range = Math.sqrt((point.x - square.centerX)**2 + (point.y - square.centerY)**2);
                        
                        // Angle to rotate, in radians. Example: 45 degrees = PI / 4
                        let currentAngle = Math.atan((point.y - square.centerY)/(point.x - square.centerX));
                        let angle = Math.atan2((point.y - square.centerY),(point.x - square.centerX)) + Math.PI * 2 * tween.getValue(); // Adjust the angle as needed

                        // Rotate the point
                        let rotatedX = range * Math.cos(angle);
                        let rotatedY = range * Math.sin(angle);

                        // Translate the point back
                        point.x = rotatedX + square.centerX;
                        point.y = rotatedY + square.centerY;


                        tile.setPosition(point.x, point.y);
                    }
                },{
                    targets: tile,
                    x: outWorldPosition.x,
                    y: outWorldPosition.y,
                    ease: Phaser.Math.Easing.Cubic.InOut,
                    duration: this.duration/4          

                }],
                onComplete: () => {
                    this.tileGrid.addTileAtIndex(tile, outPlaceholder.index.x, outPlaceholder.index.y);
                    tile.enableTileInteraction();

                    if (++count === tiles.length) {
                        this.callback();
                    }
                }
            });
        });
    }
}

export default TileSquareShuffleSimulation;