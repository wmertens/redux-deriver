// TODO tests first ;)
// TODO example use case with shared derivers
// TODO allow plain values instead of functions
// TODO use shallowEqual for dep checking?
// TODO provide previous value for updating returned derivers?
//   ...or if the return value is {deriverDef, subState} do it automatically?
// TODO provide d on this for coffeescript?

const debug = console.log;

function makeDeriver(def, inspector) {
  let d = {};
  let getters = [];
  let onCalc = inspector && inspector.onCalc;
  let mem = []; // last result
  let has = []; // last generation value was calculated
  let deps = []; // dependencies for each value

  let s = {
    gen: 0,
    depth: 0,
    idx: 0
  };
  if (inspector) {
    s.mem = mem;
    s.has = has;
    s.deps = deps;
    inspector.internalState = s;
  }

  Object.defineProperty(d, 'state', {
    get: getters[0] = () => {
      let val = mem[0];

      // Mark dep
      if (s.dep) {
        s.dep[0] = val;
      }

      return val;
    },
    configurable: false
  });

  Object.defineProperty(d, 'setState', {
    value: (ns) => {
      // TODO Check shallowly if state changed? Probably not worth it
      if (ns === mem[0]) {
        return ns;
      }

      s.gen++;
      mem[0] = ns;
      return ns;
    },
    configurable: false
  });

  function makeGetter(i, key) {
    return getters[i] = () => {
      let prevDep = s.dep;

      if (s.has[i] !== s.gen) {

        // Check if own deps changed, else return same
        let myDeps = deps[i];
        let dontRecalc;
        if (myDeps) {
          // Don't influence current dep
          s.dep = null;
          dontRecalc = true;
          // Walk the sparse array of my dependencies
          for (let j in myDeps) {
            if (myDeps[j] !== getters[j]()) {
              dontRecalc = false;
              break;
            }
          }
        }
        if (!dontRecalc) {
          // Call onCalc
          if (onCalc) onCalc(key, i, s.depth);

          // Recalc
          if (s.depth > 100) {
            throw new Error('Infinite loop? Aborting');
          }
          s.dep = [];
          ++s.depth;
          mem[i] = def[key](d);
          --s.depth;
          deps[i] = s.dep;

          has[i] = s.gen;
        }
        s.dep = prevDep;
      }

      let val = mem[i];
      if (prevDep) {
        prevDep[i] = val;
      }
      return val;
    };
  }

  for (let key in def) {
    if (def.hasOwnProperty(key)) {
      Object.defineProperty(d, key, {
        get: makeGetter(++s.idx, key),
        enumerable: true
      });
    }
  }
  return d;
}

let currentDeriverDef = {
  roof: (d) => d.roofs[d.roofId],
  roofId: (d) => d.state.app.roofId,
  roofs: (d) => d.state.roofs,
  blogs: (d) => d.state.blogs,
  cases: (d) => d.blogs.filter(b => b.type === 'case')
};

let spy = {
  onCalc: (key, i, depth) => {
    debug('Calculating', key, i, depth);
  }
};
let d = makeDeriver(currentDeriverDef, spy);

let state = {
  roofs: {
    sedum: 'whee',
    foom: 'whee'
  },
  app: { roofId: 'sedum'},
  blogs: [
    {
      type: 'nice',
      title: 'prasrt'
    },
    {
      type: 'case',
      title: 'prasrt'
    }
  ]
};
d.setState(state);
debug(JSON.stringify(d));
debug(JSON.stringify(spy.internalState, null, 2));

state = {...state, app: {
  roofId: 'foom'
}};

d.setState(state);
debug(JSON.stringify(d));
debug(JSON.stringify(spy.internalState, null, 2));
