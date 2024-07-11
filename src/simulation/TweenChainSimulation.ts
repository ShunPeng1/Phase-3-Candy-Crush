import { Scene } from "phaser";

class TweenChainSimulation implements ISimulation{
    private tween: Phaser.Tweens.TweenChain;
    private isComplete: boolean = false;

    constructor(tween: Phaser.Tweens.TweenChain){
        this.tween = tween;

        this.tween.on('complete', () => {
            this.isComplete = true;
        });

        this.tween.pause();
        this.isComplete = false;
    }

    public update(): void {
        // do nothing
    }

    public start(): void {
        this.tween.play();
    }
    public stop(): void {
        this.tween.stop();
    }
    public getCompleted(): boolean {
        return this.isComplete;
    }
    
}


export default TweenChainSimulation;