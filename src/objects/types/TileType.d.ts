interface ITileEffect{
    color : string;
    texture : string;

    onTileAppear(): void;
    onTilePop(): void;
    onTileSwap(other: ITileEffect): void;
    
} 

type SpecialTileEffectType = "NONE" | "BOMB" | "ROW_CLEAR" | "COLUMN_CLEAR" | "COLOR_CLEAR" | "RANDOM_2";