var data = module.exports = require('./protractor-perf-shared.js');
var config = data.config;

config.baseUrl = 'http://localhost:8002/';

// TODO: remove this line when largetable dart has been added
config.exclude = config.exclude || [];
config.exclude.push('dist/js/cjs/benchmarks_external/e2e_test/largetable_perf.js');

data.createBenchpressRunner({
  forceGc: false,
  lang: 'dart',
  test: false,
  sampleSize: 20
});

