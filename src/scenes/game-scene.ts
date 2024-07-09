import CONST from "../const/const";
import Tile from "../objects/tile";
import SimulationController from "../simulation/SimulationController";
import TweenSimulation from "../simulation/TweenSimulation";


class GameScene extends Phaser.Scene {
    // Variables
    private canMove: boolean;

    // Grid with tiles
    private tileGrid: (Tile|null)[][];

    // Selected Tiles
    private firstSelectedTile: Tile | null;
    private secondSelectedTile: Tile | null;

    private simulationController: SimulationController;

    constructor() {
        super({
        key: 'GameScene'
        });
    }

    init(): void {
        // Init variables
        this.canMove = true;

        this.simulationController = new SimulationController(this);

        // set background color
        this.cameras.main.setBackgroundColor(0x78aade);

        // Init grid with tiles
        this.tileGrid = [];
        for (let y = 0; y < CONST.gridHeight; y++) {
            this.tileGrid[y] = [];
            for (let x = 0; x < CONST.gridWidth; x++) {
                let tile = this.createRandomTile(x, y);
                tile.setPosition(x * CONST.tileWidth, (y - CONST.gridHeight) * CONST.tileHeight);
                this.tweenDropdownTile(tile, (y - CONST.gridHeight), y);

                this.tileGrid[y][x] = tile;
                
            }
        }


        // Selected Tiles
        this.firstSelectedTile = null;
        this.secondSelectedTile = null;

        // Input
        this.input.on('gameobjectdown', this.tileDown, this);

        // Check if matches on the start
        this.simulationController.startSimulation(true);

        const onComplete = () => {
            this.checkMatches();
            this.simulationController.off('complete', onComplete);
        };

        this.simulationController.on('complete', onComplete);
    }

    /**
     * Add a new random tile at the specified position.
     * @param x
     * @param y
     */
    private createRandomTile(x: number, y: number): Tile {
        // Get a random tile
        let randomTileType: string =
        CONST.candyTypes[Phaser.Math.RND.between(0, CONST.candyTypes.length - 1)];

        // Return the created tile
        return new Tile({
            scene: this,
            x: x * CONST.tileWidth,
            y: y * CONST.tileHeight,
            texture: randomTileType
        });
    }

    /**
     * This function gets called, as soon as a tile has been pressed or clicked.
     * It will check, if a move can be done at first.
     * Then it will check if a tile was already selected before or not (if -> else)
     * @param pointer
     * @param gameobject
     * @param event
     */
    private tileDown(pointer: any, gameobject: any, event: any): void {
        if (!this.canMove) {
            return;
        }

        if (!this.firstSelectedTile) {
            this.firstSelectedTile = gameobject;
            console.log("First tile selected", this.firstSelectedTile?.texture.key, this.getTilePos(this.tileGrid, this.firstSelectedTile!))
            return;
        } 

        // So if we are here, we must have selected a second tile
        
        if (this.firstSelectedTile === gameobject) {
            // If the same tile is clicked twice, deselect it
            this.resetSelectedTile();
            return;
        }

        this.secondSelectedTile = gameobject;

        let dx = 0;
        let dy = 0;
        if (this.firstSelectedTile && this.secondSelectedTile) {
        dx = Math.abs(this.firstSelectedTile.x - this.secondSelectedTile.x) /
            CONST.tileWidth;
        dy = Math.abs(this.firstSelectedTile.y - this.secondSelectedTile.y) /
            CONST.tileHeight;
        }

        // Check if the selected tiles are both in range to make a move
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            this.canMove = false;
            this.swapTiles();
        }
        else{
            // If the selected tiles are not in range, select the second tile
            this.firstSelectedTile = gameobject;
            this.secondSelectedTile = null;
        }
    
    
    }

    /**
     * This function will take care of the swapping of the two selected tiles.
     * It will only work, if two tiles have been selected.
     */
    private swapTiles(): void {
        if (this.firstSelectedTile && this.secondSelectedTile) {
        // Get the position of the two tiles
        let firstTilePosition = {
            x: this.firstSelectedTile.x,
            y: this.firstSelectedTile.y
        };

        let secondTilePosition = {
            x: this.secondSelectedTile.x,
            y: this.secondSelectedTile.y
        };

        // Swap them in our grid with the tiles
        this.tileGrid[firstTilePosition.y / CONST.tileHeight][firstTilePosition.x / CONST.tileWidth] = this.secondSelectedTile;
        this.tileGrid[secondTilePosition.y / CONST.tileHeight][secondTilePosition.x / CONST.tileWidth] = this.firstSelectedTile;

        // Move them on the screen with tweens
        this.add.tween({
            targets: this.firstSelectedTile,
            x: this.secondSelectedTile.x,
            y: this.secondSelectedTile.y,
            ease: 'Linear',
            duration: 400,
            repeat: 0,
            yoyo: false
        });

        this.add.tween({
            targets: this.secondSelectedTile,
            x: this.firstSelectedTile.x,
            y: this.firstSelectedTile.y,
            ease: 'Linear',
            duration: 400,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                this.checkMatches();
            }
        });

        // Reset the selected tiles
        this.firstSelectedTile =
            this.tileGrid[firstTilePosition.y / CONST.tileHeight][firstTilePosition.x / CONST.tileWidth];
        this.secondSelectedTile =
            this.tileGrid[secondTilePosition.y / CONST.tileHeight][secondTilePosition.x / CONST.tileWidth];
        }
    }

    private checkMatches(): void {
        //Call the getMatches function to check for spots where there is
        //a run of three or more tiles in a row
        let matches = this.getMatches(this.tileGrid);
        
        //If there are matches, remove them
        if (matches.length > 0) {
            //Remove the tiles
            this.removeTileGroup(matches);
            // Move the tiles currently on the board into their new positions
            this.resetTile();
            //Fill the board with new tiles wherever there is an empty spot
            this.fillTile();
            this.resetSelectedTile();

            this.simulationController.startSimulation(true);
            const onComplete = () => {
                this.checkMatches();
                this.simulationController.off('complete', onComplete);
            };
    
            this.simulationController.on('complete', onComplete);
        } else {
            // No match so just swap the tiles back to their original position and reset
            this.swapTiles();
            this.resetSelectedTile();
            this.canMove = true;
        }
    }

    private resetTile(): void {
        
        for (let y = this.tileGrid.length - 1; y >= 0; y--) {// Loop through each row from bottom to top
            for (let x = this.tileGrid[y].length - 1; x >= 0; x--) { // Loop through each tile in the row from right to left
                if (this.tileGrid[y][x] !== null) {
                    continue;
                }
                
                // If this space is blank, but the one above it is not, move the one above down
                let aboveTile = null;
                let aboveIndex = y - 1;
                for (let i = y - 1; i >= 0; i--) { // Start at the top of the column and move down
                    if (aboveTile === null) {
                        aboveTile = this.tileGrid[i][x];
                        aboveIndex = i;
                    }
                    else{
                        break;
                    }
                }
                
                if (aboveTile !== null) {
                    // Move the tile above down one
                    this.tileGrid[y][x] = aboveTile;
                    this.tileGrid[aboveIndex][x] = null;

                    this.tweenDropdownTile(aboveTile, aboveIndex, y);
                    

                    //The positions have changed so start this process again from the bottom
                    //NOTE: This is not set to me.tileGrid[i].length - 1 because it will immediately be decremented as
                    //we are at the end of the loop.
                    //x = this.tileGrid[y].length; 
                }
            }
        }
    }

    private fillTile(): void {
        //Check for blank spaces in the grid and add new tiles at that position
        for (var y = 0; y < this.tileGrid.length; y++) {
            for (var x = 0; x < this.tileGrid[y].length; x++) {
                if (this.tileGrid[y][x] !== null) {
                    continue;
                }

                let belowIndex = this.tileGrid.length;
                for (let i = y + 1; i < this.tileGrid.length; i++) { // Start at the top of the column and move down
                    if (this.tileGrid[i][x] !== null) {
                        belowIndex = i;
                        break;
                    }
                }

                const fromYIndex = belowIndex - y;
                //Found a blank spot so lets add animate a tile there
                let tile = this.createRandomTile(x, y);
                tile.setPosition(x * CONST.tileWidth, -CONST.tileHeight * (belowIndex - y));
                
                this.tweenDropdownTile(tile, y - belowIndex, y);
                //And also update our "theoretical" grid
                this.tileGrid[y][x] = tile;
                
                
            }
        }
    }

    private resetSelectedTile(): void {
        // Reset active tiles
        this.firstSelectedTile = null;
        this.secondSelectedTile = null;
    }

    private removeTileGroup(matches: Tile[][]): void {
        // Loop through all the matches and remove the associated tiles
        for (var i = 0; i < matches.length; i++) {
            var tempArr = matches[i];

            for (var j = 0; j < tempArr.length; j++) {
                let tile = tempArr[j];
                //Find where this tile lives in the theoretical grid
                let tilePos = this.getTilePos(this.tileGrid, tile);

                // Remove the tile from the theoretical grid
                if (tilePos.x !== -1 && tilePos.y !== -1) {
                    tile.destroy();
                    this.tileGrid[tilePos.y][tilePos.x] = null;
                }
            }
        }
    }

    private getTilePos(tileGrid: (Tile|null)[][], tile: Tile): any {
        let pos = { x: -1, y: -1 };

        //Find the position of a specific tile in the grid
        for (let y = 0; y < tileGrid.length; y++) {
            for (let x = 0; x < tileGrid[y].length; x++) {
                //There is a match at this position so return the grid coords
                if (tile === tileGrid[y][x]) {
                    pos.x = x;
                    pos.y = y;
                    break;
                }
            }
        }

        return pos;
    }

    private getMatches(tileGrid: (Tile|null)[][]): Tile[][] {
        let matches: Tile[][] = []; // This array will store all the matches
        let groups: Tile[] = []; // This array will store a single match

        // Check for horizontal matches
        for (let y = 0; y < tileGrid.length; y++) {
            let tempArray = tileGrid[y];
            groups = [];
            for (let x = 0; x < tempArray.length - 2; x++) {
                let tile = tileGrid[y][x];
                let rightTile = tileGrid[y][x + 1];
                let rightRightTile = tileGrid[y][x + 2];

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
        for (let x = 0; x < tileGrid[0].length; x++) { // Iterate over each column
            let groups = [];
            for (let y = 0; y < tileGrid.length - 2; y++) { // Iterate over rows within the column, leaving room for comparison
                let tile = tileGrid[y][x];
                let belowTile = tileGrid[y + 1][x];
                let belowBelowTile = tileGrid[y + 2][x];

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

    private tweenDropdownTile(tile: Tile, fromY: number, endY: number): void {
        //console.log("Tweening tile", tile.texture.key, "from", fromY, "to", endY);

        let tweenSimulation = new TweenSimulation(this.tweens.add({
            targets: tile,
            y: endY * CONST.tileHeight,
            ease: 'Linear',
            duration: 200 * (endY - fromY),
            repeat: 0,
            yoyo: false
        }));
        
        this.simulationController.addSimulation(tweenSimulation);

    }
}


export default GameScene;