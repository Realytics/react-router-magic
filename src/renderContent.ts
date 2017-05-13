import * as React from 'react';
import { ReactType } from 'react';
import { isFunction } from 'lodash';
import { MatchResult } from './utils';

export type ContentProps = {
  component?: ReactType;
  render?: (props: MatchResult) => JSX.Element;
  children?: ((props: MatchResult) => JSX.Element) | JSX.Element;
};

export function renderContent(
  matchResult: MatchResult,
  parentProps: ContentProps
): JSX.Element | null {
  const { component, render, children }: ContentProps = parentProps;
  if (component) { // Component is first, only if match
    return matchResult.match ? React.createElement(component as any, matchResult) : null;
  }
  if (render) { // Then render, only if match
    return matchResult.match ? render(matchResult) : null;
  }
  // Then children (even if not match)
  if (isFunction(children)) {
    return children(matchResult);
  }
  if (children) {
    return React.Children.only(children);
  }
  return null;
}