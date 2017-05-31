import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { History, LocationDescriptorObject } from 'history';
import { Store } from './Store';
import { RouterStoreState } from './RouterProvider';
import { execValOrFunc, Match, ValOrFunc, checkSwitchState } from './utils';
import isString = require('lodash.isstring');

export namespace RedirectTypes {

  export type PropsTyped<P> = {
    to: ValOrFunc<(string | LocationDescriptorObject)>;
    match?: ValOrFunc<Match>;
    push?: boolean;
    noSubscribe?: boolean;
    switchIndex?: number;
  };

  export type Props = PropsTyped<any>;

  export type Context = {
    routerStore: Store<RouterStoreState>;
    router: { history: History };
  };

}

export class Redirect extends Component<RedirectTypes.Props, {}> {

  static displayName: string = 'Redirect';

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
    router: PropTypes.any,
  };

  context: RedirectTypes.Context;
  private unsubscribe: () => void;

  constructor(props: RedirectTypes.Props, context: RedirectTypes.Context) {
    super(props, context);
    this.unsubscribe = context.routerStore.subscribe(() => {
      this.update(this.props);
    });
  }

  componentDidMount() {
    if (this.props.noSubscribe !== true) {
      this.unsubscribe = this.context.routerStore.subscribe(() => {
        this.update(this.props);
      });
    }
    this.update(this.props);
  }

  componentWillReceiveProps(nextProps: RedirectTypes.Props): void {
    this.update(nextProps);
  }

  render(): JSX.Element | null {
    return null;
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private update(props: RedirectTypes.Props): void {
    const history: History = this.context.router.history;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const match: Match = checkSwitchState(
      props,
      parentRouterState,
      execValOrFunc(this.props.match, parentRouterState),
    );
    const push: boolean = this.props.push === true;

    if (match !== false) { // redirect
      const to: string | LocationDescriptorObject = execValOrFunc(this.props.to, parentRouterState);
      const toLocation: LocationDescriptorObject = isString(to) ? { pathname: to } : to;
      if (push) {
        history.push(toLocation);
      } else {
        history.replace(toLocation);
      }
    }
  }

}
