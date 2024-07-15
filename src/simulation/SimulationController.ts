class SimulationController extends Phaser.GameObjects.GameObject {

    private simulations : ISimulation[] = [];
    private hasStarted : boolean = false;
    private hasEnded : boolean = false;
    private hasCompleted : boolean = false;

    private nextSimulations : ISimulation[] = [];
    private hasInvokeNextStart : boolean = false;

    private completeCallback : ()=>void = this.emptyFunction;
    private endCallback : ()=>void = this.emptyFunction;

    private nextCompleteCallback : ()=>void = this.emptyFunction;
    private nextEndCallback : ()=>void = this.emptyFunction;

    public static readonly COMPLETE_EVENT = 'complete';
    public static readonly START_EVENT = 'start';
    public static readonly END_EVENT = 'end';

    constructor(scene: Phaser.Scene){
        super(scene, 'SimulationController');
        this.simulations = [];

        
        this.scene.events.on('update', this.update, this);

    }

    update(...args: any[]): void {
        // this.simulations.forEach(simulation => {
        //     simulation.update();
        // });

        if ((this.hasInvokeNextStart) && this.hasEnded ) {
            this.extractNextSimulations();

            this.startSimulation(this.completeCallback, this.endCallback);
        }

        

        if(this.getCompleted() && this.hasStarted && !this.hasCompleted && !this.hasEnded){
            this.hasCompleted = true;
            this.simulations = [];
            
            this.completeCallback();
            this.emit(SimulationController.COMPLETE_EVENT);
            
            
            this.hasEnded = false;
        
            
        }

        if (this.getCompleted() && this.hasStarted && this.hasCompleted && !this.hasEnded) {
            this.hasEnded = true;
            this.simulations = [];
            
            this.endCallback();
            this.emit(SimulationController.END_EVENT);
        }
    }

    public addSimulation(simulation: ISimulation, mustInThisLoopEvenHaveEnded : boolean = false) : void{
        if (!this.hasCompleted){
            this.simulations.push(simulation);
            simulation.start();
            return;
        }

        if (this.hasCompleted && !this.hasEnded && mustInThisLoopEvenHaveEnded) {
            this.simulations.push(simulation);
            simulation.start();
            return;
        }
        
        
        this.nextSimulations.push(simulation);
        
    }

    public startSimulation(completeCallback? : ()=>void, endCallback? : () => void) : void{

        if (this.hasStarted && !this.hasEnded) {
            this.hasInvokeNextStart = true;
            this.nextCompleteCallback = completeCallback || (this.emptyFunction);
            this.nextEndCallback = endCallback || (this.emptyFunction);
            return;
        }

        this.hasStarted = true;
        this.hasInvokeNextStart = false;
        this.hasCompleted = false;
        this.hasEnded = false;


        if (this.simulations.length == 0 && this.nextSimulations.length != 0) {
            this.extractNextSimulations();
        }

        this.completeCallback = completeCallback || (this.emptyFunction);
        this.endCallback = endCallback || (this.emptyFunction);

        this.simulations.forEach(simulation => {
            simulation.start();
        });

        this.emit(SimulationController.START_EVENT);
    
    }

    private extractNextSimulations() : void{
        this.simulations = this.nextSimulations;
        this.nextSimulations = [];

        this.hasInvokeNextStart = false;

        this.completeCallback = this.nextCompleteCallback;
        this.endCallback = this.nextEndCallback;

        this.nextCompleteCallback = this.emptyFunction;
        this.nextEndCallback = this.emptyFunction;
    }

    private emptyFunction(){

    }

    public removeSimulation(simulation: ISimulation): void{
        this.simulations = this.simulations.filter(sim => sim !== simulation);
    }

    public stopSimulation() : void{
        this.simulations.forEach(simulation => {
            simulation.stop();
        });
        this.hasStarted = false;
    }

    public getCompleted(): boolean{
        let isComplete = true;
        this.simulations.forEach(simulation => {
            if(!simulation.getCompleted()){
                isComplete = false;
            }
        });
        return isComplete;
    }


    public getSimulations(): ISimulation[]{
        return this.simulations;
    }


}

export default SimulationController;