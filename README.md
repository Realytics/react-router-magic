# React Router Magic
> Like react-router but with magic inside

Yet another Router for React. It has an API similar to [react-router](https://github.com/ReactTraining/react-router) exept matching is not include and it use `context` to bypass SCU blocked update.

## This package is not Production ready !

This package is under developement, do not use it in production. 

## Why this package

This package is highly inspired by `react-router` but it differ in two major way:
- The `location` is passed via context even if `shouldComponentUpdate` is implemented : We use a subscribtion system to make sure all `Route` are updated when the `location` changes.
- The path matching logic is not include : instead of manipulating paths as string like in `react-router`, `react-router-magic` expect a pattern which is just a class that must implement two methods (`match` & `compile`). This mmean you can use whatever logic you want to match paths. If you want something similar to what `react-router` does, you can use [path-pattern](https://github.com/Realytics/path-pattern).

## Prerequisites

You need [NodeJS](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/en/).

## Installing

```bash
npm install react-router-magic --save
```

or

```bash
yarn add react-router-magic
```

## TODO

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [releases on this repository](https://github.com/Realytics/path-pattern/releases). 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details