const {config} = require('../protractor.conf');
exports.config = {
  ...config,
  specs: ['./app.e2e-spec.ts'],
};
