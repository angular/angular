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
require('reflect-metadata');
const protractorCapabilities = require('./browser-providers.conf.js').protractorCapabilities;

Error.stackTraceLimit = 9999;

exports.config = {
  onPrepare: function() { beforeEach(function() { browser.ignoreSynchronization = false; }); },
  allScriptsTimeout: 11000,
  specs: ['dist/examples/**/e2e_test/*_spec.js'],
  capabilities: protractorCapabilities,
  directConnect: true,
  baseUrl: 'http://localhost:8001/',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000,
    print: function(msg) { console.log(msg); },
  },
  useAllAngular2AppRoots: true
};
