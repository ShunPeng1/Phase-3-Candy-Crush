import TweenUtilities from "../../ultilities/TweenUtilities";

class Tile extends Phaser.GameObjects.Image {
    public readonly tileType: ITileEffect;

    private hoverTween: Phaser.Tweens.Tween;

    constructor(params: IImageConstructor, tileType: ITileEffect) {
        super(params.scene, params.x, params.y, params.texture, params.frame);

        this.tileType = tileType;

        // set image settings
        this.setOrigin(0.5, 0.5);
        this.setInteractive();

        this.scene.add.existing(this);


        TweenUtilities.applyImageDisplaySizeTweens(this, 'pointerover', 'pointerout', 1.1, 100);
    }

    



}


export default Tile;