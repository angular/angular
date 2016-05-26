const fs = require('fs');
const path = require('path');

// Load ts-node to be able to execute TypeScript files with protractor.
require('ts-node').register({
  project: path.join(__dirname, '../e2e/')
});


const E2E_BASE_URL = process.env['E2E_BASE_URL'] || 'http://localhost:4200';
const config = {
  useAllAngular2AppRoots: true,
  plugins: [{
    chromeA11YDevTools: {
      treatWarningsAsFailures: true
    },
    package: 'protractor-accessibility-plugin'
  }],
  specs: [ path.join(__dirname, '../e2e/**/*.e2e.ts') ],
  baseUrl: E2E_BASE_URL
};


if (process.env['TRAVIS'] !== undefined) {
  const key = require('../scripts/sauce/sauce_config');
  config.sauceUser = process.env['SAUCE_USERNAME'];
  config.sauceKey = key;
  config.capabilities = {
    'browserName': 'chrome',
    'tunnel-identifier': process.env['TRAVIS_JOB_NUMBER'],
    'build': process.env['TRAVIS_JOB_NUMBER'],
    'name': 'Material 2 E2E Tests'
  };
}


exports.config = config;
