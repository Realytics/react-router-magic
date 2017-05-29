import React, { Component } from 'react';
import { RouterProvider, PathPattern, Route, NavProvider } from 'react-router-magic';
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

const homePath = new PathPattern('/home');

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
          />
          <Route
            pattern={homePath}
            render={() => (
              <p>Home !!</p>
            )}
          />
        </div>
      </RouterProvider>
    );
  }
}

export default App;