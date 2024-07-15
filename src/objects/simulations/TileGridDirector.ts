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
        

        this.scene.add.particles(0, 1000, 'sunset-raster', {
            speed: {
                onEmit: (particle) => {
                    return Phaser.Math.Between(1000, 1300);
                },
            },
            lifespan: 5000,
            gravityY: 500,
            duration: duration,
            frame: [0, 4, 8, 12, 16],
            x: { min: 0, max: 1200 },
            scaleX: {
                onEmit: (particle) => {
                    return -1.0
                },
                onUpdate: (particle) => {
                    return (particle.scaleX > 1.0 ? -1.0 : particle.scaleX + 0.05)
                }
            },
            rotate: {
                onEmit: (particle) => {
                    return 0
                },
                onUpdate: (particle) => {
                    return particle.angle + 1
                }
            },
        });
    }

    public endIdle(): void {
        
        
    }



}


export default TileGridDirector;