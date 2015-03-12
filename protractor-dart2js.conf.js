var data = module.exports = require('./protractor-shared.js');
var config = data.config;

config.baseUrl = 'http://localhost:8002/';

config.exclude.push(
  'dist/js/cjs/examples/e2e_test/sourcemap/sourcemap_spec.js',
  // TODO: remove this line when largetable dart has been added
  'dist/js/cjs/benchmarks_external/e2e_test/largetable_perf.js'
);

data.createBenchpressRunner({ lang: 'dart' });

