export class Store<State> {

  private listeners: ((state: State) => void)[] = [];

  private state: State;

  constructor(initialState: State) {
    this.state = initialState;

    this.subscribe = this.subscribe.bind(this);
  }

  setState(newState: State): void {
    this.state = newState;
    this.broadcast(this.state);
  }

  broadcast(state: any): void {
    this.listeners.forEach(listener => listener(state));
  }

  getState(): State {
    return this.state;
  }

  subscribe(listener: (state: State) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index: number = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

}
