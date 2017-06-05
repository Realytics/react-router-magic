import * as React from 'react';
import { Component, ValidationMap, ReactElement, ReactNode } from 'react';
import * as PropTypes from 'prop-types';
import { Store, RouterStoreState } from './Store';
import { Route, RouteProps, RouteChildContext } from './Route';
import { Redirect, RedirectProps } from './Redirect';
import {  } from './RouterProvider';
import { execValOrFunc, Match } from './utils';
import isEqual = require('deep-equal');

export type SwitchProps = {
  children?: ReactNode;
  renderContainer?: (children: ReactElement<(RouteProps | RedirectProps)>[]) => JSX.Element;
};

export type SwitchContext = {
  routerStore: Store<RouterStoreState>;
};

function isComponentType<P>(child: ReactElement<any>, type: any): child is ReactElement<P> {
  return child.type === type;
}

/**
 * Render the first Route that match
 */
export class Switch extends Component<SwitchProps, {}> {

  static displayName: string = 'Switch';

  private routerStore: Store<RouterStoreState>;

  private validChildren: ReactElement<(RouteProps|RedirectProps)>[] = [];

  static childContextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store),
  };

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store),
  };

  context: SwitchContext;
  private unsubscribe: () => void;
  private isUnmounted: boolean = false;

  constructor(props: SwitchProps, context: SwitchContext) {
    super(props, context);
    if (!context.routerStore || !context.routerStore.getState()) {
      throw new Error('Switch need a RouterProvider as ancestor');
    }

    this.unsubscribe = context.routerStore.subscribe(() => {
      this.update(this.props);
    });
    this.update(props, false);
  }

  getChildContext(): RouteChildContext {
    return {
      routerStore: this.routerStore,
    };
  }

  componentWillReceiveProps(nextProps: SwitchProps): void {
    this.update(nextProps, false);
  }

  componentWillUnmount(): void {
    this.isUnmounted = true;
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render(): JSX.Element {
    const { renderContainer = this.defaultRenderContainer } = this.props;
    const childrenWithIndex: ReactElement<(RouteProps | RedirectProps)>[] = this.validChildren.map((child, index) => (
      React.cloneElement<(RouteProps | RedirectProps), { switchIndex?: number }>(
        child,
        { switchIndex: index },
      )
    ));
    return renderContainer(childrenWithIndex);
  }

  private defaultRenderContainer(children: ReactElement<(RouteProps | RedirectProps)>[]): JSX.Element {
    return (
      <div>{React.Children.toArray(children)}</div>
    );
  }

  private updateValidChildren(props: SwitchProps): void {
    this.validChildren = [];
    React.Children.forEach(props.children, (child) => {
      if (!React.isValidElement<any>(child)) {
        return;
      }
      if (
        isComponentType<RouteProps>(child, Route) ||
        isComponentType<RedirectProps>(child, Redirect)
      ) {
        this.validChildren.push(child);
      } else {
        console.warn(`Switch only accept Route or Redirect components as children`);
      }
    });
  }

  private update(props: SwitchProps, forceUpdate: boolean = true): void {
    this.updateValidChildren(props);
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    let match: Match = null;
    let matchIndex: number | false = false;
    this.validChildren.forEach((child, index) => {
      if (matchIndex !== false) {
        return;
      }
      let tmpMatch: Match = execValOrFunc<Match>(
        child.props.match,
        parentRouterState.location,
        parentRouterState.match,
      );
      if (tmpMatch !== false) {
        match = tmpMatch;
        matchIndex = index;
      }
    });
    const newState: RouterStoreState = {
      location: parentRouterState.location,
      match: parentRouterState.match,
      switch: { match, matchIndex },
    };
    if (!this.routerStore) {
      this.routerStore = new Store<RouterStoreState>(newState);
      if (forceUpdate && !this.isUnmounted) {
        this.forceUpdate();
      }
    } else {
      if (!isEqual(this.routerStore.getState(), newState)) {
        this.routerStore.setState(newState);
        if (forceUpdate && !this.isUnmounted) {
          this.forceUpdate();
        }
      }
    }
  }

}
