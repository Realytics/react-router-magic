import { MouseEvent, Component, ValidationMap } from 'react';
import { Path, LocationDescriptorObject, History } from 'history';
import { Store } from './Store';
import { RouterStoreState } from './RouterProvider';
import * as PropTypes from 'prop-types';
import { MatchResult, match, createLocationDescriptorObject, RealtiveAbsoluteProps } from './utils';

function isModifiedEvent(event: MouseEvent<any>): boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export namespace NavProviderTypes {

  export type Props = (
    RealtiveAbsoluteProps & {
      strict?: boolean;
      exact?: boolean;
    } & {
      to: Path | LocationDescriptorObject;
      replace?: boolean;
      renderChild: (params: ChildParams) => JSX.Element;
      noSubscribe?: boolean;
    }
  );

  export type ChildParams = {
    href: string;
    navigate: () => void;
    match: MatchResult;
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
    router: PropTypes.any
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
    const { to, renderChild, replace, ...props }: NavProviderTypes.Props = this.props;

    const href: string = this.context.router.history.createHref(
      createLocationDescriptorObject(to, props, this.context.routerStore.getState().match)
    );

    const matchResult: MatchResult = match(
      this.context.routerStore,
      props
    );

    const childParams: NavProviderTypes.ChildParams = {
      href: href,
      navigate: () => this.navigate(),
      match: matchResult,
      handleAnchorClick: (event: MouseEvent<any>) => this.handleAnchorClick(event)
    };

    return renderChild(childParams);
  }

  private navigate(): void {
    const history: History = this.context.router.history;
    const to: LocationDescriptorObject = createLocationDescriptorObject(
      this.props.to,
      this.props,
      this.context.routerStore.getState().match
    );

    if (this.props.replace) {
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
