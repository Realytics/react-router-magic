import * as pathToRegexp from 'path-to-regexp';
import { PathRegExp, PathFunction, RegExpOptions, ParseOptions, Key } from 'path-to-regexp';
import { IPathPattern, Match } from './interface.d';
import reduce = require('lodash/reduce');

export class PathPattern<P> implements IPathPattern<P> {

  private re: PathRegExp;
  private reCompile: PathFunction;
  private options: RegExpOptions & ParseOptions;

  constructor(
    private path: string,
    strict: boolean,
    exact: boolean,
  ) {
    this.options = { end: exact, strict };
    this.reCompile = pathToRegexp.compile(path);
    this.re = pathToRegexp(this.path, this.options);
  }

  match(location: string): Match<P> | null {
    const match: RegExpExecArray | null = this.re.exec(location);

    if (!match) {
      return null;
    }

    const [url, ...values]: RegExpExecArray = match;
    const isExact: boolean = location === url;

    if (this.options.end && !isExact) {
      return null;
    }

    return {
      path: this.path, // the path pattern used to match
      url: (this.path === '/' && url === '') ? '/' : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: reduce<Key, {}>(
        this.re.keys,
        (memo: any, key: Key, index: number) => {
          memo[key.name] = values[index];
          return memo;
        },
        {},
      ) as P,
    };
  }

  compile(params: P): string {
    return this.reCompile(params);
  }

}
