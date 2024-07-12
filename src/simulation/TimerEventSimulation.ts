import { Scene } from "phaser";

class TimerEventSimulation implements ISimulation {
    private timerEvent: Phaser.Time.TimerEvent;
    private isComplete: boolean = false;

    constructor(scene: Scene, delay: number, callback: () => void, repeat: number = 0) {
        this.timerEvent = scene.time.addEvent({
            delay: delay,
            callback: callback,
            callbackScope: this,
            repeat : repeat,
            loop: false,
            paused: true // Start paused
        });
    }

    public update(): void {
        // TimerEvent is managed by Phaser's internal clock, so no update logic is needed here.
    }

    public start(): void {
        this.timerEvent.paused = false; // Resume the timer
    }

    public stop(): void {
        this.timerEvent.paused = true; // Pause the timer
        this.timerEvent.remove(false); // Remove the event without calling the callback
        this.isComplete = true; // Mark as complete
    }

    public getCompleted(): boolean {
        return this.isComplete || (this.timerEvent.getOverallRemainingSeconds() == 0);
    }
}

export default TimerEventSimulation;