interface ITileEffect{
    color : string;
    texture : string;
    type : SpecialTileEffectType;
    onTileDestroy(byTileEffect? : ITileEffect, isMerged : boolean = false): void;
    onTileAppear(fromTileEffects : ITileEffect[] = []): void;
    onTilePop(): void;
    onTileSwap(other: ITileEffect): void;
    
} 

type SpecialTileEffectType = "NONE" | "BOMB" | "ROW_CLEAR" | "COLUMN_CLEAR" | "COLOR_CLEAR" | "RANDOM_2";