import * as React from 'react';
import { StatelessComponent, HTMLProps } from 'react';
import { NavProvider } from './NavProvider';
import { LocationDescriptorObject } from 'history';
import { Match, ValOrFunc } from './utils';

export type LinkProps = HTMLProps<HTMLAnchorElement> & {
  to: ValOrFunc<(string | LocationDescriptorObject)>;
  activeClassName?: string;
  match?: ValOrFunc<Match>;
  replace?: boolean;
  noSubscribe?: boolean;
};

export const Link: StatelessComponent<LinkProps> = (props: LinkProps) => {
  const { to, match, noSubscribe, replace, activeClassName = '', className, ...aProps } = props;
  return (
    <NavProvider
      {...{ to, match, noSubscribe, replace }}
      renderChild={(params) => (
        <a
          {...aProps}
          href={params.href}
          className={[(match === false ? activeClassName : ''), className].join(' ')}
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
