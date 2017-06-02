import * as React from 'react';
import { StatelessComponent, ComponentClass } from 'react';
import { InjectMagicRouter, InjectedAll } from 'react-router-magic';

export type InjectedProps = InjectedAll;

const InjectedRender: StatelessComponent<InjectedProps> = (props) => {
  return (
    <p>
      <span>Match: {JSON.stringify(props.match)}</span><br/>
      <span>Location: {JSON.stringify(props.location)}</span><br/>
      <span>History: {JSON.stringify(props.history)}</span>
    </p>
  );
};

export const Injected: ComponentClass<{}> = InjectMagicRouter()(InjectedRender);
