class ScoreController extends Phaser.Events.EventEmitter{
    
    private currentScore: number = 0;
    private targetScore: number = 0;
    private accumaletedScore: number = 0;
    private diffcultyScale: number = 1;

    private isEnable = true;


    public static readonly SCORE_CHANGED_EVENT = 'scoreChanged';
    public static readonly TARGET_SCORE_REACHED_EVENT = 'targetScoreReached';

    constructor(accumaletedScore: number, diffcultyScale: number) {
        super();
        this.targetScore = accumaletedScore * diffcultyScale;
        this.accumaletedScore = accumaletedScore;   
        this.diffcultyScale = diffcultyScale;
    }

    public setTargetScore(targetScore: number) {
        this.targetScore = targetScore;
    }

    public setCurrentScore(score: number) {
        this.currentScore = score;

        this.emit(ScoreController.SCORE_CHANGED_EVENT, this.currentScore, 0, this.targetScore);
    }

    public getCurrentScore(): number {
        return this.currentScore;
    }

    public getTargetScore(): number {
        return this.targetScore;
    }

    public setEnable(isEnable: boolean) {
        this.isEnable = isEnable;
    }

    public addScore(score: number) {
        if (!this.isEnable) {
            return;
        }

        this.currentScore += score;
        this.emit(ScoreController.SCORE_CHANGED_EVENT, this.currentScore, score, this.targetScore);
    
        if (this.currentScore >= this.targetScore) {
            this.emit(ScoreController.TARGET_SCORE_REACHED_EVENT);
        
            this.currentScore = 0;

            this.accumaletedScore *= this.diffcultyScale;
            this.targetScore += this.accumaletedScore;

        }
    
    }
    
}

export default ScoreController;