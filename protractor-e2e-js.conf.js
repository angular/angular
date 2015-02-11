var data = module.exports = require('./protractor-e2e-shared.js');
var config = data.config;

config.baseUrl = 'http://localhost:8001/';

// TODO: remove exclusion when JS verison of scrolling benchmark is available
config.exclude = config.exclude || [];
config.exclude.push('dist/js/cjs/benchmarks_external/e2e_test/naive_infinite_scroll_perf.js');

data.createBenchpressRunner({
  forceGc: false,
  lang: 'js',
  test: true,
  sampleSize: 1
});

