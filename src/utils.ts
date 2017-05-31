import isFunction = require('lodash.isfunction');
import { RouterStoreState } from './RouterProvider';

import { Location } from 'history';
export type Match = null | undefined | boolean | object;

export type ValOrFunc<Result> = Result | ((location: Location, parentMatch: Match) => Result);

export function execValOrFunc<Val>(
  valOrFunc: ValOrFunc<Val>,
  parentRouterState: RouterStoreState,
): Val {
  if (isFunction(valOrFunc)) {
    return valOrFunc(parentRouterState.location, parentRouterState.match);
  }
  return valOrFunc;
}

export function checkSwitchState(
  props: { switchIndex?: number },
  parentRouterState: RouterStoreState,
  match: Match,
): Match {
  if (parentRouterState.switch === false && props.switchIndex !== undefined) {
    console.warn(`You should not set switchIndex props yourself`);
  }
  if (parentRouterState.switch && props.switchIndex === undefined) {
    console.warn(`Error: Switch children are supposed to have switchIndex passed from parent`);
  }
  if (
    parentRouterState.switch &&
    props.switchIndex === undefined &&
    parentRouterState.switch.matchIndex !== props.switchIndex
  ) {
    return false;
  }
  return match;
}
