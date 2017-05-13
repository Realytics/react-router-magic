import * as React from 'react';
import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { Location } from 'history';
import { Store } from './Store';
import { Match } from './matchPath';
import { Route } from './Route';
import { match, MatchResult } from './utils';
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
    routerStore: PropTypes.instanceOf(Store)
  };

  context: SwitchTypes.Context;

  render(): JSX.Element | null {

    var matchFound: boolean = false;
    var content: JSX.Element | null = null;

    React.Children.forEach(this.props.children, (child: React.ReactChild) => {
      if (matchFound) {
        return;
      }
      if (!React.isValidElement<any>(child)) {
        return;
      }
      if (child.type !== Route) {
        return;
      }
      const matchResult: MatchResult = match(
        this.context.routerStore,
        child.props
      );
      if (matchResult.match) {
        matchFound = true;
        content = React.cloneElement(child, { passif: true });
      }
    });

    return content;
  }
}
