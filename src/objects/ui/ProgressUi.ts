import { GameObjects, Tweens } from "phaser";

class ProgressUi extends GameObjects.Container {
    private progressBar: GameObjects.NineSlice;
    private progressFill : GameObjects.NineSlice;
    private progressBorder : GameObjects.NineSlice;

    private moveTween : Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number, y: number, barWidth: number, barHeight: number) {

        super(scene, x, y);

        this.progressBar = this.scene.add.nineslice(x, y, 'progress-bar-02', '', barWidth, barHeight);
        this.progressBar.setOrigin(0,0.5);
        this.add(this.progressBar);
        this.progressBar.setDisplaySize(barWidth, barHeight);


        this.progressFill = this.scene.add.nineslice(x + 10, y, 'progress-bar-01', '', barWidth * 0.975, barHeight, barWidth/4, barWidth/4);
        this.progressFill.setOrigin(0,0.5);
        this.add(this.progressFill);
        this.progressFill.setScale(0, 1);

        this.progressBorder = this.scene.add.nineslice(x, y, 'progress-bar-03', '', barWidth, barHeight);
        this.progressBorder.setOrigin(0,0.5);
        this.add(this.progressBorder);
        this.progressBorder.setDisplaySize(barWidth, barHeight);    

        this.scene.add.existing(this);
    }

    public setProgress(progress: number) {
        if (progress < 0) {
            progress = 0;
        }
        if (progress > 1) {
            progress = 1;
        }


        if (this.moveTween) {
            this.moveTween.stop();
        }

        this.moveTween = this.scene.add.tween({
            targets: this.progressFill, // Replace 'targets' with the appropriate target object
            duration: 500, // Replace with the desired duration in milliseconds
            scaleX: progress, // Replace with the desired final scale value
            ease: 'Cubic.easeOut' // Replace with the desired easing function
        });
    }
}


export default ProgressUi;