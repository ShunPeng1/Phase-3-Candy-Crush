import { Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";
import TweenChainSimulation from "../../simulation/TweenChainSimulation";

class VerticalStripeTileEffect extends TileEffect {
    private tileIndex: Phaser.Math.Vector2;
    private popTilesUp : Tile[] = [];
    private popTilesDown : Tile[] = [];

    constructor(scene : Scene, tile : Tile, color: string, texture: string) {
        super(scene, tile, color, texture);
    }

    
    public onTilePop(): void {
        let tileGrid = this.tile.getTileGrid();
        
        let tileIndex = tileGrid.getTileIndex(this.tile, true)!;
        this.tileIndex = tileIndex;

        for (let i = tileIndex.y + 1; i < tileGrid.getRowCount(); i++) {
            let tile = tileGrid.getTileAtIndex(tileIndex.x, i);
            if (tile != null && tile != this.tile) {
                this.popTilesDown.push(tile);
            }
        }

        for (let i = tileIndex.y - 1; i >= 0; i--) {
            let tile = tileGrid.getTileAtIndex(tileIndex.x, i);
            if (tile != null && tile != this.tile) {
                this.popTilesUp.push(tile);
            }
        }

        tileGrid.popTiles(this.popTilesUp);
        tileGrid.popTiles(this.popTilesDown);

        //tileGrid.destroyPopTile(this.tile);

    }

    public onTileDestroy(): void {
        let simulationController = this.scene.data.get("simulationController") as SimulationController;
        let matrix = this.tile.getWorldPosition();
        let tileGrid = this.tile.getTileGrid();
        

        
        let stripeDestroyDown = this.scene.add.image(matrix.tx, matrix.ty, "stripes_destroy");
        stripeDestroyDown.setRotation(Math.PI/2);
        stripeDestroyDown.setOrigin(0, 0.5);
        
        let destroyedSet = new Set<number>();
        const dynamicDestroy = (tween : Phaser.Tweens.Tween) => {
            const value = tween.getValue();
            const array = tween.targets as Tile[];

            if (destroyedSet.has(Math.floor(value))) {
                return;
            }

            tileGrid.destroyPopTile(array[Math.floor(value)]);
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
            targets: this.popTilesUp,
            values: { from: 0, to: this.popTilesUp.length - 1},
            duration: 500,
            ease: 'Cubic.easeInOut',
            onUpdate: dynamicDestroy
        });

        let destroyDown =this.scene.add.tween({
            targets: this.popTilesDown,
            values: { from: 0, to: this.popTilesDown.length - 1},
            duration: 500,
            ease: 'Cubic.easeInOut',
            onUpdate: dynamicDestroy
        });

        simulationController.addSimulation(new TweenChainSimulation(chainDown), true);
        simulationController.addSimulation(new TweenChainSimulation(chainUp), true);
        simulationController.addSimulation(new TweenSimulation(destroyUp), true);
        simulationController.addSimulation(new TweenSimulation(destroyDown), true);


        this.scene.time.delayedCall(700, () => {
            stripeDestroyDown.destroy();
            stripeDestroyUp.destroy();
        });
    }

}


export default VerticalStripeTileEffect;