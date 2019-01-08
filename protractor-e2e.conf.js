/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Make sure that the command line is read as the first thing
// as this could exit node if the help script should be printed.
require('./dist/all/e2e_util/e2e_util').readCommandLine();

exports.config = {
  onPrepare: function() { beforeEach(function() { browser.ignoreSynchronization = false; }); },
  allScriptsTimeout: 11000,
  specs: ['dist/all/**/e2e_test/**/*_spec.js'],
  exclude: ['dist/all/@angular/examples/**'],
  capabilities: {
    'browserName': 'chrome',
    // Enables concurrent testing. Currently runs four e2e files in parallel.
    shardTestFiles: true,
    maxInstances: 4,
  },
  directConnect: true,
  baseUrl: 'http://localhost:8000/',
  framework: 'jasmine2',
  jasmineNodeOpts:
      {showColors: true, defaultTimeoutInterval: 60000, print: function(msg) { console.log(msg) }},
  useAllAngular2AppRoots: true,
};
