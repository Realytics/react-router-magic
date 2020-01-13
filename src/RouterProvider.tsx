import * as React from 'react';
import * as PropTypes from 'prop-types';
import isEqual = require('deep-equal');
import { Component, ValidationMap } from 'react';
import { History, Location } from 'history';
import { Store, RouterStoreState } from './Store';

export type RouterProviderProps = {
  history: History;
  location: Location;
};

export type RouterProviderChildContext = {
  router: { history: History };
  routerStore: Store<RouterStoreState>;
};

export class RouterProvider extends Component<RouterProviderProps, {}> {

  static displayName: string = 'RouterProvider';

  static childContextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store),
    router: PropTypes.any,
  };

  private routerStore: Store<RouterStoreState>;

  constructor(props: RouterProviderProps) {
    super(props);
    this.routerStore = new Store<RouterStoreState>({
      location: props.location,
      match: null,
      switch: false,
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps: RouterProviderProps): void {
    if (!isEqual(nextProps.location, this.props.location)) {
      this.routerStore.setState({
        location: nextProps.location,
        match: null,
        switch: false,
      });
    }
  }

  getChildContext(): RouterProviderChildContext {
    return {
      router: { history: this.props.history },
      routerStore: this.routerStore,
    };
  }

  render(): JSX.Element {
    return React.Children.only(this.props.children);
  }

}
