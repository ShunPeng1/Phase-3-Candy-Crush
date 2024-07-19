
import Tile from "../tiles/Tile";
import TileSimulation from "./TileSimulation";
import TileGrid from "../grids/TileGrid";
import TilePlaceholder from "./TilePlaceholder";
import CONST from "../../const/const";

class TileHourglassShuffleSimulation extends TileSimulation {
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

        let maskGraphics = this.scene.add.graphics();
        maskGraphics.fillRect(400, 70 , CONST.gridWidth * CONST.tileWidth, (CONST.gridHeight+1) * CONST.tileHeight);
        maskGraphics.fillStyle(0xffffff); // Setting the fill style to white
        
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
            tile.setMask(maskGraphics.createGeometryMask());
            tile.setPosition(worldPosition.x, worldPosition.y);
            inPlaceholders.push(new TilePlaceholder(this.scene, worldPosition.x, worldPosition.y, index));
            outPlaceholders.push(new TilePlaceholder(this.scene, this.x, this.y, index));
        });

        Phaser.Utils.Array.Shuffle(tiles);
        Phaser.Utils.Array.Shuffle(outPlaceholders);
        const inPlaceholderGroup = this.scene.add.group(inPlaceholders);
        const outPlaceholderGroup = this.scene.add.group(outPlaceholders);

        const tileGroup = this.scene.add.group(tiles);

        const points = this.createHourglass(this.x, this.y, this.size );

        inPlaceholders.forEach((value, index) =>{
            let point = this.getPoint(points, index / inPlaceholders.length);
            value.setPosition(point.x, point.y);
        });
        
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
                    targets: tile,
                    values: {from: 0, to: 1},
                    ease: Phaser.Math.Easing.Linear,
                    duration: this.duration / 2,
                    onUpdate: (tween) => {
                        let values = tween.getValue();

                        if (values == undefined){
                            return;
                        }

                        values = values + index / tiles.length;

                        if (values >= 1) {
                            values -= 1;
                        }
                        let point = this.getPoint(points, values);
                        

                        // Translate point to origin for rotation
                        let range = Math.sqrt((point.x - this.x)**2 + (point.y - this.y)**2);
                        
                        // Angle to rotate, in radians. Example: 45 degrees = PI / 4
                        let currentAngle = Math.atan((point.y - this.y)/(point.x - this.x));
                        let angle = Math.atan2((point.y - this.y),(point.x - this.x)) + Math.PI * 2 * tween.getValue(); // Adjust the angle as needed

                        // Rotate the point
                        let rotatedX = range * Math.cos(angle);
                        let rotatedY = range * Math.sin(angle);

                        // Translate the point back
                        point.x = rotatedX + this.x;
                        point.y = rotatedY + this.y


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
                    tile.clearMask();
                    
                    if (++count === tiles.length) {
                        this.callback();
                    }
                }
            });
        });
    }

    private createHourglass(x: number, y: number, size: number): Phaser.Geom.Point[] {
        let point1 = new Phaser.Geom.Point(x, y);
        let point2 = new Phaser.Geom.Point(x + size/2, y + size/2);
        let point3 = new Phaser.Geom.Point(x + size/2, y - size/2);
        let point4 = new Phaser.Geom.Point(x,y);
        let point5 = new Phaser.Geom.Point(x - size/2, y + size/2);
        let point6 = new Phaser.Geom.Point(x - size/2, y - size/2);

        
        return [point1, point2, point3, point4, point5, point6];
    }

    private getPoint(points: Phaser.Geom.Point[], t: number): Phaser.Geom.Point {
        let pointIndex = Math.floor(t * points.length);
        let point = points[pointIndex];
        let nextPointIndex = (pointIndex + 1) % points.length;
        let nextPoint = points[nextPointIndex];
        let localT = (t * points.length) % 1;

        return this.interpolatePoint(point, nextPoint, localT);
    }

    private interpolatePoint(point1: Phaser.Geom.Point, point2: Phaser.Geom.Point, t: number): Phaser.Geom.Point {
        return new Phaser.Geom.Point(point1.x + (point2.x - point1.x) * t, point1.y + (point2.y - point1.y) * t);
    }

}

export default TileHourglassShuffleSimulation;