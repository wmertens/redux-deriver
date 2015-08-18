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

Redux Deriver embraces the idea of lazily-evaluated functional programming. You define an interface from the state that is stored by your reducers, and you use that instead of using the state directly. This is a pure derivation from the state object (basically a grouping of selectors). Calculation can be postponed until the first use.

Since the data is a pure derivation from state it can be cached once calculated, which makes it more CPU-efficient than using selectors directly.

To do this, you need to specify the derived state as derivation functions, and you get an object that uses getters to transform a given state and caches the result. When a new state is provided, only the parts that depend on changed parts that depend on the state are recalculated.

## Always remember

* Your derivation functions should be pure, synchronous mapping functions. Given the same state, you should always produce the same value. You access them functions as attributes as a gentle reminder of that fact (plus it's less typing).
* For maximum caching you should make a plain derivation of every bit of state you need, so your more expensive derivations only recalculate when those change. So instead of `d.state.foo.map(...)` use `d.foo.map(...)` and define `foo: (d) => d.state.foo`.
* Contrary to state, you _can_ store non-serializable objects, for example you could convert date values to Date objects.
* If you need to do something asynchronous, then _maybe_ you could store a Promise. However, the promise won't trigger rendering upon completion, and a Promise is actually sort of a mutable object, so that is likely a bad idea. Not sure yet.
* For even more laziness you can return Deriver objects in your derivation functions. Just make sure to make them singletons for updating.

## When not to use this project

Counter-indications:
* You need to support IE8 (poor you!)
* All your data changes all the time and the caching overhead is useless (not likely)
* You are calculating huge amounts of data and keeping a cached copy around would be terrible (e.g. while navigating the app)
  * In that case you probably need to be careful about using Redux too
  * Perhaps creating and clearing per-component derivers would work

## Roadmap

- Some sort of composition like reducers?
- A connector function

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
