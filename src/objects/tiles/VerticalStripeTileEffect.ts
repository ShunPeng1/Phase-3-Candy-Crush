import { Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";
import TweenChainSimulation from "../../simulation/TweenChainSimulation";

class VerticalStripeTileEffect extends TileEffect {
    constructor(scene : Scene, tile : Tile, color: string, texture: string) {
        super(scene, tile, color, texture);
    }

    
    public onTilePop(): void {
        let tileGrid = this.tile.getTileGrid();
        
        let tileIndex = tileGrid.getTileIndex(this.tile)!;

        for (let i = 0; i < tileGrid.getRowCount(); i++) {
            if (i == tileIndex.y) continue;
            let tile = tileGrid.getTileAtIndex(tileIndex.x, i);
            if (tile != null && tile != this.tile) {
                tileGrid.popTiles([tile]);
            }
        }

    }

    public onTileDestroy(): void {
        let simulationController = this.scene.data.get("simulationController") as SimulationController;
        let matrix = this.tile.getWorldPosition();
        let tileGrid = this.tile.getTileGrid();
        let popSet = new Set<number>();
        popSet.add(tileGrid.y);

        
        let stripeDestroyDown = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyDown.setRotation(Math.PI/2);
        stripeDestroyDown.setOrigin(0, 0.5);
        

        const dynamicDestroy = (tween : Phaser.Tweens.Tween) => {
            const value = tween.getValue();
            let tile = tileGrid.getTileAtWorldPosition(matrix.tx, value);
            if (tile != null && !popSet.has(tile.y)) {
                popSet.add(tile.y);
                tileGrid.destroyPopTile(tile);
            }
        }
    
        
        let chainDown = this.scene.tweens.chain({
            tweens: [{
                targets: stripeDestroyDown,
                y : { from: matrix.ty, to: matrix.ty + 200},
                scaleY: {from: 1, to: 1.5 },
                scaleX: {from: 1, to: 5 },
                duration: 350,
                ease: 'Cubic.in'
            },{
                targets: stripeDestroyDown,
                y: { from: matrix.ty + 200, to: matrix.ty + 400},
                duration: 350,
                ease: 'Cubic.out'
            }]
        });

        let stripeDestroyUp = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyUp.setRotation(-Math.PI/2);
        stripeDestroyUp.setOrigin(0, 0.5);

        let chainUp = this.scene.tweens.chain({
            tweens: [{
                targets: stripeDestroyUp,
                y : { from: matrix.ty, to: matrix.ty - 200},
                scaleY: {from: 1, to: 1.5 },
                scaleX: {from: 1, to: 5 },
                duration: 350,
                ease: 'Cubic.in'
            },{
                targets: stripeDestroyUp,
                y: { from: matrix.ty - 200, to: matrix.ty - 400},
                duration: 350,
                ease: 'Cubic.out'
            }]
        });

        // Adjust these tweens for horizontal movement
        let destroyUp =this.scene.add.tween({
            targets: this.tile,
            values: { from: matrix.ty, to: matrix.ty - 600},
            duration: 700,
            ease: 'Cubic.easeInOut',
            onUpdate: dynamicDestroy
        });

        let destroyDown =this.scene.add.tween({
            targets: this.tile,
            values: { from: matrix.ty, to: matrix.ty + 600},
            duration: 700,
            ease: 'Cubic.easeInOut',
            onUpdate: dynamicDestroy
        });

        simulationController.addSimulation(new TweenChainSimulation(chainDown));
        simulationController.addSimulation(new TweenChainSimulation(chainUp));
        simulationController.addSimulation(new TweenSimulation(destroyUp));
        simulationController.addSimulation(new TweenSimulation(destroyDown));


        this.scene.time.delayedCall(700, () => {
            stripeDestroyDown.destroy();
            stripeDestroyUp.destroy();
        });
    }

}


export default VerticalStripeTileEffect;