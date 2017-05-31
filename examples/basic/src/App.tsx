import * as React from 'react';
import { Component } from 'react';
import { RouterProvider, Route, NavProvider, Redirect, Switch } from 'react-router-magic';
import createHistory from 'history/createBrowserHistory';
import { Location } from 'history';

const history = createHistory();

export class App extends Component<{}, { location: Location }> {

  constructor() {
    super();
    this.state = {
      location: history.location,
    };
  }

  private unlisten: () => void;

  componentDidMount() {
    this.unlisten = history.listen((location: Location) => {
      this.setState({ location: location });
    });
  }

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
          <Redirect
            match={(location: Location) => location.pathname === '/hello'}
            to='/user/john'
          />
          <Switch>
            <Route
              match={(location: Location) => location.pathname === '/user/welcome'}
              render={() => (
                <p>Welcome User !</p>
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
                <p>Hello { (params.match as any).user }</p>
              )}
            />
          </Switch>
        </div>
      </RouterProvider>
    );
  }
}
