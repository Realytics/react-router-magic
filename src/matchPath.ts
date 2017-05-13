import * as pathToRegexp from 'path-to-regexp';
import { PathRegExp, Key } from 'path-to-regexp';

export type Match<P> = {
  params: P;
  isExact: boolean;
  path: string;
  url: string;
};

export type MatchPathOptions = {
  path?: string,
  strict?: boolean;
  exact?: boolean;
};

type CompilePathOptions = {
  strict?: boolean;
  end?: boolean;
};

type CompiledPattern = {
  re: PathRegExp,
  keys: Key[]
};

type PatternCache = { [key: string]: CompiledPattern };

const patternCache: { [key: string]: PatternCache } = {};
const cacheLimit: number = 10000;
let cacheCount: number = 0;

function compilePath(pattern: string, options: CompilePathOptions): CompiledPattern {
  const cacheKey: string = `${options.end}${options.strict}`;
  const cache: PatternCache = patternCache[cacheKey] || (patternCache[cacheKey] = {});

  if (cache[pattern]) {
    return cache[pattern];
  }

  const keys: Key[] = [];
  const re: PathRegExp = pathToRegexp(pattern, keys, options);
  const compiledPattern: CompiledPattern = { re, keys };

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern;
    cacheCount++;
  }

  return compiledPattern;
}

/**
 * Public API for matching a URL pathname to a path pattern.
 */
export function matchPath<P extends any>(pathname: string, options: (MatchPathOptions | string) = {}): Match<P> | null {
  if (typeof options === 'string') {
    options = { path: options };
  }

  const { path = '/', exact = false, strict = false }: MatchPathOptions = options;
  const { re, keys }: CompiledPattern = compilePath(path, { end: exact, strict });
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
    url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
    isExact, // whether or not we matched exactly
    params: keys.reduce<{[key: string]: string}>(
      (memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      },
      {}
    )
  } as Match<any>;
}
