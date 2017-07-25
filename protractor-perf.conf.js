/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Make sure that the command line is read as the first thing
// as this could exit node if the help script should be printed.
require('./dist/all/e2e_util/perf_util').readCommandLine();
const protractorCapabilities = require('./browser-providers.conf.js').protractorCapabilities;

var loggingCapabilities = {
  browserName: protractorCapabilities.browserName,
  chromeOptions: {
    args: ['--js-flags=--expose-gc'].concat(protractorCapabilities.chromeOptions.args),
    perfLoggingPrefs: {
      'traceCategories': 'v8,blink.console,devtools.timeline,disabled-by-default-devtools.timeline'
    }
  },
  loggingPrefs: {
    performance: 'ALL',
    browser: 'ALL',
  }
};

exports.config = {
  onPrepare: function() { beforeEach(function() { browser.ignoreSynchronization = false; }); },
  restartBrowserBetweenTests: true,
  allScriptsTimeout: 11000,
  specs: ['dist/all/**/e2e_test/**/*_perf.js'],
  capabilities: loggingCapabilities,
  directConnect: true,
  baseUrl: 'http://localhost:8000/',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000,
    print: function(msg) { console.log(msg); },
  },
  useAllAngular2AppRoots: true
};

function mergeInto(src, target) {
  for (var prop in src) {
    target[prop] = src[prop];
  }
  return target;
}
