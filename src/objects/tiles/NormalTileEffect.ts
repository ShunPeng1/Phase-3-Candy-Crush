import { Scene } from "phaser";
import Tile from "./Tile";
import TileEffect from "./TileEffect";

class NormalTileEffect extends TileEffect{
    
    constructor(scene : Scene, tile : Tile, color: string, texture: string) {
        super(scene, tile, color, texture);
    }

    public onTilePop(): void {
        let matrix = this.tile.getWorldPosition();
        
        let particles = this.scene.add.particles(matrix.tx, matrix.ty, this.texture, {
            radial: true,
            angle: { min: 0, max: 360 },
            speed: { min: 500, max: 1000 },
            quantity: 15,
            lifespan: 500,
            alpha: { start: 1, end: 0 },
        });
        
        particles.setScale(0.1);

        particles.explode(20);

        this.scene.time.delayedCall(2000, () => {
            particles.destroy();
        });
    }


    public onTileSwap(other: ITileEffect): void {
        
    }

}


export default NormalTileEffect;