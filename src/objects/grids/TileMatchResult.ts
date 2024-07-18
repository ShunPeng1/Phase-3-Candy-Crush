import Tile from "../tiles/Tile";

class TileMatchResult {
    public readonly count: number;
    public readonly matchTiles: Tile[];
    public originTile: Tile;
    public matchTilesExceptOrigin: Tile[];

    public readonly specialTileType: SpecialTileEffectType;

    constructor(count: number, matchTiles: Tile[], originTile: Tile, specialTileType: SpecialTileEffectType) {
        this.count = count;
        this.matchTiles = matchTiles;
        this.originTile = originTile;
        this.specialTileType = specialTileType;
        this.matchTilesExceptOrigin = this.matchTiles.filter(tile => tile !== this.originTile);
    }
    
}

export default TileMatchResult;