import Tile from "../tiles/Tile";

class TileMatchResult {
    public readonly count: number;
    public readonly matchTiles: Tile[];
    public readonly originTile: Tile;
    public readonly specialTileType: SpecialTileEffectType;

    constructor(count: number, matchTiles: Tile[], originTile: Tile, specialTileType: SpecialTileEffectType) {
        this.count = count;
        this.matchTiles = matchTiles;
        this.originTile = originTile;
        this.specialTileType = specialTileType;
    }
}

export default TileMatchResult;