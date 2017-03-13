// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
'use strict';

/*global jasmine */
const { SpecReporter } = require('jasmine-spec-reporter');
const path = require('path');
const { BASE_URL, BROWSER_INSTANCES, TMP_SPECS_DIR } = require('./constants');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    path.join(TMP_SPECS_DIR, 'chunk*.spec.js')
  ],
  capabilities: {
    browserName: 'chrome',
    shardTestFiles: true,
    maxInstances: BROWSER_INSTANCES,
    // For Travis
    chromeOptions: {
      binary: process.env.CHROME_BIN
    }
  },
  directConnect: true,
  baseUrl: BASE_URL,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
  }
};
