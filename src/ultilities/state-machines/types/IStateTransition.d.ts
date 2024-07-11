
interface IStateTransition {
    readonly toState: IState;
    readonly condition: IStatePredicate;
}
