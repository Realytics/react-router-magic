import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { History } from 'history';
import { Store } from './Store';
import { Match, IPathPattern } from './interface';
import { RouterStoreState } from './RouterProvider';

export namespace RedirectTypes {

  export type Props = {
    to: string,
    replace?: boolean;
    from?: IPathPattern<{}>,
  };

  export type Context = {
    routerStore: Store<RouterStoreState>;
    router: { history: History };
  };

}

export class Redirect extends Component<RedirectTypes.Props, {}> {

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

  componentDidMount(): void {
    const history: History = this.context.router.history;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const { pathname = '' } = parentRouterState.location;
    const match: Match<{}> | null | true = this.props.from ? this.props.from.match(pathname) : true;
    const replace: boolean = this.props.replace === true;

    if (match) { // redirect
      if (replace) {
        history.replace(this.props.to);
      } else {
        history.push(this.props.to);
      }
    }

  }

  render(): JSX.Element | null {
    return null;
  }

}
