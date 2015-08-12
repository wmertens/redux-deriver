var currentDeriverDef = {
  roof: function(d) { return d.roofs[d.roofId] },
  roofId: function(d) { return d.state.app.roofId },
  roofs: function(d) { return d.state.roofs },
  cases: function(d) { return d.state.blogs.filter(b => b.type==="case") }
}
// TODO when keeping track of dependencies
// generation counter
// has[] should have last checked generation
// dependencies should store used value as well as reference

// TODO tests first ;)
// TODO allow configuring spy for testing
// TODO allow plain values instead of functions
function makeDeriver(def) {
  var d = {};

  Object.defineProperty(d, "__s", {
    value: {
      mem: [],
      has: [],
      deps: [],
      gen: 0,
      depth: 0,
      idx: 0
    },
    configurable: false
  });
  var s = d.__s;

  Object.defineProperty(d, "state", {
    get: function() {
      // Mark dep

      return s.state
    },
    set: function(ns) {
      // Check if state changed

      s.gen++;
      return (s.state = ns)
    },
    configurable: false
  });

  for (key in def) {
    Object.defineProperty(d, key, {
      get: (function(i, key) {
        return function() {
          // Mark dep

          if (s.has[i] === s.gen) return s.mem[i];

          // Check if own deps changed, else return same

          // Call spy
          console.log("calc", i, key, s.depth);

          // Recalc
          if (s.depth > 100) {
            console.log("Infinite loop? Aborting");
            return;
          }
          ++s.depth;
          s.mem[i] = def[key](d);
          --s.depth;

          s.has[i] = s.gen;
          return s.mem[i];
        }
      })(s.idx++, key),
      enumerable: true,
    })
  }
  return d;
}

var d = makeDeriver(currentDeriverDef);
d.state = {
  roofs: {
    sedum: "whee"
  },
  app: { roofId: "sedum"},
  blogs: [
    {
      type: "case",
      title: "prasrt"
    }
  ]
}
console.log(JSON.stringify(d));
console.log(JSON.stringify(d.__s));

d.state = {
  roofs: {
    sedum: "whaa"
  },
  app: { roofId: "sedum"},
  blogs: [
    {
      type: "case",
      title: "prasrt"
    }
  ]
}
console.log(JSON.stringify(d));
console.log(JSON.stringify(d.__s));
