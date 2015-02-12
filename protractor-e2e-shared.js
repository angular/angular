var config = exports.config = require('./protractor-shared.js').config;
config.specs = ['dist/js/cjs/**/e2e_test/**/*_spec.js'];
config.exclude = ['dist/js/cjs/**/node_modules/**'];
