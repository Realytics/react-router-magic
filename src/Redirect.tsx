import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { History, LocationDescriptorObject } from 'history';
import { Store, RouterStoreState } from './Store';
import { execValOrFunc, Match, ValOrFunc, checkSwitchState, ToProps, navigate, execTo } from './utils';

export type RedirectPropsTyped<P> = {
  to: ToProps;
  match?: ValOrFunc<Match>;
  push?: boolean;
  noSubscribe?: boolean;
  switchIndex?: number;
};

export type RedirectProps = RedirectPropsTyped<any>;

export type RedirectContext = {
  routerStore: Store<RouterStoreState>;
  router: { history: History };
};

export class Redirect extends Component<RedirectProps, {}> {

  static displayName: string = 'Redirect';

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
    router: PropTypes.any,
  };

  context: RedirectContext;
  private unsubscribe: () => void;

  constructor(props: RedirectProps, context: RedirectContext) {
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

  componentWillReceiveProps(nextProps: RedirectProps): void {
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

  private update(props: RedirectProps): void {
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const match: Match = checkSwitchState(
      props,
      parentRouterState,
      execValOrFunc(this.props.match, parentRouterState.location, parentRouterState.match),
    );
    const push: boolean = this.props.push === true;
    if (match !== false) { // redirect
      const toLocation: LocationDescriptorObject = execTo(
        this.props.to,
        match,
        parentRouterState.location,
        parentRouterState.match,
      );
      navigate(toLocation, this.context.router.history, !push);
    }
  }

}
