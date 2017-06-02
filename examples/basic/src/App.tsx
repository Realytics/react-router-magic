import * as React from 'react';
import { Component } from 'react';
import { RouterProvider, Route, NavProvider, Redirect, Switch } from 'react-router-magic';
import createHistory from 'history/createBrowserHistory';
import { Location } from 'history';
import { Injected } from './Injected';

const history = createHistory();

export class App extends Component<{}, { location: Location }> {

  constructor() {
    super();
    this.state = {
      location: history.location,
    };
    this.unlisten = history.listen((location: Location) => {
      this.setState({ location: location });
    });
  }

  private unlisten: () => void;

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    return (
      <RouterProvider history={history} location={this.state.location}>
        <div>
          <h2>Welcome to React</h2>
          <NavProvider
            to='/home'
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go to home</a>
            )}
          /><br/>
          <NavProvider
            to='/hello'
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go to hello (redirect to /user/john)</a>
            )}
          /><br />
          <NavProvider
            to='/user'
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go to user homepage</a>
            )}
          /><br />
          <NavProvider
            to='/user/jane'
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go say hello to Jane</a>
            )}
          /><br />
          <NavProvider
            to='/user/welcome'
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go welcome users</a>
            )}
          /><br />
          <NavProvider
            to='/user/welcome'
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Also Go welcome users</a>
            )}
          /><br />
          <Route
            match={(location: Location) => location.pathname === '/home'}
            render={() => (
              <p>Home !!</p>
            )}
          />
          <Switch>
            <Redirect
              match={(location: Location) => (location.pathname === '/' || location.pathname === '')}
              to='/user/welcome'
            />
            <Route
              match={(location: Location) => location.pathname === '/user/welcome'}
              render={() => (
                <div>
                  <p>Welcome User !</p>
                  <Injected />
                </div>
              )}
            />
            <Route
              match={(location: Location) => {
                if (location.pathname.match(/^\/user/)) {
                  return {
                    user: location.pathname.replace(/^\/user\/?/, ''),
                  };
                }
                return false;
              }}
              render={(params) => (
                <div>
                  <p>Hello { (params.match as any).user }</p>
                  <Injected />
                </div>
              )}
            />
            <Route
              render={() => (<div>Not found !</div>)}
            />
          </Switch>
          <Injected />
        </div>
      </RouterProvider>
    );
  }
}
