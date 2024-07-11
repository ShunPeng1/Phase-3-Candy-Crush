
import StateTransitionData from "./StateTransitionData";



class BaseStateMachine {
    private currentState: StateNode;
    private nodes: Map<any, StateNode> = new Map();
    private anyStateTransitions: Set<IStateTransition> = new Set();
    private emptyState: EmptyState = new EmptyState();
    protected stateHistoryStrategy: IStateMementoStrategy;

    protected constructor() {
        this.addOrOverwriteState(this.emptyState);
    }

    public setInitialState(initialState: IState, onEnterCall: boolean, enterData: IStateTransitionData | null = null): void  {
        let initialStateNode : StateNode;
        if (this.nodes.has(initialState.constructor)) {
            initialStateNode = this.nodes.get(initialState.constructor)!;
        }
        else{
            initialStateNode = new StateNode(initialState);
            this.nodes.set(initialStateNode.state.constructor, initialStateNode);
        }
        
        this.currentState = initialStateNode;

        this.stateHistoryStrategy?.save(initialStateNode.state, enterData);

        if (onEnterCall) {
            initialStateNode.state.enterState(enterData);
        }
    
    }

    public static Builder = class {
        private initialStateNode: StateNode | null = null;
        private onEnterCall: boolean = false;
        private enterData: IStateTransitionData | null = null;
        private stateHistoryStrategy: IStateMementoStrategy;

        public build(): BaseStateMachine {
            const stateMachine = new BaseStateMachine();
            stateMachine.stateHistoryStrategy = this.stateHistoryStrategy;

            if (this.initialStateNode) {
                stateMachine.setInitialState(this.initialStateNode.state, this.onEnterCall, this.enterData);
            }
            return stateMachine;
        }

        public withInitialState(initialState: IState, onEnterCall: boolean, enterData: IStateTransitionData | null = null): this {
            this.initialStateNode = new StateNode(initialState);
            this.onEnterCall = onEnterCall;
            this.enterData = enterData;
            return this;
        }

        public withHistoryStrategy(historyStrategy: IStateMementoStrategy): this {
            this.stateHistoryStrategy = historyStrategy;
            return this;
        }
    }

    public update(deltaTime : number): void {
        const transition = this.getTransition();
        let transitionData : StateTransitionData | null = null;
        if (transition) {
            transitionData = new StateTransitionData();
            transitionData.fromState = this.currentState.state;
            transitionData.transition = transition;
            this.setToState(transition.toState, null);
            return;
        }
        this.currentState?.state.update(deltaTime, transitionData);
    }


    private getTransition(): IStateTransition | null {
        for (const transition of this.anyStateTransitions) {
            if (transition.condition.evaluate()) {
                return transition;
            }
        }

        if (!this.currentState || !this.currentState.transitions) return null;

        for (const transition of this.currentState?.transitions) {
            if (transition.condition.evaluate()) {
                return transition;
            }
        }

        return null;
    }
    
    public addOrOverwriteState(baseState: IState, transitions: Set<IStateTransition> = new Set()): void {
        if (this.nodes.has(baseState.constructor)) {
            this.nodes.delete(baseState.constructor);
        }


        this.nodes.set(baseState.constructor, new StateNode(baseState, transitions));
    }

    public removeState(state: IState): void {
        this.nodes.delete(state.constructor);
    }

    public addTransition(fromState: IState, toState: IState, predicate: IStatePredicate): void {
        this.getOrAddNode(fromState).addTransition(toState, predicate);
    }

    public addAnyTransition(toState: IState, predicate: IStatePredicate): void {
        this.anyStateTransitions.add({ toState: toState, condition: predicate });
    }

    public removeTransition(fromState: IState, toState: IState, predicate: IStatePredicate): void {
        this.getOrAddNode(fromState).removeTransition(toState, predicate);
    }

    public removeAnyTransition(toState: IState, predicate: IStatePredicate): void {
        this.anyStateTransitions.forEach(transition => {
            if (transition.toState === toState && transition.condition === predicate) {
                this.anyStateTransitions.delete(transition);
            }
        });
    }

    private getOrAddNode(state: IState): StateNode {
        let node = this.nodes.get(state.constructor);
        if (!node) {
            node = new StateNode(state);
            this.nodes.set(state.constructor, node);
        }
        return node;
    }

    public setToState(toState: IState | null, transitionData: IStateTransitionData | null = null): void {
        if (!toState || toState === this.currentState.state) return;

        const nextState = this.nodes.get(toState.constructor);
        if (nextState) {
            this.stateHistoryStrategy?.save(nextState.state, transitionData);
            this.switchState(nextState, transitionData);
        } else {
            console.warn(`State ${toState.constructor.name} not found in state machine.`);
        }
    }

    public getCurrentState(): IState {
        return this.currentState?.state;
    }

    public setToEmptyState(): void {
        this.setToState(this.emptyState);
    }

    public getCurrentStateType(): any {
        return this.currentState?.state.constructor;
    }

    public restoreState(): void {
        if (!this.stateHistoryStrategy) return;
        const [enterState, exitOldStateParameters] = this.stateHistoryStrategy.restore();
        if (enterState) {
            this.setToState(enterState, exitOldStateParameters);
        } else {
            console.warn("No state to restore.");
            this.setToState(null);
        }
    }

    public peakHistory(): [IState | null, IStateTransitionData | null] {
        if (!this.stateHistoryStrategy) return [null, null];
        const [enterState, exitOldStateParameters] = this.stateHistoryStrategy.restore(false);
        return [enterState, exitOldStateParameters];
    }

    private switchState(nextState: StateNode, transitionData: IStateTransitionData | null = null): void {
        this.currentState.state.exitState(transitionData);
        const lastStateEnum = this.currentState;
        this.currentState = nextState;
        nextState.state.enterState(transitionData);
    }
}


class StateNode {
    public state: IState;
    public transitions: Set<IStateTransition>;

    constructor(state: IState, transitions: Set<IStateTransition> = new Set()) {
        this.state = state;
        this.transitions = transitions;
    }

    public addTransition(to: IState, condition: IStatePredicate): void {
        this.transitions.add({ toState: to, condition: condition });
    }

    public removeTransition(to: IState, condition: IStatePredicate): void {
        this.transitions.forEach(transition => {
            if (transition.toState === to && transition.condition === condition) {
                this.transitions.delete(transition);
            }
        });
    }
}

class EmptyState implements IState {
    public enterState(enterTransitionData: IStateTransitionData | null): void {
    }
    public exitState(exitTransitionData: IStateTransitionData | null): void {
    }
    public update(deltaTime: number, transitionData: IStateTransitionData | null): void {
        // Do nothing
    }
}

export default BaseStateMachine;