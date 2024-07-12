import TileSimulation from "../simulations/TileSimulation";
import TileWaveIdleSimulation from "../simulations/TileWaveIdleSimulation";
import TileGrid from "./TileGrid";

class TileGridDirector {
    private tileGrid : TileGrid;
    private scene : Phaser.Scene;

    constructor(scene: Phaser.Scene, tileGrid : TileGrid) {
        this.scene = scene;
        this.tileGrid = tileGrid;
    }


    public startIdle(): void {
        
        let simulationIndex = Math.random() * 1;
        let simulation : TileSimulation;
        switch(simulationIndex) {
            case 0:
                simulation = new TileWaveIdleSimulation(this.scene, this.tileGrid.getTileGrid());
                break;
            default:
                simulation = new TileWaveIdleSimulation(this.scene, this.tileGrid.getTileGrid());
                break;
        }

        simulation.start();

    }

    public endIdle(): void {
        let tiles = this.tileGrid.getFlattenTileGrid();

        
    }



}


export default TileGridDirector;