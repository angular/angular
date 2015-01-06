var timeBenchmark = require('./src/time_benchmark');
var tools = require('./src/tools');

module.exports = {
  runTimeBenchmark: timeBenchmark.runTimeBenchmark,
  verifyNoBrowserErrors: tools.verifyNoBrowserErrors
};