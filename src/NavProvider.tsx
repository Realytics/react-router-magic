import { MouseEvent, Component, ValidationMap } from 'react';
import { Path, LocationDescriptorObject, History, Location, Search, LocationState, Hash, LocationKey } from 'history';
import { Store } from './Store';
import { RouterStoreState } from './RouterProvider';
import * as PropTypes from 'prop-types';
import { Match, IPathPattern } from './interface.d';

export namespace NavProviderTypes {

  export type PropsTyped<P> = {
    to: IPathPattern<P>;
    params?: P;
    replace?: boolean;
    // location props
    search?: Search;
    state?: LocationState;
    hash?: Hash;
    key?: LocationKey;
    // render
    renderChild: (params: ChildParams) => JSX.Element;
    noSubscribe?: boolean;
  };

  export type Props = PropsTyped<any>;

  export type ChildParams = {
    href: string;
    match: Match<{}> | false;
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
    const match: Match<{}> | false = props.to.match(parentRouterState.location.pathname);

    const to: LocationDescriptorObject = this.getToObject();
    const href: string = this.context.router.history.createHref(to);
    const childParams: NavProviderTypes.ChildParams = {
      href: href,
      navigate: () => this.navigate(),
      match: match,
      location: parentRouterState.location,
      handleAnchorClick: (event: MouseEvent<any>) => this.handleAnchorClick(event),
    };

    return renderChild(childParams);
  }

  private getToObject(): LocationDescriptorObject {
    const { search, state, hash, key, to, params = {} } = this.props;
    const path: Path = to.compile(params);
    const toObj: LocationDescriptorObject = {
      pathname: path,
      search,
      state,
      hash,
      key,
    };
    return toObj;
  }

  private navigate(): void {
    const { replace = false } = this.props;
    const to: LocationDescriptorObject = this.getToObject();
    const history: History = this.context.router.history;

    if (replace) {
      history.replace(to);
    } else {
      history.push(to);
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
