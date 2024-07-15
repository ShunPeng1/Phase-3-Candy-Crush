import TileSimulation from "./TileSimulation";
import TileWaveIdleSimulation from "./TileWaveIdleSimulation";
import TileGrid from "../grids/TileGrid";
import TileCircleShuffleSimulation from "./TileCircleShuffleSimulation";
import { GameObjects } from "phaser";

class TileGridDirector extends GameObjects.GameObject {
    private tileGrid : TileGrid;
    

    constructor(scene: Phaser.Scene, tileGrid : TileGrid) {
        super(scene, 'tileGridDirector');
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


    public startShuffle(x : number, y : number, duration : number, callback : ()=>void = () =>{}): void {
        let simulationIndex = Math.random() * 1;
        let simulation : TileSimulation;
        switch(simulationIndex) {
            case 0:
                simulation = new TileCircleShuffleSimulation(this.scene, this.tileGrid, x, y, 200, duration, callback);
                break;
            default:
                simulation = new TileCircleShuffleSimulation(this.scene, this.tileGrid, x, y, 200, duration, callback);
                break;
        }

        simulation.start();
        
    }

    public endIdle(): void {
        
        
    }



}


export default TileGridDirector;