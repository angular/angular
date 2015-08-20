var data = module.exports = require('./protractor-shared.js');
var config = data.config;

config.baseUrl = 'http://localhost:8001/';
// TODO: remove exclusion when JS verison of scrolling benchmark is available
config.exclude.push('dist/js/cjs/benchmarks_external/e2e_test/naive_infinite_scroll_spec.js');
config.exclude.push('dist/js/cjs/benchmarks_external/e2e_test/naive_infinite_scroll_perf.js');
// TODO: remove once https://github.com/angular/angular/issues/3757 is resolved
config.exclude.push('dist/js/cjs/benchmarks_external/e2e_test/compiler_perf.js');
config.exclude.push('dist/js/cjs/benchmarks_external/e2e_test/naive_infinite_scroll.js');
config.exclude.push('dist/js/cjs/benchmarks_external/e2e_test/tree.js');

data.createBenchpressRunner({ lang: 'js' });

