import { Scene } from "phaser";
import TileEffect from "./TileEffect";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";
import TweenChainSimulation from "../../simulation/TweenChainSimulation";
import TileGrid from "../grids/TileGrid";

class BombTileEffect extends TileEffect {
    private tileGrid: TileGrid;
    private tileIndex: Phaser.Math.Vector2;
    private tilesToDestroy: Tile[] = [];

	constructor(scene: Scene, tile: Tile, color: string, texture: string) {
		super(scene, tile, color, texture, "BOMB");
	}

	public onTilePop(): void {
		let tileGrid = this.tile.getTileGrid();
        this.tileGrid = tileGrid;
		let tileIndex = tileGrid.getTileIndex(this.tile, true)!;
        this.tileIndex = tileIndex;
		// Target a 3x3 area around the bomb tile
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				let targetTile = tileGrid.getTileAtIndex(tileIndex.x + dx, tileIndex.y + dy);
				if (targetTile != null && targetTile != this.tile) {
                    this.tilesToDestroy.push(targetTile);
				}
			}
		}

        tileGrid.popTiles(this.tilesToDestroy);
        
        //tileGrid.destroyPopTile(this.tile);
	}

	public onTileDestroy(): void {
		let simulationController = this.scene.data.get("simulationController") as SimulationController;
		let matrix = this.tile.getWorldPosition();
        let explosionEffect = this.scene.add.sprite(matrix.tx, matrix.ty, "bomb-05");
		explosionEffect.play("bomb-animation");

		// Animate the explosion to grow and then shrink, covering the 3x3 area
		let explosionAnimation = this.scene.tweens.chain({ 
			tweens: [
				{
					targets: explosionEffect,
					scale: { from: 0, to: 1.5 },
                    alpha: { from: 0, to: 0.8 }, 
					duration: 500,
					ease: 'Cubic.easeOut',
					
				},
                {
                    targets: explosionEffect,
                    alpha: { from:  0.8, to: 0 },
                    duration: 300,
                    ease: 'Cubic.easeIn',
                }
			],
            onComplete: () => {
                explosionEffect.destroy();
            }    
		});

        this.tilesToDestroy.forEach(element => {
            this.tileGrid.destroyPopTile(element, this);
        });

		simulationController.addSimulation(new TweenChainSimulation(explosionAnimation), true);
	
        // Add score for each tile destroyed
        let scoreController = this.scene.data.get("scoreController");
        scoreController.addScore(1);
    }

    
    public onTileSwapPop(other: ITileEffect): void {
        // To do, implement the swap effect
    }

}

export default BombTileEffect;