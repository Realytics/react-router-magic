import { MouseEvent, Component, ValidationMap } from 'react';
import { LocationDescriptorObject, History, Location } from 'history';
import { Store } from './Store';
import { RouterStoreState } from './RouterProvider';
import * as PropTypes from 'prop-types';
import { execValOrFunc, Match, ValOrFunc } from './utils';
import isString = require('lodash.isstring');

export namespace NavProviderTypes {

  export type PropsTyped<P> = {
    to: ValOrFunc<(string | LocationDescriptorObject)>;
    isActive?: ValOrFunc<Match>;
    replace?: boolean;
    // render
    renderChild: (params: ChildParams) => JSX.Element;
    noSubscribe?: boolean;
  };

  export type Props = PropsTyped<any>;

  export type ChildParams = {
    href: string;
    match: Match;
    location: Location;
    navigate: () => void;
    handleAnchorClick: (event: MouseEvent<any>) => void;
  };

  export type Context = {
    routerStore: Store<RouterStoreState>;
    router: { history: History };
  };

}

export class NavProvider extends Component<NavProviderTypes.Props, {}> {

  static displayName: string = 'NavProvider';

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
    router: PropTypes.any,
  };

  context: NavProviderTypes.Context;
  private unsubscribe: () => void;

  componentDidMount() {
    if (this.props.noSubscribe !== true) {
      this.unsubscribe = this.context.routerStore.subscribe(() => {
        this.forceUpdate();
      });
    }
  }

  componentWillReceiveProps(nextProps: NavProviderTypes.Props): void {
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
    const { renderChild, ...props } = this.props;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const match: Match = execValOrFunc(props.isActive, parentRouterState);
    const to: string | LocationDescriptorObject = execValOrFunc(props.to, parentRouterState);
    const toLocation: LocationDescriptorObject = isString(to) ? { pathname: to } : to;
    const href: string = this.context.router.history.createHref(toLocation);
    const childParams: NavProviderTypes.ChildParams = {
      href: href,
      navigate: () => this.navigate(),
      match: match,
      location: parentRouterState.location,
      handleAnchorClick: (event: MouseEvent<any>) => this.handleAnchorClick(event),
    };

    return renderChild(childParams);
  }

  private navigate(): void {
    const { replace = false } = this.props;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const to: string | LocationDescriptorObject = execValOrFunc(this.props.to, parentRouterState);
    const toLocation: LocationDescriptorObject = isString(to) ? { pathname: to } : to;
    const history: History = this.context.router.history;

    if (replace) {
      history.replace(toLocation);
    } else {
      history.push(toLocation);
    }
  }

  private isModifiedEvent(event: MouseEvent<any>): boolean {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
  }

  private handleAnchorClick(event: MouseEvent<any>, target?: string): void {
    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore right clicks
      !target && // let browser handle "target=_blank" etc.
      !this.isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();
      this.navigate();
    }
  }

}
