import * as React from 'react';
import * as PropTypes from 'prop-types';
import isFunction = require('lodash.isfunction');
import isEqual = require('deep-equal');
import { Component, ValidationMap, ReactType } from 'react';
import { Location } from 'history';
import { Store } from './Store';
import { RouterStoreState } from './RouterProvider';
import { execValOrFunc, Match, ValOrFunc, checkSwitchState } from './utils';

export namespace RouteTypes {

  export type Props = {
    match?: ValOrFunc<Match>;
    // render
    component?: ReactType;
    render?: (params: ChildParams) => JSX.Element;
    children?: ((params: ChildParams) => JSX.Element) | JSX.Element;
    // behavior
    passif?: boolean;
    switchIndex?: number;
  };

  export type Context = {
    routerStore: Store<RouterStoreState>;
  };

  export type ChildContext = {
    routerStore: Store<RouterStoreState>;
  };

  export type ChildParams = {
    match: Match;
    location: Location;
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
  private matchResult: Match = null;
  private unsubscribe: () => void;

  constructor(props: RouteTypes.Props, context: RouteTypes.Context) {
    super(props, context);
    if (!context.routerStore || !context.routerStore.getState()) {
      throw new Error('Route need a RouterProvider as ancestor');
    }
    const parentRouterState: RouterStoreState = context.routerStore.getState();
    this.matchResult = execValOrFunc<Match>(props.match, parentRouterState);
    if (props.passif !== true) { // don't subscribe if passif
      this.unsubscribe = context.routerStore.subscribe(() => {
        this.update(this.props);
      });
    }
  }

  getChildContext(): RouteTypes.ChildContext {
    return {
      routerStore: this.routerStore,
    };
  }

  componentWillReceiveProps(nextProps: RouteTypes.Props): void {
    this.update(nextProps, false);
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
      return (this.matchResult !== false) ? React.createElement(component as any, childParams) : null;
    }
    if (render) { // then render, only if match
      return (this.matchResult !== false) ? render(childParams) : null;
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

  private update(props: RouteTypes.Props, forceUpdate: boolean = true): void {
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    this.matchResult = execValOrFunc(props.match, parentRouterState);
    this.matchResult = checkSwitchState(props, parentRouterState, this.matchResult);
    const newState: RouterStoreState = {
      location: parentRouterState.location,
      match: this.matchResult,
      switch: false,
    };
    if (!this.routerStore) {
      this.routerStore = new Store<RouterStoreState>(newState);
      if (forceUpdate) {
        this.forceUpdate();
      }
    } else {
      if (!isEqual(this.routerStore.getState(), newState)) {
        this.routerStore.setState(newState);
        if (forceUpdate) {
          this.forceUpdate();
        }
      }
    }
  }
}
