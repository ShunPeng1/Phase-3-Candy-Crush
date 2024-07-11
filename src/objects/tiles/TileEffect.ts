import { Scene } from "phaser";
import Tile from "./Tile";

class TileEffect implements ITileEffect{
    protected scene: Scene;
    public readonly tile: Tile;
    public readonly color: string;
    public readonly texture: string;
    constructor(scene : Scene, tile : Tile, color: string, texture: string) {
        this.scene = scene;
        this.tile = tile;
        this.color = color;
        this.texture = texture;
    }

    public onTileAppear(): void {
        const currentScaleX = this.tile.scaleX;
        const currentScaleY = this.tile.scaleY;

        this.scene.add.tween({
            targets: this.tile,
            scaleX: { from: 0, to: currentScaleX },
            scaleY: { from: 0, to: currentScaleY },
            duration: 500,
            ease: 'Back.out',
        });


    }
    
    public onTilePop(): void {

    }

    public onTileDestroy(): void {
            
    }
    public onTileSwap(other: ITileEffect): void {

    }

}

export default TileEffect;