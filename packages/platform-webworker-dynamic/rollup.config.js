/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../rollup.config').globals('@angular/platform-webworker-dynamic');

exports.default = {
  entry: '../../dist/packages-dist/platform-webworker-dynamic/esm5/platform-webworker-dynamic.js',
  dest:
      '../../dist/packages-dist/platform-webworker-dynamic/bundles/platform-webworker-dynamic.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/platform-webworker-dynamic'},
  moduleName: 'ng.platformWebworkerDynamic',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
