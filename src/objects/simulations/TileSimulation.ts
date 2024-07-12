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
}

export default TileSimulation;