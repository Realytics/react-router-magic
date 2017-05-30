import { Match, IPathPattern } from './interface.d';
import isFunction = require('lodash.isFunction');
import { RouterStoreState } from './RouterProvider';

export function compilePattern<P extends {}>(
  pattern: (
    null |
    undefined |
    IPathPattern<P> |
    ((parentPattern: IPathPattern<{}> | null, parentMatch: Match<any> | false) => IPathPattern<P>)
  ),
  parentRouterState: RouterStoreState,
): IPathPattern<P> | null {
  if (pattern === undefined || pattern === null) {
    return null;
  }
  return isFunction(pattern) ? pattern(
    parentRouterState.pattern,
    parentRouterState.match,
  ) : pattern;
}

export function matchPattern<P extends {}>(
  pattern: (
    null |
    IPathPattern<P>
  ),
  parentRouterState: RouterStoreState,
): Match<P> | false {
  const { pathname = '' } = parentRouterState.location;
  if (pattern === null) {
    // universal match
    return {
      params: {} as P,
      isExact: false,
      path: '',
      url: pathname,
    };
  }
  return pattern.match(pathname);
}
