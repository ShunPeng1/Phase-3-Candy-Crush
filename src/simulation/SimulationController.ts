class SimulationController extends Phaser.GameObjects.GameObject {

    private simulations : ISimulation[] = [];
    private hasStarted : boolean = false;
    private hasCompleted : boolean = false;
    constructor(scene: Phaser.Scene){
        super(scene, 'SimulationController');
        this.simulations = [];

        
        this.scene.events.on('update', this.update, this);

    }

    update(...args: any[]): void {
        // this.simulations.forEach(simulation => {
        //     simulation.update();
        // });
        

        if(this.getCompleted() && this.hasStarted && !this.hasCompleted){
            this.hasCompleted = true;
            this.emit('complete');
        }
    }

    public addSimulation(simulation: ISimulation) : void{
        this.simulations.push(simulation);
    }

    public startSimulation(autoReset: boolean = true) : void{
        this.hasStarted = true;
        this.hasCompleted = false;

        this.simulations.forEach(simulation => {
            simulation.start();
        });
    
        

        if(autoReset){
            const onComplete = () => {
                if(autoReset){
                    this.clear();
                }
                // Remove the 'complete' event listener to prevent it from being called again
                this.off('complete', onComplete);
            };
            
            this.on('complete', onComplete);

        }
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