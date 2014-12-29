var timeBenchmark = require('./time_benchmark');
var tools = require('./tools');

module.exports = {
  runTimeBenchmark: timeBenchmark.runTimeBenchmark,
  verifyNoBrowserErrors: tools.verifyNoBrowserErrors
};