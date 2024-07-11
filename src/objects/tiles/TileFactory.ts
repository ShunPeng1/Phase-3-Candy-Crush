import CONST, { CandyColorKey } from "../../const/const";
import HorizontalStripeTileEffect from "./HorizontalStripeTileEffect";
import NormalTileEffect from "./NormalTileEffect";
import Tile from "./Tile";
import TileEffect from "./TileEffect";
import VerticalStripeTileEffect from "./VerticalStripeTileEffect";

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
        let tile = new Tile({
            scene: this.scene,
            x: x ,
            y: y ,
            texture: randomTileColorTexture
        });

        tile.setDisplaySize(this.textureWidth, this.textureHeight)
            .setTileEffect(new NormalTileEffect(this.scene, tile, randomTileColor, randomTileColorTexture));

        return tile;
    }

    public createSpecialTile(color : CandyColorKey, specialTileType: SpecialTileEffectType, x: number, y: number) {
            
        let specialTileTexture : string = this.getSpecialTileTexture(specialTileType, color);
        
        
        let tile = new Tile({
            scene: this.scene,
            x: x ,
            y: y ,
            texture: specialTileTexture
        });
        
        tile.setDisplaySize(this.textureWidth, this.textureHeight);
       
        let specialTileEffect : TileEffect = this.getSpecialTileEffect(specialTileType, color, tile);
       
        tile.setTileEffect(specialTileEffect);
        
        return tile;
    }

    private getSpecialTileTexture(specialTileType: SpecialTileEffectType, color: CandyColorKey): string {
        switch (specialTileType) {
            case "BOMB":
                return CONST.bombCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
            case "COLOR_CLEAR":
                return CONST.cholateCandyTextureKey;
            case "COLUMN_CLEAR":
                return CONST.verticalStripesCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
            case "ROW_CLEAR":
                return CONST.horizontalStripesCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
            case "RANDOM_2":
                return CONST.bearCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
            default:
                return CONST.normalCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey];
        }
    }

    private getSpecialTileEffect(specialTileType: SpecialTileEffectType, color: CandyColorKey, tile: Tile): TileEffect {
        switch (specialTileType) {
            case "BOMB":
                return new NormalTileEffect(this.scene, tile, color, CONST.bombCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey]);
            case "COLOR_CLEAR":
                return new NormalTileEffect(this.scene, tile, color, CONST.cholateCandyTextureKey);
            case "COLUMN_CLEAR":
                return new VerticalStripeTileEffect(this.scene, tile, color, CONST.verticalStripesCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey]);
            case "ROW_CLEAR":
                return new HorizontalStripeTileEffect(this.scene, tile, color, CONST.horizontalStripesCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey]);
            case "RANDOM_2":
                return new NormalTileEffect(this.scene, tile, color, CONST.bearCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey]);
            default:
                return new NormalTileEffect(this.scene, tile, color, CONST.normalCandyTextureKey[color as keyof typeof CONST.normalCandyTextureKey]);
        }
    }
}


export default TileFactory;