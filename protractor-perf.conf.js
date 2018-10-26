/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Determine if we run under bazel
const isBazel = !!process.env.RUNFILES;
// isBazel needed while 'scripts/ci/test-e2e.sh test.e2e.protractor-e2e' is run
// on Travis
// TODO: port remaining protractor e2e tests to bazel protractor_web_test_suite rule

// Make sure that the command line is read as the first thing
// as this could exit node if the help script should be printed.
const BASE = isBazel ? 'angular/modules' : 'dist/all';
require(`./${BASE}/e2e_util/perf_util`).readCommandLine();

var CHROME_OPTIONS = {
  'args': ['--js-flags=--expose-gc', '--no-sandbox', '--headless', '--disable-dev-shm-usage'],
  'perfLoggingPrefs': {
    'traceCategories':
        'v8,blink.console,devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing'
  }
};

var BROWSER_CAPS = {
  LocalChrome: {
    'browserName': 'chrome',
    chromeOptions: CHROME_OPTIONS,
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL',
    }
  },
  ChromeOnTravis: {
    browserName: 'chrome',
    chromeOptions: mergeInto(CHROME_OPTIONS, {
      'binary': process.env.CHROME_BIN,
    }),
    loggingPrefs: {
      performance: 'ALL',
      browser: 'ALL',
    }
  }
};

function mergeInto(src, target) {
  for (var prop in src) {
    target[prop] = src[prop];
  }
  return target;
}

const config = {
  onPrepare: function() { beforeEach(function() { browser.ignoreSynchronization = false; }); },
  restartBrowserBetweenTests: true,
  allScriptsTimeout: 11000,
  capabilities: process.env.TRAVIS ? BROWSER_CAPS.ChromeOnTravis : BROWSER_CAPS.LocalChrome,
  directConnect: true,
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000,
    print: function(msg) { console.log(msg); },
  },
  useAllAngular2AppRoots: true
};

// Bazel has different strategy for how specs and baseUrl are specified
if (!isBazel) {
  config.baseUrl = 'http://localhost:8000/';
  config.specs = [
    'dist/all/**/e2e_test/**/*_perf.spec.js',
    'dist/all/**/e2e_test/**/*_perf.js',
  ]
}

exports.config = config;
