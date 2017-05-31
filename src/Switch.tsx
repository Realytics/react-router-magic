import * as React from 'react';
import { Component, ValidationMap, ReactElement, ReactNode } from 'react';
import * as PropTypes from 'prop-types';
import { Store } from './Store';
import { Route, RouteTypes } from './Route';
import { Redirect, RedirectTypes } from './Redirect';
import { RouterStoreState } from './RouterProvider';
import { execValOrFunc, Match } from './utils';
import isEqual = require('deep-equal');

export namespace SwitchTypes {

  export type Props = {
    children?: ReactNode;
  };

  export type Context = {
    routerStore: Store<RouterStoreState>;
  };

}

function isComponentType<P>(child: ReactElement<any>, type: any): child is ReactElement<P> {
  return child.type === type;
}

/**
 * Render the first Route that match
 */
export class Switch extends Component<SwitchTypes.Props, {}> {

  static displayName: string = 'Switch';

  private routerStore: Store<RouterStoreState>;

  private validChildren: ReactElement<(RouteTypes.Props|RedirectTypes.Props)>[] = [];

  static childContextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store),
  };

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store),
  };

  context: SwitchTypes.Context;
  unsubscribe: () => void;

  constructor(props: SwitchTypes.Props, context: SwitchTypes.Context) {
    super(props, context);
    if (!context.routerStore || !context.routerStore.getState()) {
      throw new Error('Switch need a RouterProvider as ancestor');
    }

    this.unsubscribe = context.routerStore.subscribe(() => {
      this.update(this.props);
    });
    this.update(props, false);
  }

  getChildContext(): RouteTypes.ChildContext {
    return {
      routerStore: this.routerStore,
    };
  }

  componentWillReceiveProps(nextProps: SwitchTypes.Props): void {
    this.update(nextProps, false);
  }

  render(): JSX.Element {
    return (
      <div>
        {
          React.Children.toArray(
            this.validChildren.map((child, index) => (
              React.cloneElement<(RouteTypes.Props | RedirectTypes.Props), { switchIndex?: number }>(
                child,
                { switchIndex: index },
              )
            )),
          )
        }
      </div>
    );
  }

  private updateValidChildren(props: SwitchTypes.Props): void {
    this.validChildren = [];
    React.Children.forEach(props.children, (child) => {
      if (!React.isValidElement<any>(child)) {
        return;
      }
      if (
        isComponentType<RouteTypes.Props>(child, Route) ||
        isComponentType<RedirectTypes.Props>(child, Redirect)
      ) {
        this.validChildren.push(child);
      } else {
        console.warn(`Switch only accept Route or Redirect components as children`);
      }
    });
  }

  private update(props: SwitchTypes.Props, forceUpdate: boolean = true): void {
    this.updateValidChildren(props);
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    let match: Match = null;
    let matchIndex: number | false = false;
    this.validChildren.forEach((child, index) => {
      if (matchIndex !== false) {
        return;
      }
      let tmpMatch: Match = execValOrFunc<Match>(child.props.match, parentRouterState);
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
