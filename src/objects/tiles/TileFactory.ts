import CONST, { CandyColorKey } from "../../const/const";
import Tile from "./Tile";

class TileFactory {
    
    private scene: Phaser.Scene;
    private colors: CandyColorKey[];    
    private textureWidth: number;
    private textureHeight: number;

    constructor(scene: Phaser.Scene, colors: CandyColorKey[], textureWidth : number, textureHeight : number ) {
        this.scene = scene;
        this.colors = colors;

        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;
    }

    
    public createRandomTile(x: number, y: number): Tile {
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
        }, {
            color: randomTileColor,
            texture: randomTileColorTexture,
            onTilePop: () => {},
            onTileSwap: () => {}
        }).setDisplaySize(this.textureWidth, this.textureHeight);
    }

    public createSpecialTile(color : CandyColorKey, specialTileType: SpecialTileEffectType, x: number, y: number) {
            
        let specialTileTexture : string;

        switch (specialTileType) {
            case "BOMB":
                specialTileTexture =  CONST.bombCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
                break;
            case "COLOR_CLEAR":
                specialTileTexture = CONST.cholateCandyTextureKey;
                break;
            case "COLUMN_CLEAR":
                specialTileTexture = CONST.verticalStripesCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey]
                break;
            case "ROW_CLEAR":
                specialTileTexture = CONST.horizontalStripesCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
                break;
            case "RANDOM_2":
                specialTileTexture = CONST.bearCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
                break;
            default:
                specialTileTexture = CONST.normalCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
                break;
        }

        return new Tile({
            scene: this.scene,
            x: x,
            y: y,
            texture: specialTileTexture
        }, {
            color: color,
            texture: specialTileTexture,
            onTilePop: () => {},
            onTileSwap: () => {}
        }).setDisplaySize(this.textureWidth, this.textureHeight);
    }
}


export default TileFactory;