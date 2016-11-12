/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

require('core-js');
require('reflect-metadata');
const testHelper = require('../../src/firefox_extension/lib/test_helper.js');

exports.config = {
  specs: ['spec.js', 'sample_benchmark.js'],

  framework: 'jasmine2',

  jasmineNodeOpts: {showColors: true, defaultTimeoutInterval: 1200000},

  getMultiCapabilities: function() { return testHelper.getFirefoxProfileWithExtension(); }
};
