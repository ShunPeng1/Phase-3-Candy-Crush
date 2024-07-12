class SimulationController extends Phaser.GameObjects.GameObject {

    private simulations : ISimulation[] = [];
    private hasStarted : boolean = false;
    private hasEnded : boolean = false;
    private hasCompleted : boolean = false;

    private nextSimulations : ISimulation[] = [];
    private hasInvokeNextStart : boolean = false;

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
            this.simulations = this.nextSimulations;
            this.nextSimulations = [];
            this.startSimulation();
            
        }

        

        if(this.getCompleted() && this.hasStarted && !this.hasCompleted){
            this.hasCompleted = true;
            this.clear();
            
            this.emit(SimulationController.COMPLETE_EVENT);
            
            if (this.simulations.length == 0){
                this.hasEnded = true;            
                this.hasStarted = false;
                this.emit(SimulationController.END_EVENT);
            }
            else{
                this.hasEnded = false;
            }
            
        }

        if (this.getCompleted() && this.hasStarted && this.hasCompleted && !this.hasEnded) {
            this.hasEnded = true;
            this.hasStarted = false;
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

    public startSimulation() : void{

        if (this.hasStarted) {
            this.hasInvokeNextStart = true;
            return;
        }

        this.hasStarted = true;
        this.hasInvokeNextStart = false;
        this.hasCompleted = false;
        this.hasEnded = false;

        if (this.simulations.length == 0 && this.nextSimulations.length != 0) {
            this.simulations = this.nextSimulations;
            this.nextSimulations = [];

        }

        this.simulations.forEach(simulation => {
            simulation.start();
        });

        this.emit(SimulationController.START_EVENT);
    
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

    public clear() : void{
        this.simulations = [];
    }

    public getSimulations(): ISimulation[]{
        return this.simulations;
    }


}

export default SimulationController;