import Tile from "../tiles/Tile";

class TileSimulation implements ISimulation {
    protected scene: Phaser.Scene;
    protected tiles: (Tile|null)[][];
    constructor(scene: Phaser.Scene, tiles : (Tile|null)[][]) {
        this.tiles = tiles;
        this.scene = scene;
    }
    public start(): void {
    
    }
    public stop(): void {
    
    }
    public getCompleted(): boolean {
        return false;
    }
    public update() {
    
    }

    protected getFlattenTiles(): Tile[] {
        return this.tiles.reduce((acc : Tile[], val : (Tile | null)[]) => {
            let arr = val.filter((tile) => tile !== null) as Tile[];
            return acc.concat(arr);
        }, []);
    }
}

export default TileSimulation;