import Tile from "../tiles/Tile";
import TileGrid from "./TileGrid";

class TileMatcher {
    private tileGrid : TileGrid;
    
    constructor(tileGrid : TileGrid){
        this.tileGrid = tileGrid;
    }


    public getMatches(): Tile[][] {
        let matches: Tile[][] = []; // This array will store all the matches
        let groups: Tile[] = []; // This array will store a single match

        // Check for horizontal matches
        for (let y = 0; y < this.tileGrid.getRowCount(); y++) {
            let tempArray = this.tileGrid.getRow(y);
            groups = [];
            for (let x = 0; x < tempArray.length - 2; x++) {
                let tile = this.tileGrid.getTile(x, y);
                let rightTile = this.tileGrid.getTile(x + 1, y);
                let rightRightTile = this.tileGrid.getTile(x + 2, y);

                if (!tile || !rightTile || !rightRightTile) {
                    continue;
                }

                if (tile.texture.key !== rightTile.texture.key ||
                    rightTile.texture.key !== rightRightTile.texture.key) {
                    continue;
                }

                if (groups.length > 0) { //If there is a match in the group already
                    if (groups.indexOf(tile) == -1) { //If the current tile is not in the group
                        matches.push(groups);
                        groups = []; //Reset the group
                    }
                }

                if (groups.indexOf(tile) == -1) {
                    groups.push(tile);
                }

                if (groups.indexOf(rightTile) == -1) {
                    groups.push(rightTile);
                }

                if (groups.indexOf(rightRightTile) == -1) {
                    groups.push(rightRightTile);
                }
                
            
            }

            if (groups.length > 0) {
                matches.push(groups);
            }
        }

        // Check for vertical matches
        for (let x = 0; x < this.tileGrid.getColumnCount(); x++) { // Iterate over each column
            let groups = [];
            for (let y = 0; y < this.tileGrid.getRowCount() - 2; y++) { // Iterate over rows within the column, leaving room for comparison
                let tile = this.tileGrid.getTile(x, y);
                let belowTile = this.tileGrid.getTile(x, y + 1);
                let belowBelowTile = this.tileGrid.getTile(x, y + 2);

                if (!tile || !belowTile || !belowBelowTile) {
                    continue; // Skip if any of the tiles in the sequence are null
                }

                if (tile.texture.key !== belowTile.texture.key ||
                    belowTile.texture.key !== belowBelowTile.texture.key) {
                    continue; // Skip if the tiles do not match
                }

                // If there is a match in the group already and the current tile is not in the group
                if (groups.length > 0 && groups.indexOf(tile) == -1) {
                    matches.push(groups); // Push the current group to matches
                    groups = []; // Reset the group
                }

                // Add tiles to the group if they are not already included
                if (groups.indexOf(tile) == -1) {
                    groups.push(tile);
                }
                if (groups.indexOf(belowTile) == -1) {
                    groups.push(belowTile);
                }
                if (groups.indexOf(belowBelowTile) == -1) {
                    groups.push(belowBelowTile);
                }
            }
            if (groups.length > 0) {
                matches.push(groups);
            }
        }

        return matches;
    }

}

export default TileMatcher;