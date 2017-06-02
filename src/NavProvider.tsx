import { Component, ValidationMap } from 'react';
import { History } from 'history';
import { Store, RouterStoreState } from './Store';
import * as PropTypes from 'prop-types';
import { Match, ValOrFunc, ToProps, NavParams, createNavParams } from './utils';

export type NavProviderPropsTyped<P> = {
  to: ToProps;
  match?: ValOrFunc<Match>;
  replace?: boolean;
  // render
  renderChild: (params: NavParams) => JSX.Element;
  noSubscribe?: boolean;
};

export type NavProviderProps = NavProviderPropsTyped<any>;

export type NavProviderContext = {
  routerStore: Store<RouterStoreState>;
  router: { history: History };
};

export class NavProvider extends Component<NavProviderProps, {}> {

  static displayName: string = 'NavProvider';

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
    router: PropTypes.any,
  };

  context: NavProviderContext;
  private unsubscribe: () => void;

  constructor(props: NavProviderProps, context: NavProviderContext) {
    super(props, context);
    if (!context.routerStore || !context.routerStore.getState() || !context.router || !context.router.history) {
      throw new Error('InjectMatch need a RouterProvider as ancestor');
    }
  }

  componentDidMount() {
    if (this.props.noSubscribe !== true) {
      this.unsubscribe = this.context.routerStore.subscribe(() => {
        this.forceUpdate();
      });
    }
  }

  componentWillReceiveProps(nextProps: NavProviderProps): void {
    if (this.props.noSubscribe !== nextProps.noSubscribe) {
      if (nextProps.noSubscribe && this.unsubscribe) {
        this.unsubscribe();
      } else {
        this.unsubscribe = this.context.routerStore.subscribe(() => {
          this.forceUpdate();
        });
      }
    }
  }

  render(): JSX.Element {
    const { renderChild, to, replace, match } = this.props;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const childParams: NavParams = createNavParams(
      to,
      this.context.router.history,
      parentRouterState.location,
      replace,
      match,
      parentRouterState.match,
    );

    return renderChild(childParams);
  }

}
