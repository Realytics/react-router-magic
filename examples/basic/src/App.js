import React, { Component } from 'react';
import { RouterProvider, PathPattern, Route, NavProvider, Redirect, Switch } from 'react-router-magic';
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

const homePath = new PathPattern('/home');
const helloPath = new PathPattern('/hello');
const userExactPath = new PathPattern('/user', { exact: true });
const userPath = new PathPattern('/user/:user');
const welcomeUserPath = new PathPattern('/user/welcome');
const parentPath = new PathPattern('/parent');

class App extends Component {

  constructor() {
    super()
    this.state = {
      location: history.location
    }
  }

  componentDidMount() {
    this.unlisten = history.listen((location, action) => {
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
            to={homePath}
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go to home</a>
            )}
          /><br/>
          <NavProvider
            to={helloPath}
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go to hello (redirect to /user/john)</a>
            )}
          /><br />
          <NavProvider
            to={userExactPath}
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go to user homepage</a>
            )}
          /><br />
          <NavProvider
            to={userPath}
            params={{ user: 'jane' }}
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go say hello to Jane</a>
            )}
          /><br />
          <NavProvider
            to={welcomeUserPath}
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Go welcome users</a>
            )}
          /><br />
          <NavProvider
            to={userPath}
            params={{ user: 'welcome' }}
            renderChild={(params) => (
              <a href={params.href} onClick={params.handleAnchorClick}>Also Go welcome users</a>
            )}
          /><br />
          <Route
            pattern={homePath}
            render={() => (
              <p>Home !!</p>
            )}
          />
          <Redirect
            from={helloPath}
            to={userPath}
            params={{ user: 'john' }}
          />
          <Route
            pattern={userExactPath}
            render={() => (
              <p>User page</p>
            )}
          />
          <Switch>
            <Route
              pattern={welcomeUserPath}
              render={() => (
                <p>Welcome User !</p>
              )}
            />
            <Route
              pattern={userPath}
              render={(params) => (
                <p>Hello {params.match !== null ? params.match.params.user : 'Anonymous' }</p>
              )}
            />
          </Switch>
          <Route
            pattern={parentPath}
            render={() => (
              <div>
                Parent
                <Route
                  pattern={(parentPattern, parentMatch) => new PathPattern(parentMatch && parentMatch.url + '/child')}
                  render={() => (
                    <div>
                      Child
                    </div>
                  )}
                />
              </div>
            )}
          />
        </div>
      </RouterProvider>
    );
  }
}

export default App;