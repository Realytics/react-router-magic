import * as React from 'react';
import * as PropTypes from 'prop-types';
import isEqual = require('lodash/isEqual');
import { Component, ValidationMap } from 'react';
import { History, Location } from 'history';
import { Store } from './Store';
import { Match } from './interface.d';

export type RouterStoreState = {
  location: Location;
  match: Match<{}> | null;
};

export namespace RouterProviderTypes {

  export type Props = {
    history: History;
    location: Location;
  };

  export type ChildContext = {
    router: { history: History };
    routerStore: Store<RouterStoreState>;
  };

}

export class RouterProvider extends Component<RouterProviderTypes.Props, void> {

  static displayName: string = 'RouterProvider';

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
      location: props.location,
      match: RouterProvider.EMPTY_MATCH,
    });
  }

  componentWillReceiveProps(nextProps: RouterProviderTypes.Props): void {
    if (!isEqual(nextProps.location, this.props.location)) {
      this.routerStore.setState({
        location: nextProps.location,
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
