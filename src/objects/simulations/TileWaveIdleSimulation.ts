import Tile from "../tiles/Tile";
import TileSimulation from "./TileSimulation";

class TileWaveIdleSimulation extends TileSimulation {
    private tweens: Phaser.Tweens.Tween[] = [];

    
    public start(): void {
        super.start();

        // Assuming this.tiles is a 2D array where the number of rows can be different from the number of columns
        const maxRows = this.tiles.length;
        const maxCols = this.tiles.reduce((max, row) => Math.max(max, row.length), 0);

        for (let k = 0; k <= (maxRows + maxCols - 2); ++k) {
            let yMin = Math.max(0, k - maxCols + 1);
            let yMax = Math.min(maxRows - 1, k);
            for (let y = yMin; y <= yMax; ++y) {
                let x = k - y;

                // Check if x is within the bounds of the current row
                if (x < 0 || x >= this.tiles[y].length || this.tiles[y][x] === null) {
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
