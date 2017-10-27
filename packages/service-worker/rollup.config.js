/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../rollup.config').globals('@angular/service-worker');

exports.default = {
  entry: '../../dist/packages-dist/service-worker/esm5/service-worker.js',
  dest: '../../dist/packages-dist/service-worker/bundles/service-worker.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.serviceWorker',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
