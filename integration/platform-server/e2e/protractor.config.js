/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

exports.config = {
  specs: ['../built/e2e/*-spec.js'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--no-sandbox'],
      binary: process.env.CHROME_BIN,
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:9876/',
  framework: 'jasmine',
  useAllAngular2AppRoots: true
};
