import * as React from 'react';
import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { Location } from 'history';
import { Store } from './Store';
import { Route } from './Route';
import { Redirect } from './Redirect';
import { matchPath, Match } from './utils';
import { RouterStoreState } from './RouterProvider';

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

/**
 * Render the first Route that match
 * Unlike Router, Switch does not expose a matchStore
 */
export class Switch extends Component<SwitchTypes.Props, {}> {

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
      if (child.type !== Route && child.type !== Redirect) {
        console.warn(`Switch only accept Route or Redirect components as children`);
        return;
      }
      const parentRouterState: RouterStoreState = this.context.routerStore.getState();
      const match: Match<{}> | null = matchPath(
        parentRouterState.location,
        parentRouterState.match,
        child.props,
      );
      if (match) {
        matchFound = true;
        content = React.cloneElement(child, { passif: true, key: index });
      }
    });

    return content;
  }
}
