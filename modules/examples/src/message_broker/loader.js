$SCRIPTS$

//importScripts("math_worker.js").execute();
//System.import("examples/src/web_workers/math_worker").then(function(m){console.log("got", m)});
//importScripts("rx.js");

// TODO: do this correctly with lang facade
window = {
  setTimeout: setTimeout,
  Map: Map,
  Set: Set,
  Array: Array,
  Reflect: Reflect,
  RegExp: RegExp,
  Promise: Promise,
  Date: Date
};
assert = function(){};


System.config({
  baseURL: '/',
  defaultJSExtensions: true,
  paths: {
    'rx': 'examples/src/message_broker/rx.js'
  }
});

System.import("examples/src/message_broker/background_index").then(function(m){
  console.log("running main");
  try{
    m.main();
  } catch (e){
    console.error(e);
  }
}, function(error){
  console.error("error loading background", error);
});
