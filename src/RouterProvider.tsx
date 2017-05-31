import * as React from 'react';
import * as PropTypes from 'prop-types';
import isEqual = require('deep-equal');
import { Component, ValidationMap } from 'react';
import { History, Location } from 'history';
import { Store } from './Store';
import { Match } from './utils';

export type RouterStoreState = {
  location: Location;
  match: Match;
  switch: false | { match: Match, matchIndex: number | false };
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

  private routerStore: Store<RouterStoreState>;

  constructor(props: RouterProviderTypes.Props) {
    super(props);
    this.routerStore = new Store<RouterStoreState>({
      location: props.location,
      match: null,
      switch: false,
    });
  }

  componentWillReceiveProps(nextProps: RouterProviderTypes.Props): void {
    if (!isEqual(nextProps.location, this.props.location)) {
      this.routerStore.setState({
        location: nextProps.location,
        match: null,
        switch: false,
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
