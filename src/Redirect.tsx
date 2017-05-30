import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { History, Search, LocationState, Hash, LocationKey, LocationDescriptorObject } from 'history';
import { Store } from './Store';
import { Match, IPathPattern } from './interface.d';
import isFunction = require('lodash.isfunction');
import { RouterStoreState } from './RouterProvider';
import { compilePattern, matchPattern } from './utils';

export namespace RedirectTypes {

  export type PropsTyped<P> = {
    to: (
      IPathPattern<{}> |
      ((parentPattern: IPathPattern<{}> | null, parentMatch: Match<any> | false) => IPathPattern<{}>)
    );
    from?: (
      IPathPattern<P> |
      ((parentPattern: IPathPattern<{}> | null, parentMatch: Match<any> | false) => IPathPattern<P>)
    );
    params?: (
      P |
      ((parentPattern: IPathPattern<{}> | null, parentMatch: Match<any> | false) => P)
    );
    replace?: boolean;
    // location props
    search?: Search;
    state?: LocationState;
    hash?: Hash;
    key?: LocationKey;
    noSubscribe?: boolean;
  };

  export type Props = PropsTyped<any>;

  export type Context = {
    routerStore: Store<RouterStoreState>;
    router: { history: History };
  };

}

export class Redirect extends Component<RedirectTypes.Props, {}> {

  static displayName: string = 'Redirect';

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
    router: PropTypes.any,
  };

  context: RedirectTypes.Context;
  private unsubscribe: () => void;

  constructor(props: RedirectTypes.Props, context: RedirectTypes.Context) {
    super(props, context);
    this.unsubscribe = context.routerStore.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentDidMount() {
    if (this.props.noSubscribe !== true) {
      this.unsubscribe = this.context.routerStore.subscribe(() => {
        this.redirect();
      });
    }
    this.redirect();
  }

  private redirect(): void {
    const history: History = this.context.router.history;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const patternFrom: IPathPattern<{}> | null = compilePattern(this.props.from, parentRouterState);
    const match: Match<{}> | false = matchPattern(patternFrom, parentRouterState);
    const replace: boolean = this.props.replace === true;

    if (match) { // redirect
      const { params, to, search, state, hash, key } = this.props;
      const patternTo: IPathPattern<{}> | null = compilePattern(to, parentRouterState);
      const paramsCompiled: any = isFunction(params) ? params(
        parentRouterState.pattern,
        parentRouterState.match,
      ) : params;
      const toObj: LocationDescriptorObject = {
        pathname: patternTo ? patternTo.compile(paramsCompiled) : '/',
        search,
        state,
        hash,
        key,
      };
      if (replace) {
        history.replace(toObj);
      } else {
        history.push(toObj);
      }
    }
  }

  render(): JSX.Element | null {
    return null;
  }

}
