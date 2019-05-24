/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Make sure that the command line is read as the first thing
// as this could exit node if the help script should be printed.
require('angular/modules/e2e_util/perf_util').readCommandLine();

const CHROME_OPTIONS = {
  'args': ['--js-flags=--expose-gc', '--no-sandbox', '--headless', '--disable-dev-shm-usage'],
  'perfLoggingPrefs': {
    'traceCategories':
        'v8,blink.console,devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing'
  }
};

exports.config = {
  onPrepare: function() { beforeEach(function() { browser.ignoreSynchronization = false; }); },
  restartBrowserBetweenTests: true,
  allScriptsTimeout: 11000,
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: CHROME_OPTIONS,
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL',
    }
  },
  directConnect: true,
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 90000,
    print: function(msg) { console.log(msg); },
  },
  useAllAngular2AppRoots: true
};
