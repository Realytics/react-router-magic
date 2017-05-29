import * as React from 'react';
import { Component, ValidationMap, ReactElement } from 'react';
import * as PropTypes from 'prop-types';
import { Location } from 'history';
import { Store } from './Store';
import { Route, RouteTypes } from './Route';
import { Redirect, RedirectTypes } from './Redirect';
import { RouterStoreState } from './RouterProvider';
import { Match } from './interface';

export namespace SwitchTypes {

  export type RouteComponentProps = {
    match: Match<any>;
    location: Location;
  };

  export type Props = {};

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

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store),
  };

  context: SwitchTypes.Context;
  unsubscribe: () => void;

  constructor(props: SwitchTypes.Props, context: SwitchTypes.Context) {
    super(props, context);
    this.unsubscribe = context.routerStore.subscribe(() => {
      this.forceUpdate();
    });
  }

  render(): JSX.Element | null {

    let matchFound: boolean = false;
    let content: JSX.Element | null = null;

    React.Children.forEach(this.props.children, (child, index) => {
      if (matchFound) {
        return;
      }
      if (!React.isValidElement<any>(child)) {
        return;
      }
      let match: Match<{}> | null | true = null;
      const parentRouterState: RouterStoreState = this.context.routerStore.getState();
      if (isComponentType<RouteTypes.Props>(child, Route)) {
        match = child.props.pattern.match(parentRouterState.location.pathname);
      } else if (isComponentType<RedirectTypes.Props>(child, Redirect)) {
        match = !child.props.from || child.props.from.match(parentRouterState.location.pathname);
      } else {
        console.warn(`Switch only accept Route or Redirect components as children`);
      }
      if (match) {
        matchFound = true;
        content = React.cloneElement(child, { passif: true, key: index });
      }
    });

    return content;
  }
}
