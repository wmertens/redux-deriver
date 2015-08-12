Redux Deriver
=========================

Lazy calculation of derived state for [Redux](https://github.com/gaearon/redux).  
Performant and flexible.

[![npm version](https://img.shields.io/npm/v/redux-deriver.svg?style=flat-square)](https://www.npmjs.com/package/redux-deriver)
[![npm downloads](https://img.shields.io/npm/dm/redux-deriver.svg?style=flat-square)](https://www.npmjs.com/package/redux-deriver)
[![redux channel on slack](https://img.shields.io/badge/slack-redux@reactiflux-61DAFB.svg?style=flat-square)](http://www.reactiflux.com)

## Table of Contents

- [React Native](#react-native)
- [Quick Start](#quick-start)
- [API](#api)
  - [`<Provider store>`](#provider-store)
  - [`connect([mapStateToProps], [mapDispatchToProps], [mergeProps])`](#connectmapstatetoprops-mapdispatchtoprops-mergeprops)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## React Native

What you get from `redux-deriver` is for React.  
For React Native, import from `redux-deriver/native` instead.

## Quick Start

Redux Deriver embraces the idea of lazily-evaluated functional programming. You define an interface from the state that is stored by your reducers, and you use that instead of using the state directly. This derived state is a pure derivation from the state object (basically a grouping of selectors). Calculation can be postponed until the first use.

Since the data is a pure derivation from state it can be cached once calculated, which makes it more CPU-efficient than using selectors directly.

To do this, you need to specify the derived state as selectors, and you get an object that uses getters to transform a given state and caches the result. The cache is cleared for a new state.

## When not to use this project

Counter-indications:
* You need to support IE8 (poor you!)
* All your data changes all the time and the caching overhead is useless
* You are calculating huge amounts of data and keeping a cached copy around would be terrible (e.g. while navigating the app)
  * In that case you probably need to be careful about using Redux too
  * Perhaps creating and clearing per-component derivers would work

## Roadmap

- Also allow lazy calculation of subtrees (so process returned objects) (simply return a new deriver?)
- Mark dependencies used in calculation and instead of clearing the cache, recalculate when dependencies change. State is just another dependency. This would need a generation counter and some way to mark when a selector last changed.
- Some sort of composition like reducers


Below is not yet relevant



## Troubleshooting

Make sure to check out [Troubleshooting Redux](http://gaearon.github.io/redux/docs/Troubleshooting.html) first.

### My views aren’t updating!

See the link above.
In short,

* Reducers should never mutate state, they must return new objects, or React Redux won’t see the updates.
* Make sure you either bind action creators with `mapDispatchToState` argument to `connect()` or with `bindActionCreators()` method, or that you manually call `dispatch()`. Just calling your `MyActionCreators.addTodo()` function won’t work because it just *returns* an action, but not *dispatches* it.

### My views aren’t updating on route change with React Router 0.13

If you’re using React Router 0.13, you might [bump into this problem](https://github.com/wmertens/redux-deriver/issues/43). The solution is simple: whenever you use `<RouteHandler>` or the `Handler` provided by `Router.run`, pass the router state to it.

Root view:

```js
Router.run(routes, Router.HistoryLocation, (Handler, routerState) => { // note "routerState" here
  React.render(
    <Provider store={store}>
      {() => <Handler routerState={routerState} />} // note "routerState" here
    </Provider>,
    document.getElementById('root')
  );
});
```

Nested view:

```js
render() {
  // Keep passing it down
  return <RouteHandler routerState={this.props.routerState} />;
}
```

Conveniently, this gives your components access to the router state!
You can also upgrade to React Router 1.0 which shouldn’t have this problem. (Let us know if it does!)

### I have some weird context error

If you have context issues, [make sure you don’t have duplicate React](https://medium.com/@dan_abramov/two-weird-tricks-that-fix-react-7cf9bbdef375) on the page.
Also make sure you didn’t forget to wrap your root component in [`<Provider>`](#provider-store).

## License

MIT
