import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { Store } from './Store';
import { match, MatchResult, MatchProps } from './utils';
import { renderContent, ContentProps } from './renderContent';
import { RouterStoreState } from './RouterProvider';

export namespace RouteTypes {

  export type Props = (
    ContentProps &
    MatchProps &
    {
      passif?: boolean;
    }
  );

  export type Context = {
    routerStore: Store<RouterStoreState>;
  };

  export type ChildContext = {
    routerStore: Store<RouterStoreState>;
  };

}

export class Route extends Component<RouteTypes.Props, void> {

  static childContextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store)
  };

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
  };

  context: RouteTypes.Context;

  private routerStore: Store<RouterStoreState>;
  private matchResult: MatchResult;
  private unsubscribe: () => void;

  constructor(props: RouteTypes.Props, context: RouteTypes.Context) {
    super(props, context);
    this.matchResult = match(
      context.routerStore,
      props
    );
    const parentRouterState: RouterStoreState = context.routerStore.getState();
    this.routerStore = new Store<RouterStoreState>({
      location: parentRouterState.location,
      previousLocation: parentRouterState.previousLocation,
      match: this.matchResult.match
    });
    if (props.passif !== true) { // Don't subscribe if passif
      this.unsubscribe = context.routerStore.subscribe(() => {
        this.update();
      });
    }
  }

  getChildContext(): RouteTypes.ChildContext {
    return {
      routerStore: this.routerStore
    };
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render(): JSX.Element | null {
    return renderContent(this.matchResult, this.props);
  }

  private update(forceUpdate: boolean = true): void {
    this.matchResult = match(
      this.context.routerStore,
      this.props
    );
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    this.routerStore.setState({
      location: parentRouterState.location,
      previousLocation: parentRouterState.previousLocation,
      match: this.matchResult.match
    });
    if (forceUpdate) {
      this.forceUpdate();
    }
  }
}
