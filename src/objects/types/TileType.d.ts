interface ITileEffect{
    color : string;
    texture : string;
    onTilePop(): void;
    onTileSwap(): void;
    
} 

type SpecialTileEffectType = "NONE" | "BOMB" | "ROW_CLEAR" | "COLUMN_CLEAR" | "COLOR_CLEAR" | "RANDOM_2";