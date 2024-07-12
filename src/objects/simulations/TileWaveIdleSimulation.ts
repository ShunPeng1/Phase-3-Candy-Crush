import Tile from "../tiles/Tile";
import TileSimulation from "./TileSimulation";

class TileWaveIdleSimulation extends TileSimulation {
    private tweens: Phaser.Tweens.Tween[] = [];

    
    public start(): void {
        super.start();

        for (let k = 0; k <= 2 * (this.tiles.length - 1); ++k) {
            let yMin = Math.max(0, k - this.tiles.length + 1);
            let yMax = Math.min(this.tiles.length - 1, k);
            for (let y = yMin; y <= yMax; ++y) {
                let x = k - y;
                
                if (this.tiles[y][x] === null) {
                    continue;
                }

                let waveTween = this.createWaveTween(this.tiles[y][x] as Tile, k);
                this.tweens.push(waveTween);
            }
        }
    }

    private createWaveTween(tile: Tile, index : number): Phaser.Tweens.Tween {
        return this.scene.tweens.add({
            targets: tile,
            delay: 100 * index,
            displayWidth: tile.getTileWidth() * 1.2,
            displayHeight: tile.getTileHeight() * 1.2,
            yoyo: true,
            ease: "Quad.InOut",
            duration: 150,
            onComplete: () => {
                tile.setDisplaySize(tile.getTileWidth(), tile.getTileHeight());
            }
        });
    }
}

export default TileWaveIdleSimulation;
