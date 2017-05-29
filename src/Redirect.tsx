import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { History, Search, LocationState, Hash, LocationKey, LocationDescriptorObject } from 'history';
import { Store } from './Store';
import { Match, IPathPattern } from './interface.d';
import { RouterStoreState } from './RouterProvider';

export namespace RedirectTypes {

  export type PropsTyped<P> = {
    to: IPathPattern<{}>;
    from?: IPathPattern<P>,
    params?: P;
    replace?: boolean;
    // location props
    search?: Search;
    state?: LocationState;
    hash?: Hash;
    key?: LocationKey;
    noSubscribe?: boolean;
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
      this.forceUpdate();
    });
  }

  componentDidMount() {
    if (this.props.noSubscribe !== true) {
      this.unsubscribe = this.context.routerStore.subscribe(() => {
        this.redirect();
      });
    }
    this.redirect();
  }

  private redirect(): void {
    const history: History = this.context.router.history;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const { pathname = '' } = parentRouterState.location;
    const match: Match<{}> | null | true = this.props.from ? this.props.from.match(pathname) : true;
    const replace: boolean = this.props.replace === true;

    if (match) { // redirect
      const { params, to, search, state, hash, key } = this.props;
      const toObj: LocationDescriptorObject = {
        pathname: to.compile(params),
        search,
        state,
        hash,
        key,
      };
      if (replace) {
        history.replace(toObj);
      } else {
        history.push(toObj);
      }
    }
  }

  render(): JSX.Element | null {
    return null;
  }

}
