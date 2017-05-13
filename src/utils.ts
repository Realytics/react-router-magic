import { Location, LocationDescriptorObject, Path } from 'history';
import { Match, matchPath, MatchPathOptions } from './matchPath';
import { Store } from './Store';
import { isString, startsWith, trimStart, trim } from 'lodash';
import { RouterStoreState } from './RouterProvider';

export type MatchResult = {
  match: Match<{}> | null;
  location: Location;
};

export type RealtiveAbsoluteProps = {
  absolute?: boolean;
  relative?: boolean;
};

export type MatchProps = (
  MatchPathOptions &
  RealtiveAbsoluteProps
);

export function createLocationDescriptorObject(
  to: LocationDescriptorObject | Path,
  props: MatchProps,
  parentMatch: Match<{}> | null): LocationDescriptorObject {
  const pathname: string | undefined = buildAbsolutePath(
    {
      ...props,
      path: isString(to) ? to : to.pathname,
    },
    parentMatch
  );

  return {
    ...(isString(to) ? {} : to),
    pathname: pathname
  };
}

export function isPathRelative(path: string, options: RealtiveAbsoluteProps): boolean {
  if (!isString(path)) {
    return false;
  }
  const detectedRelative: boolean = !startsWith(path, '/');
  if (options.absolute && options.relative) {
    console.warn('You passed both absolute and relative props to Route \nBoth are ignored (use detection)');
    return detectedRelative;
  }
  if ((detectedRelative && options.relative) || (!detectedRelative && options.absolute)) {
    return detectedRelative;
  }
  if (options.relative) {
    return true;
  }
  if (options.absolute) {
    return false;
  }
  return detectedRelative;
}

export function buildAbsolutePath(props: MatchProps, parentMatch: Match<{}> | null): string | undefined {
  if (!isString(props.path)) {
    return props.path;
  }
  const relativePath: boolean = isPathRelative(props.path, props);
  if (!relativePath) { // absolute
    return '/' + trimStart(props.path, '/');
  }
  if (parentMatch && parentMatch.path) {
    const base: string = '/' + trim(parentMatch.path, '/');
    return base + '/' + trimStart(props.path, '/');
  }
  return props.path;
}

export function match(
  routerStore: Store<RouterStoreState>,
  props: MatchProps
): MatchResult {

  const parentRouterState: RouterStoreState = routerStore.getState();
  const parentMatch: Match<{}> | null = parentRouterState && parentRouterState.match;

  const path: string | undefined = buildAbsolutePath(props, parentMatch);

  const match: Match<{}> | null = matchPath(
    parentRouterState.location.pathname,
    {
      exact: props.exact,
      strict: props.strict,
      path: path
    }
  );

  console.log(path);
  console.log(match);

  return {
    match: match,
    location: parentRouterState.location
  };

}