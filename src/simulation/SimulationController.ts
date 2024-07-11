class SimulationController extends Phaser.GameObjects.GameObject {

    private simulations : ISimulation[] = [];
    private hasStarted : boolean = false;
    private hasEnded : boolean = false;
    private hasCompleted : boolean = false;
    private isAutoReset : boolean = true;

    private nextSimulations : ISimulation[] = [];
    private hasInvokeNextStart : boolean = false;
    private isNextReset : boolean = false;
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
            this.startSimulation(this.isNextReset);
        }

        

        if(this.getCompleted() && this.hasStarted && !this.hasCompleted){

            this.hasCompleted = true;
            this.emit('complete');
            if (this.isAutoReset){
                this.clear();
            }
            this.hasEnded = true;
        }
    }

    public addSimulation(simulation: ISimulation, mustInThisLoop : boolean = false) : void{
        if (mustInThisLoop && !this.hasCompleted || !this.hasStarted){
            this.simulations.push(simulation);
            simulation.start();
            return;
        }
        
        this.nextSimulations.push(simulation);
        
    }

    public startSimulation(autoReset: boolean = true) : void{

        if (this.hasStarted) {
            this.hasInvokeNextStart = true;
            this.isNextReset = autoReset;
            return;
        }

        this.hasStarted = true;
        this.hasInvokeNextStart = false;
        this.hasCompleted = false;
        this.hasEnded = false;
        this.isAutoReset = autoReset;

        this.simulations.forEach(simulation => {
            simulation.start();
        });
    
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
        this.hasStarted = false;
    }

    public getSimulations(): ISimulation[]{
        return this.simulations;
    }


}

export default SimulationController;