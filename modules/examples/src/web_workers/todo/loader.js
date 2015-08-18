$SCRIPTS$

window = {
  setTimeout: setTimeout,
  Map: Map,
  Set: Set,
  Array: Array,
  Reflect: Reflect,
  RegExp: RegExp,
  Promise: Promise,
  Date: Date,
  zone: zone
};
assert = function() {};


System.config({
  baseURL: '/',
  defaultJSExtensions: true,
  paths: {
    'rx': 'examples/src/web_workers/todo/rx.js'
  }
});

System.import("examples/src/web_workers/todo/background_index")
    .then(
        function(m) {
          console.log("running main");
          try {
            m.main();
          } catch (e) {
            console.error(e);
          }
        },
        function(error) { console.error("error loading background", error); });
