const spy = console.log;
let currentDeriverDef = {
  roof: (d) => d.roofs[d.roofId],
  roofId: (d) => d.state.app.roofId,
  roofs: (d) => d.state.roofs,
  cases: (d) => d.state.blogs.filter(b => b.type === 'case')
};

// TODO when keeping track of dependencies
// generation counter
// has[] should have last checked generation
// dependencies should store used value as well as reference

// TODO tests first ;)
// TODO allow configuring spy for testing
// TODO allow plain values instead of functions
function makeDeriver(def) {
  let d = {};

  let s = {
    mem: [],
    has: [],
    deps: [],
    gen: 0,
    depth: 0,
    idx: 0
  };

  Object.defineProperty(d, 'state', {
    get: () => {
      // Mark dep
      if (s.dep) s.dep[0] = true;

      return s.state;
    },
    configurable: false
  });

  Object.defineProperty(d, 'setState', {
    value: (ns) => {
      // Check if state changed

      s.gen++;
      s.state = ns;
      return ns;
    },
    configurable: false
  });

  function makeGetter(i, key) {
    return () => {
      // Mark dep
      if (s.dep) s.dep[i] = true;

      if (s.has[i] === s.gen) return s.mem[i];

      // Check if own deps changed, else return same

      // Call spy
      spy('calc', i, key, s.depth);

      // Recalc
      if (s.depth > 100) {
        spy('Infinite loop? Aborting');
        return undefined;
      }
      ++s.depth;
      s.mem[i] = def[key](d);
      --s.depth;

      s.has[i] = s.gen;
      return s.mem[i];
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

let d = makeDeriver(currentDeriverDef);
d.setState({
  roofs: {
    sedum: 'whee'
  },
  app: { roofId: 'sedum'},
  blogs: [
    {
      type: 'case',
      title: 'prasrt'
    }
  ]
});
spy(JSON.stringify(d));
spy(JSON.stringify(d.__s));

d.setState({
  roofs: {
    sedum: 'whaa'
  },
  app: { roofId: 'sedum'},
  blogs: [
    {
      type: 'case',
      title: 'prasrt'
    }
  ]
});
spy(JSON.stringify(d));
spy(JSON.stringify(d.__s));
