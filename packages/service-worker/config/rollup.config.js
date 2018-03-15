/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = {};

module.exports = {
  entry: '../../../dist/packages-dist/service-worker/fesm5/config.js',
  dest: '../../../dist/packages-dist/service-worker/bundles/service-worker-config.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.serviceWorker.config',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
