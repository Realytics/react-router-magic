import * as React from 'react';
import { Component, ValidationMap, ComponentClass } from 'react';
import * as PropTypes from 'prop-types';
import { Store, RouterStoreState } from './Store';
import { Match, hoistNonReactStatics } from './utils';
import { History, Location } from 'history';

export type MagicRouterProviderContext = {
  routerStore: Store<RouterStoreState>;
  router: { history: History };
};

export type Decorator<P> = (Target: any) => ComponentClass<P>;

export type InjectedMatch = {
  match: Match,
};
export type InjectedLocation = {
  location: Location,
};
export type InjectedHistory = {
  history: History,
};
export type InjectedAll = InjectedMatch & InjectedLocation & InjectedHistory;

export type WhatToInject = {
  match?: boolean;
  location?: boolean;
  history?: boolean;
};

/**
 * Render the first Route that match
 */
export function InjectMagicRouter<P>(options: WhatToInject = {}): Decorator<P> {
  return (Target: any) => {
    const { 'match': injectMatch = true, 'location': injectLocation = true, 'history': injectHistory = true } = options;
    if (!injectMatch && !injectLocation && !injectHistory) {
      console.warn(`All inject are off, just returning the component`);
      return Target;
    }
    // if we inject only history, no need to subscribe
    const needSubscribe: boolean = !injectMatch && !injectLocation && injectHistory;

    class MagicRouterProvider extends Component<{}, {}> {

      static displayName: string = 'MagicRouterProvider';

      static contextTypes: ValidationMap<any> = {
        routerStore: PropTypes.instanceOf(Store),
        router: PropTypes.any,
      };

      context: MagicRouterProviderContext;
      unsubscribe: () => void;

      private isUnmounted: boolean = false;

      constructor(props: any, context: MagicRouterProviderContext) {
        super(props, context);
        if (!context.routerStore || !context.routerStore.getState() || !context.router || !context.router.history) {
          throw new Error('InjectMatch need a RouterProvider as ancestor');
        }

        if (needSubscribe) {
          this.unsubscribe = context.routerStore.subscribe(() => {
            if (this.isUnmounted === false) {
              this.forceUpdate();
            }
          });
        }
      }

      componentWillUnmount(): void {
        this.isUnmounted = true;
        if (this.unsubscribe) {
          this.unsubscribe();
        }
      }

      render(): JSX.Element {
        const injectedProps: Partial<InjectedAll> = {};
        if (injectMatch) {
          injectedProps.match = this.context.routerStore.getState().match;
        }
        if (injectHistory) {
          injectedProps.history = this.context.router.history;
        }
        if (injectLocation) {
          injectedProps.location = this.context.routerStore.getState().location;
        }
        return <Target {...injectedProps} {...this.props} />;
      }

    }

    return hoistNonReactStatics(MagicRouterProvider, Target);
  };
}
