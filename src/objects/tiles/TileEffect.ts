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
    
    public onTilePop(): void {

    }
    public onTileSwap(other: ITileEffect): void {

    }

}

export default TileEffect;