var key = require('./scripts/sauce/sauce_config.js');

exports.config = {
  useAllAngular2AppRoots: true,
  specs: [ './e2e/**/*.e2e.js' ],
  baseUrl: 'http://localhost:4200',
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: key,
  capabilities: {
    'browserName': 'chrome',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_JOB_NUMBER,
    'name': 'Material 2 E2E Tests'
  }
};
