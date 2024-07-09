interface ISimulation {
    update(): void;
    start(): void;
    stop(): void;
    getCompleted(): boolean;
}