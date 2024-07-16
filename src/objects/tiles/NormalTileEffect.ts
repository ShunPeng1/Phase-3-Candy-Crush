import { Scene } from "phaser";
import Tile from "./Tile";
import TileEffect from "./TileEffect";
import SimulationController from "../../simulation/SimulationController";
import TimerEventSimulation from "../../simulation/TimerEventSimulation";

class NormalTileEffect extends TileEffect{
    
    constructor(scene : Scene, tile : Tile, color: string, texture: string) {
        super(scene, tile, color, texture, "NONE");
    }

    
    public onTilePop(): void {
    }

    public onTileDestroy(byTileEffect? : ITileEffect, isMerged : boolean = false): void {
        // Add score for each tile destroyed
        let scoreController = this.scene.data.get("scoreController");
        scoreController.addScore(1);
        
        if (isMerged) {
            return;
        }

        let simulationController = this.scene.data.get("simulationController") as SimulationController;
        let matrix = this.tile.getWorldPosition();
        
        let particles = this.scene.add.particles(matrix.tx, matrix.ty, this.texture, {
            radial: true,
            angle: { min: 0, max: 360 },
            speed: { min: 500, max: 1000 },
            quantity: 15,
            lifespan: 500,
            alpha: { start: 1, end: 0 },
            scale: { min: 0.5, max: 1 }, // Random size variation 
            rotate: { min: 0, max: 360}, // Random spinning angles
            
        });
        

        particles.setScale(0.15);

        particles.explode(25);


        simulationController.addSimulation(new TimerEventSimulation(this.scene, 600, () => {
            particles.destroy();
        }));

    }


    public onTileSwapPop(other: ITileEffect): void {
        
    }

}


export default NormalTileEffect;