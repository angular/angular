var ChromeLauncher = require('./chrome/launcher');
var events = require('events');
var Q = require('q');

// TODO: load options from disc,
// as well as the tests that should be executed!
var options = {
  host: 'localhost',
  port: 9222,
  captureTimeout: 2000,
  pageLoadTimeout: 2000
};
var benchmarks = [require('./test.js')];

var appEmitter = new events.EventEmitter();
var launcher = new ChromeLauncher(appEmitter, options);

launcher.start().then(function(browser) {
  var remainingBenchmarks = benchmarks.slice();
  return nextBenchmark();

  function nextBenchmark() {
    if (remainingBenchmarks.length) {
      var benchmark = remainingBenchmarks.shift();
      return benchmark(browser, options).then(nextBenchmark);
    } else {
      return Q.resolve(true);
    }
  }
}).then(exit, function() {
  console.log(e, e.stack);
  appEmitter.emit('exit');
});

process.on( "SIGINT", exit);
process.on( "SIGTERM", exit);

function exit() {
  appEmitter.emit('exit');
}