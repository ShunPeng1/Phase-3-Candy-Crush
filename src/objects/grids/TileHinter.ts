import Tile from "../tiles/Tile";
import TileMatcher from "./TileMatcher";

class TileHinter {
    private Scene: Phaser.Scene;
    private TileMatcher: TileMatcher;
    private hintTweens: Phaser.Tweens.Tween[] = [];
    private hintTiles: Tile[] = [];
    

    constructor(scene: Phaser.Scene, tileMatcher: TileMatcher) {
        this.Scene = scene;
        this.TileMatcher = tileMatcher;
    }

    public startHintTiles(): void {
        let potentialMatches = this.TileMatcher.getPotentialMatches();

        if (potentialMatches.length === 0) {
            return;
        }
        
        let potentialMatch = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

        let fromTile = potentialMatch.fromTile;
        let toTile = potentialMatch.toTile;

        this.hintTiles = [fromTile, toTile, ...potentialMatch.matchTiles];
        

        // Create a heartbeat tween for each tile
        this.hintTiles.forEach(tile => {
            let tween = this.Scene.tweens.add({
                targets: tile,
                displayWidth: tile.getTileWidth() * 1.2,
                displayHeight: tile.getTileHeight() * 1.2,
                yoyo: true,
                repeat: 1, // Repeat once, so it "beats" twice
                duration: 300,
                onStop: () => {
                    // Reset the tile scale if the tween is stopped
                    tile.setDisplaySize(tile.getTileWidth(), tile.getTileHeight());
                }
            });
            this.hintTweens.push(tween);

            tile.on('pointerover', this.endHintTiles, this);
        });
    }

    public endHintTiles(): void {
        // Stop all tweens and reset the tiles
        this.hintTweens.forEach(tween => {
            tween.stop();
        });

        this.hintTiles.forEach(tile => {
            tile.off('pointerover', this.endHintTiles, this);
            
            tile.setDisplaySize(tile.getTileWidth(), tile.getTileHeight());
        });

        this.hintTweens = []; // Clear the tweens array
    }
}

export default TileHinter;