var config = exports.config = require('./protractor-perf-shared.js').config;
config.baseUrl = 'http://localhost:8001/';
config.params.lang = 'js';

// TODO: remove exclusion when JS verison of scrolling benchmark is available
config.exclude = config.exclude || [];
config.exclude.push('dist/cjs/e2e_test/benchmarks_external/e2e_test/naive_infinite_scroll_perf.js');
