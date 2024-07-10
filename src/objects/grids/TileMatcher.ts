import Tile from "../tiles/Tile";
import TileGrid from "./TileGrid";
import TileMatchResult from "./TileMatchResult";

class TileMatcher {
    private tileGrid : TileGrid;
    private visitedTiles: Set<Tile>;

    constructor(tileGrid : TileGrid){
        this.tileGrid = tileGrid;
    }

    

    public getMatches(): TileMatchResult[] {
        this.visitedTiles = new Set<Tile>();

        let verticalMatches = this.findVerticalMatches();
        let horizontalMatches = this.findHorizontalMatches();
        let squareMatches = this.findSquareMatches();

        let results: TileMatchResult[] = [];


        this.extract5OrMoreContinuousMatch(verticalMatches, results, horizontalMatches);
        
        verticalMatches = this.sliceAllNonVisitedTileInMatch(verticalMatches);
        horizontalMatches = this.sliceAllNonVisitedTileInMatch(horizontalMatches);
        this.extractCornerMatch(verticalMatches, horizontalMatches, results);
        
        verticalMatches = this.sliceAllNonVisitedTileInMatch(verticalMatches);
        horizontalMatches = this.sliceAllNonVisitedTileInMatch(horizontalMatches);
        this.extract4ContinuousMatch(verticalMatches, results, horizontalMatches);
       
        this.sliceAndExtractSquareMatch(squareMatches, results);
        
        verticalMatches = this.sliceAllNonVisitedTileInMatch(verticalMatches);
        horizontalMatches = this.sliceAllNonVisitedTileInMatch(horizontalMatches);
        this.extract3ContinuousMatch(verticalMatches, results, horizontalMatches);

        return results;
    }

    private extract3ContinuousMatch(verticalMatches: Tile[][], results: TileMatchResult[], horizontalMatches: Tile[][]) : void {
        for (let i = verticalMatches.length - 1; i >= 0; i--) {

            if (verticalMatches[i].length == 3) {
                let match = verticalMatches[i];
                let originTile = match[0];
                let count = match.length;

                results.push(new TileMatchResult(count, match, originTile, "ROW_CLEAR"));
                match.forEach(tile => {
                    this.visitedTiles.add(tile);
                });
                verticalMatches.splice(i, 1);
            }
        }

        for (let i = horizontalMatches.length - 1; i >= 0; i--) {
            if (horizontalMatches[i].length == 3) {
                let match = horizontalMatches[i];
                let originTile = match[0];
                let count = match.length;

                results.push(new TileMatchResult(count, match, originTile, "COLUMN_CLEAR"));
                match.forEach(tile => {
                    this.visitedTiles.add(tile);
                });
                horizontalMatches.splice(i, 1);

            }
        }
    }

    private extractCornerMatch(verticalMatches: Tile[][], horizontalMatches: Tile[][], results: TileMatchResult[]) {
        for (let i = verticalMatches.length - 1; i >= 0; i--) {

            let verticalMatch = verticalMatches[i];

            for (let j = horizontalMatches.length - 1; j >= 0; j--) {

                let horizontalMatch = horizontalMatches[j];

                let intersectTiles = this.intersection2TilesArray(verticalMatch, horizontalMatch);
                if (intersectTiles.length == 0)
                    continue;


                let unionTiles = this.union2TilesArray(verticalMatch, horizontalMatch);
                let originTile = intersectTiles[0];
                let count = unionTiles.length;


                results.push(new TileMatchResult(count, unionTiles, originTile, "BOMB"));

                intersectTiles.forEach(tile => {
                    this.visitedTiles.add(tile);
                });

                horizontalMatches.splice(j, 1);
                verticalMatches.splice(i, 1);

            }

        }
    }

    private extract5OrMoreContinuousMatch(verticalMatches: Tile[][], results: TileMatchResult[], horizontalMatches: Tile[][]) : void{
        for (let i = verticalMatches.length - 1; i >= 0; i--) {

            if (verticalMatches[i].length >= 5) {
                let match = verticalMatches[i];
                let originTile = match[0];
                let count = match.length;

                results.push(new TileMatchResult(count, match, originTile, "COLOR_CLEAR"));
                match.forEach(tile => {
                    this.visitedTiles.add(tile);
                });
                verticalMatches.splice(i, 1);
            }
        }

        for (let i = horizontalMatches.length - 1; i >= 0; i--) {
            if (horizontalMatches[i].length >= 5) {
                let match = horizontalMatches[i];
                let originTile = match[0];
                let count = match.length;

                results.push(new TileMatchResult(count, match, originTile, "COLOR_CLEAR"));
                match.forEach(tile => {
                    this.visitedTiles.add(tile);
                });
                horizontalMatches.splice(i, 1);

            }
        }
        
    }

    private extract4ContinuousMatch(verticalMatches: Tile[][], results: TileMatchResult[], horizontalMatches: Tile[][]) : void{
        for (let i = verticalMatches.length - 1; i >= 0; i--) {

            if (verticalMatches[i].length == 4 ) {
                let match = verticalMatches[i];
                let originTile = match[0];
                let count = match.length;

                results.push(new TileMatchResult(count, match, originTile, "ROW_CLEAR"));
                match.forEach(tile => {
                    this.visitedTiles.add(tile);
                });
                verticalMatches.splice(i, 1);
            }
        }

        for (let i = horizontalMatches.length - 1; i >= 0; i--) {
            if (horizontalMatches[i].length == 4) {
                let match = horizontalMatches[i];
                let originTile = match[0];
                let count = match.length;

                results.push(new TileMatchResult(count, match, originTile, "COLUMN_CLEAR"));
                match.forEach(tile => {
                    this.visitedTiles.add(tile);
                });
                horizontalMatches.splice(i, 1);

            }
        }
        
    }

    private sliceAndExtractSquareMatch(squareMatches: Tile[][], results: TileMatchResult[]) {
        squareMatches = this.sliceAllNonVisitedTileInMatch(squareMatches);
        
        
        for (let i = squareMatches.length - 1; i >= 0; i--) {

            if (squareMatches[i].length != 4) {
                continue;
            }

            let match = squareMatches[i];
            let originTile = match[0];
            let count = match.length;

            results.push(new TileMatchResult(count, match, originTile, "RANDOM_2"));
            match.forEach(tile => {
                this.visitedTiles.add(tile);
            });

            squareMatches.slice(i, 1);
            squareMatches = this.sliceAllNonVisitedTileInMatch(squareMatches);
            i = 0;
        }
    }

    

    private sliceNonVisitedTileInVisitedTiles(tiles: Tile[]) {
        let result: Tile[] = [];
        for (let i = 0; i < tiles.length; i++) {
            if (!this.visitedTiles.has(tiles[i])) {
                result.push(tiles[i]);
            }
        }
        return result;
    }

    private sliceAllNonVisitedTileInMatch(tiles: Tile[][]) {
        let result: Tile[][] = [];
        for (let i = 0; i < tiles.length; i++) {
            let match = tiles[i];
            let nonVisitedMatch = this.sliceNonVisitedTileInVisitedTiles(match);
            if (nonVisitedMatch.length > 0) {
                result.push(nonVisitedMatch);
            }
        }
        return result;
    }

    private union2TilesArray(array1: Tile[], array2: Tile[]): Tile[] {
        return [...new Set([...array1, ...array2])];
    }

    private union3TilesArray(array1: Tile[], array2: Tile[], array3: Tile[]): Tile[] {
        return [...new Set([...array1, ...array2, ...array3])];
    }

    private intersection2TilesArray(array1: Tile[], array2: Tile[]): Tile[] {
        return array1.filter(value => array2.includes(value));
    }

    private intersection3TilesArray(array1: Tile[], array2: Tile[], array3: Tile[]): Tile[] {
        return array1.filter(value => array2.includes(value) && array3.includes(value));
    }


    
    private findHorizontalMatches(): Tile[][] {
        let horizontalMatches: Tile[][] = [];
        let groups: Tile[] = [];

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
                        horizontalMatches.push(groups);
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
                horizontalMatches.push(groups);
            }
        }

        return horizontalMatches;
    }
    

    private findVerticalMatches(): Tile[][] {
        let verticalMatches: Tile[][] = [];
        let groups: Tile[] = [];

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
                    verticalMatches.push(groups); // Push the current group to matches
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
                verticalMatches.push(groups);
            }
        }

        return verticalMatches;
    }

    private findSquareMatches(): Tile[][] {
        let squareMatches: Tile[][] = [];

        // Check for square matches
        for (let y = 0; y < this.tileGrid.getRowCount() - 1; y++) {
            for (let x = 0; x < this.tileGrid.getColumnCount() - 1; x++) {
                let tile = this.tileGrid.getTile(x, y);
                let rightTile = this.tileGrid.getTile(x + 1, y);
                let belowTile = this.tileGrid.getTile(x, y + 1);
                let belowRightTile = this.tileGrid.getTile(x + 1, y + 1);

                if (!tile || !rightTile || !belowTile || !belowRightTile) {
                    continue;
                }

                if (tile.texture.key !== rightTile.texture.key ||
                    tile.texture.key !== belowTile.texture.key ||
                    tile.texture.key !== belowRightTile.texture.key) {
                    continue;
                }

                squareMatches.push([tile, rightTile, belowTile, belowRightTile]);
            }
        }

        return squareMatches;
    }

}

export default TileMatcher;