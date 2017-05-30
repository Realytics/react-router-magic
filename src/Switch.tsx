import * as React from 'react';
import { Component, ValidationMap, ReactElement } from 'react';
import * as PropTypes from 'prop-types';
import { Location } from 'history';
import { Store } from './Store';
import { Route, RouteTypes } from './Route';
import { Redirect, RedirectTypes } from './Redirect';
import { RouterStoreState } from './RouterProvider';
import { IPathPattern, Match } from './interface';
import { compilePattern, matchPattern } from './utils';

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
      let pattern: IPathPattern<{}> | null = null;
      const parentRouterState: RouterStoreState = this.context.routerStore.getState();
      if (isComponentType<RouteTypes.Props>(child, Route)) {
        pattern = compilePattern(child.props.pattern, parentRouterState);
      } else if (isComponentType<RedirectTypes.Props>(child, Redirect)) {
        pattern = !child.props.from ? null : compilePattern(child.props.from, parentRouterState);
      } else {
        console.warn(`Switch only accept Route or Redirect components as children`);
      }
      let match: Match<{}> | false = matchPattern(pattern, parentRouterState);
      if (match) {
        matchFound = true;
        content = React.cloneElement(child, { passif: true, key: index });
      }
    });

    return content;
  }
}
