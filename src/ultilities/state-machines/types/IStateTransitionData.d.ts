

interface IStateTransitionData {
    fromState: IState;
    transition: IStateTransition;

    castTo<T extends IStateTransitionData>(): T;
}
