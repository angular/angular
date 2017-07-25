/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const browserProvidersConf = require('../../../../browser-providers.conf.js');

exports.config = {
  specs: ['../built/e2e/*-spec.js'],
  capabilities: browserProvidersConf.protractorCapabilities,
  directConnect: true,
  baseUrl: 'http://localhost:9876/',
  framework: 'jasmine',
  useAllAngular2AppRoots: true
};
