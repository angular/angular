/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This protractor Saucelabs configuration is primarily for testing the
// production bundle with differential loading against older legacy browsers.
//
// Legacy browsers that do not support ES modules should load
// <script nomodule src="bundle.min.js"></script>
// while evergreen browsers that do support ES modules should load
// <script type="module" src="bundle.min.es2015.js"></script>

const sauceCapabilities = {
  // Chrome 74 supports ES modules
  'SL_CHROME': {
    browserName: "chrome",
    version: "74",
  },
  // Chrome 41 does not support ES modules
  'SL_CHROMELEGACY': {
    browserName: "chrome",
    version: "41",
  },
  // IE10 does not support ES modules
  'SL_IE10': {
    browserName: 'internet explorer',
    platform: 'Windows 2012',
    version: '10'
  },
  // IE11 does not support ES modules
  'SL_IE11': {
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11',
  },
  // Edge 14 does not support ES modules
  'SL_EDGE': {
    browserName: "MicrosoftEdge",
    platform: 'Windows 10',
    version: "14.14393",
  },
};

if (!process.env['SAUCE_USERNAME']) {
  throw new Error('SAUCE_USERNAME environment variable required!')
}
if (!process.env['SAUCE_ACCESS_KEY']) {
  throw new Error('SAUCE_ACCESS_KEY environment variable required!')
}
if (!process.env['SAUCE_BROWSER']) {
  throw new Error('SAUCE_BROWSER environment variable required!')
}

const capabilities = sauceCapabilities[process.env['SAUCE_BROWSER']];
if (!capabilities) {
  throw new Error(`Invalid SAUCE_BROWSER value! Choose one of ${Object.keys(sauceCapabilities)}.`)
}

capabilities.name = 'integration-bazel-sauce-test';

const tunnelIdentifier = process.env['SAUCE_TUNNEL_IDENTIFIER'];
if (tunnelIdentifier) {
  capabilities['tunnel-identifier'] = tunnelIdentifier;
}

exports.config = {
  sauceUser: process.env['SAUCE_USERNAME'],
  sauceKey: process.env['SAUCE_ACCESS_KEY'],
  getPageTimeout: 60 * 1000,
  allScriptsTimeout: 60 * 1000,
  capabilities: capabilities,
  // `multiCapabilities` do not yet work under Bazel; protractor
  // spawns a new node process for each capability in multiCapabilities
  // and the new node processes are not able to resolve files under
  // bazel as they don't have the overwritten Bazel resolve function.
  // This means we can only test on one browser at a time under Bazel
  // for the time being until this is resolved.
};
