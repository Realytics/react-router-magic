import { Location, LocationDescriptorObject, Path, Search, LocationState, Hash, LocationKey } from 'history';
import isString = require('lodash/isString');
import startsWith = require('lodash/startsWith');
import trimStart = require('lodash/trimStart');
import trim = require('lodash/trim');
import * as pathToRegexp from 'path-to-regexp';
import { PathRegExp, Key, PathFunction, RegExpOptions, ParseOptions } from 'path-to-regexp';

export type RealtiveAbsoluteOptions = {
  absolute: boolean;
  relative: boolean;
};

export type PathObject = {
  path: string,
  strict: boolean;
  exact: boolean;
};

export type LocationDescriptorProps = {
  search?: Search;
  state?: LocationState;
  hash?: Hash;
  key?: LocationKey;
};

export type FromLocationObj = (
  PathObject &
  RealtiveAbsoluteOptions
);

export type FromLocationProps = Partial<FromLocationObj>;

export type ToLocationObj = (
  PathObject &
  RealtiveAbsoluteOptions &
  LocationDescriptorProps & {
    replace: boolean;
    params?: {}; // used to build pathname with path
  }
);

export type ToLocationProps = Partial<ToLocationObj>;

export type Match<P> = {
  params: P;
  isExact: boolean;
  path: string;
  url: string;
};

type CompiledPattern = {
  re: PathRegExp;
  keys: Key[];
  compile: PathFunction;
};

type PatternCache = {
  [key: string]: CompiledPattern;
};

const patternCache: { [key: string]: PatternCache } = {};
const cacheLimit: number = 10000;
let cacheCount: number = 0;

function compilePath(pattern: string, options: RegExpOptions & ParseOptions): CompiledPattern {
  const cacheKey: string = `${options.end}${options.strict}`;
  const cache: PatternCache = patternCache[cacheKey] || (patternCache[cacheKey] = {});

  if (cache[pattern]) {
    return cache[pattern];
  }

  const keys: Key[] = [];
  const re: PathRegExp = pathToRegexp(pattern, keys, options);
  const compile: PathFunction = pathToRegexp.compile(pattern);
  const compiledPattern: CompiledPattern = { re, keys, compile };

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern;
    cacheCount++;
  }

  return compiledPattern;
}

function isPathRelative(path: string, options: RealtiveAbsoluteOptions): boolean {
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

function getCompiledPattern(options: PathObject): CompiledPattern {
  const { path, exact, strict } = options;
  return compilePath(path, { end: exact, strict });
}

/**
 * Public API for matching a URL pathname to a path pattern.
 */
function matchAbsolutePath<P extends {[key: string]: string}>(
  pathname: string,
  pathObj: PathObject,
): Match<P> | null {
  const { exact, path } = pathObj;
  const { re, keys } = getCompiledPattern(pathObj);
  const match: RegExpExecArray | null = re.exec(pathname);

  if (!match) {
    return null;
  }

  const [url, ...values]: RegExpExecArray = match;
  const isExact: boolean = pathname === url;

  if (exact && !isExact) {
    return null;
  }

  return {
    path, // the path pattern used to match
    url: (path === '/' && url === '') ? '/' : url, // the matched portion of the URL
    isExact, // whether or not we matched exactly
    params: keys.reduce<P>(
      (memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      },
      {} as any,
    ),
  };
}

function buildAbsolutePath(
  path: Path | undefined,
  options: RealtiveAbsoluteOptions,
  parentMatch: Match<{}> | null,
): Path {
  if (!isString(path)) {
    path = '';
  }
  const relativePath: boolean = isPathRelative(path, options);
  if (!relativePath) { // absolute
    return '/' + trimStart(path, '/');
  }
  const base: string = (parentMatch && parentMatch.path) ? '/' + trim(parentMatch.path, '/') : '/';
  return base + '/' + trimStart(path, '/');
}

function buildAbsolutePathObject(
  parentMatch: Match<{}> | null,
  props: FromLocationObj,
): PathObject {
  const { absolute, relative, exact, strict } = props;

  const path: Path = buildAbsolutePath(
    props.path,
    { absolute, relative },
    parentMatch,
  );

  return { path, exact, strict };
}

export function matchPath(
  location: Location,
  parentMatch: Match<{}> | null,
  props: FromLocationObj,
): Match<{}> | null {
  const pathObj: PathObject = buildAbsolutePathObject(parentMatch, props);
  const match: Match<{}> | null = matchAbsolutePath(location.pathname, pathObj);
  return match;
}

export function createLocationDescriptor(
  parentMatch: Match<{}> | null,
  props: ToLocationObj,
): LocationDescriptorObject {
  const { search, state, hash, key }: ToLocationProps = isString(props) ? {} : props;
  const path: Path = createPath(
    parentMatch,
    props,
    props.params,
  );
  return {
    pathname: path,
    search,
    state,
    hash,
    key,
  };
}

export function normalizeFromObject(fromObj: FromLocationProps | string = {}): FromLocationObj {
  const obj: FromLocationProps = isString(fromObj) ? { path: fromObj } : fromObj;
  const {
    path = '',
    exact = false,
    strict = false,
    absolute = false,
    relative = false,
  } = obj;
  return {
    ...obj,
    path,
    exact,
    strict,
    absolute,
    relative,
  };
}

export function normalizeToObject(
  toObj: ToLocationProps | string = {},
  replaceByDefault: boolean = false,
): ToLocationObj {
  const obj: ToLocationProps = isString(toObj) ? { path: toObj } : toObj;
  const { replace = replaceByDefault } = obj;
  return {
    ...obj,
    ...normalizeFromObject(obj),
    replace,
  };
}

export function createPath(parentMatch: Match<{}> | null, toObj: ToLocationProps, params?: {}): Path {
  const pathObj: PathObject = buildAbsolutePathObject(
    parentMatch,
    normalizeToObject(toObj),
  );
  const { compile }: CompiledPattern = getCompiledPattern(pathObj);
  return compile(params);
}
