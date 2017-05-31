
import { checkSwitchState, execValOrFunc, Match } from '../src/utils';
import { RouterStoreState } from '../src/RouterProvider';
import { Location } from 'history';

const location: Location = {
  pathname: '/home',
  hash: '',
  key: '0uicnx',
  search: '',
  state: null,
};
const match: Match = { params: 'hello' };
const parentRouterState: RouterStoreState = {
  location: location,
  match: match,
  switch: false,
};
const parentRouterStateWithSwitch: RouterStoreState = {
  location: location,
  match: match,
  switch: { matchIndex: 4, match: match },
};

describe('execValOrFunc', () => {
  it('return the value', () => {
    expect(execValOrFunc<boolean>(false, parentRouterState)).toEqual(false);
  });
  it('execute the function', () => {
    expect(execValOrFunc<boolean>(() => false, parentRouterState)).toEqual(false);
  });
  it('execute the function and return location', () => {
    expect(execValOrFunc<Location>((location) => location, parentRouterState)).toEqual(location);
  });
  it('execute the function and return match', () => {
    expect(execValOrFunc<Match>((location, match) => match, parentRouterState)).toEqual(match);
  });
});

describe('checkSwitchState', () => {
  it('should warn when switchIndex is set manually and return original value', () => {
    console.warn = jest.fn();
    expect(checkSwitchState({ switchIndex: 3 }, parentRouterState, match)).toEqual(match);
    expect(console.warn).toHaveBeenCalledWith(`You should not set switchIndex props yourself`);
  });
  it('should warn when switchIndex is not set manually in a Switch and return original value', () => {
    console.warn = jest.fn();
    expect(checkSwitchState({}, parentRouterStateWithSwitch, match)).toEqual(match);
    expect(console.warn).toHaveBeenCalledWith(
      `Error: Switch children are supposed to have switchIndex passed from parent`,
    );
  });
  it('should return false when swhitchIndex does not match', () => {
    expect(checkSwitchState({ switchIndex: 3 }, parentRouterStateWithSwitch, match)).toEqual(false);
  });
  it('should return value when swhitchIndex does match', () => {
    expect(checkSwitchState({ switchIndex: 4 }, parentRouterStateWithSwitch, match)).toEqual(match);
  });
});
