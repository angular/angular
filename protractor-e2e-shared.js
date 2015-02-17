var data = module.exports = require('./protractor-shared.js');
var config = data.config;

config.specs = ['dist/js/cjs/**/e2e_test/**/*_spec.js', 'dist/js/cjs/**/e2e_test/**/*_perf.js'];
config.exclude = ['dist/js/cjs/**/node_modules/**'];
