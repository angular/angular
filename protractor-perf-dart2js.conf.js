var config = exports.config = require('./protractor-perf-shared.js').config;
config.baseUrl = 'http://localhost:8002/';
config.params.lang = 'dart';
// TODO: remove this line when largetable dart has been added
config.exclude = config.exclude || [];
config.exclude.push('dist/cjs/e2e_test/benchmarks_external/e2e_test/largetable_perf.js');
