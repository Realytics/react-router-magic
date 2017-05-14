import * as React from 'react';
import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { History, Location } from 'history';
import { Store } from './Store';
import isEqual = require('lodash/isEqual');
import { Match } from './utils';

export type RouterState = {
  location: Location;
  previousLocation: Location | null;
};

export type RouterStoreState = (
  RouterState &
  {
    match: Match<{}> | null;
  }
);

export namespace RouterProviderTypes {

  export type PropsFromRedux = {
    router: RouterState,
  };

  export type PropsFromUser = {
    history: History;
  };

  export type Props = PropsFromRedux & PropsFromUser;

  export type ChildContext = {
    router: { history: History };
    routerStore: Store<RouterStoreState>;
  };

}

export class RouterProvider extends Component<RouterProviderTypes.Props, void> {

  static childContextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store),
    router: PropTypes.any,
  };

  static EMPTY_MATCH: Match<any> = {
    params: null,
    isExact: false,
    path: '/',
    url: '/',
  };

  private routerStore: Store<RouterStoreState>;

  constructor(props: RouterProviderTypes.Props) {
    super(props);
    this.routerStore = new Store<RouterStoreState>({
      location: props.router.location,
      previousLocation: props.router.previousLocation,
      match: RouterProvider.EMPTY_MATCH,
    });
  }

  componentWillReceiveProps(nextProps: RouterProviderTypes.Props): void {
    if (!isEqual(nextProps.router, this.props.router)) {
      this.routerStore.setState({
        location: nextProps.router.location,
        previousLocation: nextProps.router.previousLocation,
        match: RouterProvider.EMPTY_MATCH,
      });
    }
  }

  getChildContext(): RouterProviderTypes.ChildContext {
    return {
      router: { history: this.props.history },
      routerStore: this.routerStore,
    };
  }

  render(): JSX.Element {
    return React.Children.only(this.props.children);
  }

}
