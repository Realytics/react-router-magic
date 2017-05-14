import * as React from 'react';
import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { Path, LocationDescriptorObject, History } from 'history';
import { Store } from './Store';
import { MatchResult, MatchProps, match, createLocationDescriptorObject, RealtiveAbsoluteProps } from './utils';
import { RouterStoreState } from './RouterProvider';

export namespace RedirectTypes {

  export type Props = (
    MatchProps &
    RealtiveAbsoluteProps & {
      to: Path | LocationDescriptorObject;
      push?: boolean;
    }
  );

  export type Context = {
    routerStore: Store<RouterStoreState>;
    router: { history: History };
  };

}

export class Redirect extends Component<RedirectTypes.Props, {}> {

  static contextTypes: ValidationMap<any> = {
    routerStore: PropTypes.instanceOf(Store), // from RouterProvider or parent Route
    router: PropTypes.any
  };
  
  context: RedirectTypes.Context;
  private unsubscribe: () => void;

  componentDidMount(): void {
    const history: History = this.context.router.history;
    const push: boolean = this.props.push === true;

    const matchResult: MatchResult = match(
      this.context.routerStore,
      this.props
    );

    if (matchResult.match) { // Redirect
      const to: LocationDescriptorObject = createLocationDescriptorObject(
        this.props.to,
        this.props,
        this.context.routerStore.getState().match
      );

      if (push) {
        history.push(to);
      } else {
        history.replace(to);
      }
    }

  }

  render(): JSX.Element | null {
    return null;
  }

}
