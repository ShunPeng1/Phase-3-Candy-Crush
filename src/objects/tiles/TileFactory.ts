import CONST, { CandyColorKey } from "../../const/const";
import Tile from "./Tile";

class TileFactory {
    private scene: Phaser.Scene;
    private colors: CandyColorKey[];    

    constructor(scene: Phaser.Scene, colors: CandyColorKey[]) {
        this.scene = scene;
        this.colors = colors;
    }

    
    public createRandomTile(x: number, y: number, textureWidth : number, textureHeight : number ): Tile {
        // Get a random tile
        // Define a type for the keys of normalCandyTextureKey
        
        // Ensure randomTileColor is treated as a key of normalCandyTextureKey
        let randomTileColor: CandyColorKey = this.colors[Phaser.Math.RND.between(0, this.colors.length - 1)] as CandyColorKey;
            
        let randomTileColorTexture: string = CONST.normalCandyTextureKey[randomTileColor as keyof typeof CONST.normalCandyTextureKey];

        // Return the created tile
        return new Tile({
            scene: this.scene,
            x: x ,
            y: y ,
            texture: randomTileColorTexture
        }).setDisplaySize(textureWidth, textureHeight);
    }
}


export default TileFactory;