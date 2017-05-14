import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { LocationDescriptorObject, History } from 'history';
import { Store } from './Store';
import {
  matchPath, Match, FromLocationProps, ToLocationProps, createLocationDescriptor, FromLocationObj, normalizeFromObject,
  normalizeToObject, ToLocationObj,
} from './utils';
import { RouterStoreState } from './RouterProvider';

export namespace RedirectTypes {

  export type Props = {
    to: ToLocationProps | string,
    from?: FromLocationProps | string,
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
    const fromObj: FromLocationObj = normalizeFromObject(this.props.from);
    const toObj: ToLocationObj = normalizeToObject(this.props.to, true);
    const parentRouterState: RouterStoreState = this.context.routerStore.getState();

    const match: Match<{}> | null = matchPath(
      parentRouterState.location,
      parentRouterState.match,
      fromObj,
    );
    const replace: boolean = toObj.replace;

    if (match) { // redirect
      const toDescriptor: LocationDescriptorObject = createLocationDescriptor(
        parentRouterState.match,
        toObj,
      );

      if (replace) {
        history.replace(toDescriptor);
      } else {
        history.push(toDescriptor);
      }
    }

  }

  render(): JSX.Element | null {
    return null;
  }

}
