const fs = require('fs');
const path = require('path');

// Load ts-node to be able to execute TypeScript files with protractor.
require('ts-node').register({
  project: path.join(__dirname, '../e2e/')
});


const E2E_BASE_URL = process.env['E2E_BASE_URL'] || 'http://localhost:4200';
const config = {
  // TODO(jelbourn): add back plugin for a11y assersions once it supports specifying AXS options.
  useAllAngular2AppRoots: true,
  specs: [ path.join(__dirname, '../e2e/**/*.e2e.ts') ],
  baseUrl: E2E_BASE_URL,
  allScriptsTimeout: 30000,
  getPageTimeout: 30000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
  }
};


if (process.env['TRAVIS']) {
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
