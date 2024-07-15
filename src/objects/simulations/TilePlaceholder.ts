import { GameObjects } from "phaser";

class TilePlaceholder extends GameObjects.Graphics {
    public index : Phaser.Math.Vector2;


    constructor(scene: Phaser.Scene, x: number, y: number, index : Phaser.Math.Vector2) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.index = index;
    }
}

export default TilePlaceholder;