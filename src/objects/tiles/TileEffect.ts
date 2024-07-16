import { Scene } from "phaser";
import Tile from "./Tile";
import SimulationController from "../../simulation/SimulationController";
import TweenSimulation from "../../simulation/TweenSimulation";

abstract class TileEffect implements ITileEffect{
    protected scene: Scene;
    public readonly tile: Tile;
    public readonly color: string;
    public readonly texture: string;
    public readonly type: SpecialTileEffectType = "NONE";
    constructor(scene : Scene, tile : Tile, color: string, texture: string, type: SpecialTileEffectType){ 
        this.scene = scene;
        this.tile = tile;
        this.color = color;
        this.texture = texture;
        this.type = type;
    }

    public onTileAppear(fromTileEffects : ITileEffect[] = []): void {
        let simulationController = this.scene.data.get('simulationController') as SimulationController;

        const currentScaleX = this.tile.scaleX;
        const currentScaleY = this.tile.scaleY;
        
        this.tile.setDepth(1);

        if (fromTileEffects.length == 0){
            
            let appearTween = this.scene.add.tween({
                targets: this.tile,
                scaleX: { from: 0, to: currentScaleX },
                scaleY: { from: 0, to: currentScaleY },
                duration: 500,
                ease: 'Back.out',
            });

            return;
        }

        let fromTiles = fromTileEffects.map((effect : ITileEffect) => {
            const tileEffect = effect as TileEffect;
            if (tileEffect.type != "NONE"){
                return null;
            }
            return tileEffect.tile;
        });

        const thisTileWorldPosition = this.tile.getWorldPosition();
        this.tile.setScale(0,0);
        
        fromTiles.forEach((tile : Tile|null) => {
            if (tile == null){
                return;
            }

            let worldPosition = tile.getWorldPosition();
            let ghostTexture = this.scene.add.image(worldPosition.tx, worldPosition.ty, tile.texture);
            ghostTexture.setDepth(0);
            ghostTexture.setScale(tile.scaleX, tile.scaleY);
            
            let mergeTween = this.scene.add.tween({
                targets: ghostTexture,
                x : thisTileWorldPosition.tx,
                y : thisTileWorldPosition.ty,
                scale : {from: ghostTexture.scale, to: ghostTexture.scale * 0.6},
                alpha: {from : 1, to: 0.4},
                duration: 500,
                ease: Phaser.Math.Easing.Cubic.In,
                onComplete: () => {
                    ghostTexture.destroy();
                }
            });

            simulationController.addSimulation(new TweenSimulation(mergeTween), true);
        });

        let appearTween = this.scene.add.tween({
            delay: 350,
            targets: this.tile,
            scaleX: { from: 0, to: currentScaleX },
            scaleY: { from: 0, to: currentScaleY },
            duration: 500,
            ease: 'Back.out',
        });

        simulationController.addSimulation(new TweenSimulation(appearTween), true);
        
    }
    
    public abstract onTilePop(): void;
    public abstract onTileDestroy(byTileEffect? : ITileEffect): void ;
    public abstract onTileSwapPop(other: ITileEffect): void ;

}

export default TileEffect;