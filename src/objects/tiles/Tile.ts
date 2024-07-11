import TweenUtilities from "../../ultilities/TweenUtilities";
import TileGrid from "../grids/TileGrid";

class Tile extends Phaser.GameObjects.Image {
    private tileEffect: ITileEffect;
    private grid : TileGrid;
    constructor(params: IImageConstructor) {
        super(params.scene, params.x, params.y, params.texture, params.frame);


        // set image settings
        this.setOrigin(0.5, 0.5);
        this.setInteractive();

        this.scene.add.existing(this);

        TweenUtilities.applyImageDisplaySizeTweens(this, 'pointerover', 'pointerout', 1.1, 100);
    
        this.on('pointerdown', ()=>{
            console.log("Tile Clicked");
        }, this);
    }

    

    public getWorldPosition() {
        const gridWorldTransform = this.grid.getWorldTransformMatrix();

        let localTransform = this.getLocalTransformMatrix();
    
        localTransform.tx += gridWorldTransform.tx
        localTransform.ty += gridWorldTransform.ty;

        return localTransform;
    }

    public setTileEffect(tileEffect: ITileEffect): this {
        this.tileEffect = tileEffect;
        return this;
    }

    public setTileGrid(grid : TileGrid) : this { 
        this.grid = grid;
        return this;
    }
    
    public getColor(): string {
        return this.tileEffect.color;
    }

    public destroy(fromScene?: boolean): void {
        this.tileEffect.onTilePop();
        super.destroy(fromScene);
    }


}


export default Tile;