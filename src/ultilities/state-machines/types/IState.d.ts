
interface IState {
    enterState(enterTransitionData: IStateTransitionData | null): void;
    exitState(exitTransitionData: IStateTransitionData | null): void;

    update(deltaTime: number, transitionData: IStateTransitionData | null): void;
}
