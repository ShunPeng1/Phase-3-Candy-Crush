import Tile from "../tiles/Tile";

class TilePotentialMatchResult {
    public readonly matchTiles: Tile[];
    public readonly fromTile: Tile;
    public readonly toTile: Tile;


    constructor(matchTiles: Tile[], fromTile: Tile, toTile: Tile) {
        this.matchTiles = matchTiles;
        
        this.fromTile = fromTile;
        this.toTile = toTile;
    
    }
    
}

export default TilePotentialMatchResult;