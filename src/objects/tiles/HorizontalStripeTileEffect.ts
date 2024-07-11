import { Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";
import TweenChainSimulation from "../../simulation/TweenChainSimulation";

class HorizontalStripeTileEffect extends TileEffect {
    constructor(scene: Scene, tile: Tile, color: string, texture: string) {
        super(scene, tile, color, texture);
    }

    public onTilePop(): void {
        let tileGrid = this.tile.getTileGrid();
        
        let tileIndex = tileGrid.getTileIndex(this.tile)!;

        for (let i = 0; i < tileGrid.getColumnCount(); i++) {
            if (i == tileIndex.x) continue;
            let tile = tileGrid.getTileAtIndex(i, tileIndex.y);
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
        popSet.add(tileGrid.x);

        let stripeDestroyRight = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyRight.setOrigin(1, 0.5); // Adjust origin for horizontal movement

        const dynamicDestroy = (tween: Phaser.Tweens.Tween) => {
            const value = tween.getValue();
            let tile = tileGrid.getTileAtWorldPosition(value, matrix.ty);
            if (tile != null && !popSet.has(tile.x)) {
                popSet.add(tile.x);
                tileGrid.destroyPopTile(tile);
            }
        }

        let chainRight = this.scene.tweens.chain({
            tweens: [{
                targets: stripeDestroyRight,
                x: { from: matrix.tx, to: matrix.tx + 500},
                scaleY: {from: 0.8, to: 1.2 },
                scaleX: {from: 1, to: 4 },
                duration: 250,
                ease: 'Cubic.in'
            }, {
                targets: stripeDestroyRight,
                x: { from: matrix.tx + 500, to: matrix.tx + 1000},
                duration: 250,
                ease: 'Cubic.out'
            }]
        });

        let stripeDestroyLeft = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyLeft.setOrigin(0, 0.5); // Adjust origin for horizontal movement
        let chainLeft = this.scene.tweens.chain({
            tweens: [{
                targets: stripeDestroyLeft,
                x: { from: matrix.tx, to: matrix.tx - 500},
                scaleY: {from: 0.8, to: 1.2 },
                scaleX: {from: 1, to: 4 },
                duration: 250,
                ease: 'Cubic.in'
            }, {
                targets: stripeDestroyLeft,
                x: { from: matrix.tx - 500, to: matrix.tx - 1000},
                duration: 250,
                ease: 'Cubic.out'
            }]
        });

        // Adjust these tweens for horizontal movement
        let destroyRight = this.scene.add.tween({
            targets: this.tile,
            values: { from: matrix.tx, to: matrix.tx - 600},
            duration: 500,
            ease: 'Cubic.easeInOut', // Corrected easing function name
            onUpdate: dynamicDestroy
        });

        let destroyLeft = this.scene.add.tween({
            targets: this.tile,
            values: { from: matrix.tx, to: matrix.tx + 600},
            duration: 500,
            ease: 'Cubic.easeInOut', // Corrected easing function name
            onUpdate: dynamicDestroy
        });

        simulationController.addSimulation(new TweenChainSimulation(chainRight));
        simulationController.addSimulation(new TweenChainSimulation(chainLeft));
        simulationController.addSimulation(new TweenSimulation(destroyRight));
        simulationController.addSimulation(new TweenSimulation(destroyLeft));


        this.scene.time.delayedCall(500, () => {
            stripeDestroyRight.destroy();
            stripeDestroyLeft.destroy();
        });
    }
}

export default HorizontalStripeTileEffect;