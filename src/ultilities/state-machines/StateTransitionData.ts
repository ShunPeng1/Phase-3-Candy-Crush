

class StateTransitionData implements IStateTransitionData{
    fromState: IState;
    transition: IStateTransition;
    castTo<T extends IStateTransitionData>(): T {
        throw new Error("Method not implemented.");
    }

}

export default StateTransitionData;