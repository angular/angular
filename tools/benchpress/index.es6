var benchmark = require('./src/benchmark');
var tools = require('./src/tools');

module.exports = {
  runBenchmark: benchmark.runBenchmark,
  verifyNoBrowserErrors: tools.verifyNoBrowserErrors
};