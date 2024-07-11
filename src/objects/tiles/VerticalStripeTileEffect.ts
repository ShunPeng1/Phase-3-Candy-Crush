import { Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";

class VerticalStripeTileEffect extends TileEffect {
    constructor(scene : Scene, tile : Tile, color: string, texture: string) {
        super(scene, tile, color, texture);
    }

    
    public onTilePop(): void {
        let matrix = this.tile.getWorldPosition();
        
        let stripeDestroyDown = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyDown.setRotation(Math.PI/2);
        stripeDestroyDown.setOrigin(0, 0.5);
        
        let tileGrid = this.tile.getTileGrid();
        let popSet = new Set<number>();
        popSet.add(tileGrid.y);

        const dynamicRemove = (tween : Phaser.Tweens.Tween) => {
            const value = tween.getValue();
            let tile = tileGrid.getTileAtWorldPosition(matrix.tx, value);
            if (tile != null && !popSet.has(tile.y)) {
                popSet.add(tile.y);
                tileGrid.removeTiles([tile]);
            }
        }

        const refillTile = () => {
            tileGrid.gravitateTile();
            tileGrid.fillEmptyWithTile();
        }
            
        
        this.scene.tweens.chain({
            tweens: [{
                targets: stripeDestroyDown,
                y : { from: matrix.ty, to: matrix.ty + 200},
                scaleY: {from: 1, to: 1.5 },
                scaleX: {from: 1, to: 5 },
                duration: 350,
                ease: 'Cubic.in',
            },{
                targets: stripeDestroyDown,
                y: { from: matrix.ty + 200, to: matrix.ty + 400},
                duration: 350,
                ease: 'Cubic.out',
            }],
            onComplete: refillTile
        });

        let stripeDestroyUp = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyUp.setRotation(-Math.PI/2);
        stripeDestroyUp.setOrigin(0, 0.5);

        this.scene.tweens.chain({
            tweens: [{
                targets: stripeDestroyUp,
                y : { from: matrix.ty, to: matrix.ty - 200},
                scaleY: {from: 1, to: 1.5 },
                scaleX: {from: 1, to: 5 },
                duration: 350,
                ease: 'Cubic.in',
            },{
                targets: stripeDestroyUp,
                y: { from: matrix.ty - 200, to: matrix.ty - 400},
                duration: 350,
                ease: 'Cubic.out',
            }],
            onComplete: refillTile
        });

        this.scene.add.tween({
            targets: this.tile,
            values: { from: matrix.ty, to: matrix.ty - 600},
            duration: 700,
            ease: 'Cubic.out',
            onUpdate: dynamicRemove
        });

        this.scene.add.tween({
            targets: this.tile,
            values: { from: matrix.ty, to: matrix.ty + 600},
            duration: 700,
            ease: 'Cubic.out',
            onUpdate: dynamicRemove
        });


        this.scene.time.delayedCall(700, () => {
            stripeDestroyDown.destroy();
            stripeDestroyUp.destroy();
        });
    }
}


export default VerticalStripeTileEffect;