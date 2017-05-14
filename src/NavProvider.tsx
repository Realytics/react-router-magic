import { MouseEvent, Component, ValidationMap } from 'react';
import { Path, LocationDescriptorObject, History, Location } from 'history';
import { Store } from './Store';
import { RouterStoreState } from './RouterProvider';
import * as PropTypes from 'prop-types';
import { ToLocationProps, matchPath, Match, createPath, normalizeFromObject } from './utils';

function isModifiedEvent(event: MouseEvent<any>): boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export namespace NavProviderTypes {

  export type Props = (
    ToLocationProps & {
      renderChild: (params: ChildParams) => JSX.Element;
      noSubscribe?: boolean;
    }
  );

  export type ChildParams = {
    href: string;
    match: Match<{}> | null;
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

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
    router: PropTypes.any,
  };

  context: NavProviderTypes.Context;
  private unsubscribe: () => void;

  constructor(props: NavProviderTypes.Props, context: NavProviderTypes.Context) {
    super(props, context);
    if (props.noSubscribe !== true) {
      this.unsubscribe = context.routerStore.subscribe(() => {
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
    const { renderChild, replace, search, state, hash, key, ...props } = this.props;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const match: Match<{}> | null = matchPath(
      parentRouterState.location,
      parentRouterState.match,
      normalizeFromObject(props),
    );
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
    const { search, state, hash, key } = this.props;
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();
    const path: Path = createPath(
      parentRouterState.match,
      this.props,
      this.props.params,
    );
    const to: LocationDescriptorObject = {
      pathname: path,
      search,
      state,
      hash,
      key,
    };
    return to;
  }

  private navigate(): void {
    const { replace } = this.props;
    const to: LocationDescriptorObject = this.getToObject();
    const history: History = this.context.router.history;

    if (replace) {
      history.replace(to);
    } else {
      history.push(to);
    }
  }

  private handleAnchorClick(event: MouseEvent<any>, target?: string): void {
    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore right clicks
      !target && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();
      this.navigate();
    }
  }

}
