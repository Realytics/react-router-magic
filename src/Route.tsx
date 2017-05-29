import * as React from 'react';
import * as PropTypes from 'prop-types';
import isFunction = require('lodash/isFunction');
import { Component, ValidationMap, ReactType } from 'react';
import { Location } from 'history';
import { Store } from './Store';
import { RouterStoreState } from './RouterProvider';
import { Match, IPathPattern } from './interface.d';
import { compilePattern, matchPattern } from './utils';

export namespace RouteTypes {

  export type Props = {
    // pattern
    pattern: (
      IPathPattern<{}> |
      ((parentPattern: IPathPattern<{}> | null, parentMatch: Match<any> | false) => IPathPattern<{}>)
    );
    // render
    component?: ReactType;
    render?: (params: ChildParams) => JSX.Element;
    children?: ((params: ChildParams) => JSX.Element) | JSX.Element;
    // behavior
    passif?: boolean;
  };

  export type Context = {
    routerStore: Store<RouterStoreState>;
  };

  export type ChildContext = {
    routerStore: Store<RouterStoreState>;
  };

  export type ChildParams = {
    match: Match<{}> | false;
    location: Location
  };

}

export class Route extends Component<RouteTypes.Props, void> {

  static displayName: string = 'Route';

  static childContextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store),
  };

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
  };

  context: RouteTypes.Context;
  private routerStore: Store<RouterStoreState>;
  private matchResult: Match<{}> | false;
  private unsubscribe: () => void;

  constructor(props: RouteTypes.Props, context: RouteTypes.Context) {
    super(props, context);
    if (!context.routerStore || !context.routerStore.getState()) {
      throw new Error('Route need a RouterProvider as ancestor');
    }
    const parentRouterState: RouterStoreState = context.routerStore.getState();
    const pattern: IPathPattern<{}> | null = compilePattern(props.pattern, parentRouterState);
    this.matchResult = matchPattern(pattern, parentRouterState);
    this.routerStore = new Store<RouterStoreState>({
      location: parentRouterState.location,
      match: this.matchResult,
      pattern: pattern,
    });
    if (props.passif !== true) { // don't subscribe if passif
      this.unsubscribe = context.routerStore.subscribe(() => {
        this.update();
      });
    }
  }

  getChildContext(): RouteTypes.ChildContext {
    return {
      routerStore: this.routerStore,
    };
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render(): JSX.Element | null {
    const { component, render, children }: RouteTypes.Props = this.props;
    const childParams: RouteTypes.ChildParams = {
      match: this.matchResult,
      location: this.context.routerStore.getState().location,
    };
    if (component) { // component is first, only if match
      return this.matchResult ? React.createElement(component as any, childParams) : null;
    }
    if (render) { // then render, only if match
      return this.matchResult ? render(childParams) : null;
    }
    // then children (even if not match)
    if (isFunction(children)) {
      return children(childParams);
    }
    if (children) {
      return React.Children.only(children);
    }
    return null;
  }

  private update(forceUpdate: boolean = true): void {
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const { pathname = '' } = parentRouterState.location;
    const pattern: IPathPattern<{}> = isFunction(this.props.pattern) ? this.props.pattern(
      parentRouterState.pattern,
      parentRouterState.match,
    ) : this.props.pattern;
    this.matchResult = pattern.match(pathname);
    this.routerStore.setState({
      location: parentRouterState.location,
      match: this.matchResult,
      pattern: pattern,
    });
    if (forceUpdate) {
      this.forceUpdate();
    }
  }
}
