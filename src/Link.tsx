import * as React from 'react';
import { StatelessComponent, HTMLProps } from 'react';
import { NavProvider } from './NavProvider';
import { LocationDescriptorObject } from 'history';
import { Match, ValOrFunc } from './utils';

export namespace LinkTypes {

  export type Props = HTMLProps<HTMLAnchorElement> & {
    to: ValOrFunc<(string | LocationDescriptorObject)>;
    isActive?: ValOrFunc<Match>;
    replace?: boolean;
    noSubscribe?: boolean;
  };

}

export const Link: StatelessComponent<LinkTypes.Props> = (props: LinkTypes.Props) => {
  const { to, isActive, noSubscribe, replace, ...aProps } = props;
  return (
    <NavProvider
      {...{ to, isActive, noSubscribe, replace }}
      renderChild={(params) => (
        <a
          {...aProps}
          href={params.href}
          onClick={(e) => {
            if (aProps.onClick) {
              aProps.onClick(e);
            }
            return params.handleAnchorClick(e);
          }}
        />
      )}
    />
  );
};
