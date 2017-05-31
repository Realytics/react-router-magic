import { Store } from '../src/Store';

describe('Store', () => {

  type State = {
    value: string;
  };

  const state: State = {
    value: 'hello',
  };

  const newState: State = {
    value: 'nes Hello',
  };

  it('should create a Store', () => {
    expect(new Store<State>(state)).toBeInstanceOf(Store);
  });

  const store: Store<State> = new Store<State>(state);
  it('getState should return state', () => {
    expect(store.getState()).toEqual(state);
  });
  it('setState should change state and return store', () => {
    expect(store.setState(newState)).toEqual(store);
    expect(store.getState()).toEqual(newState);
  });
  it('trigger listeners when setState', () => {
    const cb = jest.fn();
    const unsubscribe = store.subscribe(cb);
    expect(store.setState(state)).toEqual(store);
    expect(store.getState()).toEqual(state);
    expect(cb).toHaveBeenCalled();
  });
  it('not trigger listeners when unsubscribe', () => {
    const cb = jest.fn();
    const unsubscribe = store.subscribe(cb);
    expect(store.setState(state)).toEqual(store);
    expect(store.getState()).toEqual(state);
    expect(cb).toHaveBeenCalledTimes(1);
    unsubscribe();
    expect(store.setState(newState)).toEqual(store);
    expect(store.getState()).toEqual(newState);
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it('unsubscribe twice should not throw error', () => {
    const cb = jest.fn();
    const unsubscribe = store.subscribe(cb);
    unsubscribe();
    expect(unsubscribe).not.toThrowError();
  });

});
