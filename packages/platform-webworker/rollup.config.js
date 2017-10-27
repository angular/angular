/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../rollup.config').globals('@angular/platform-webworker');

exports.default = {
  entry: '../../dist/packages-dist/platform-webworker/esm5/platform-webworker.js',
  dest: '../../dist/packages-dist/platform-webworker/bundles/platform-webworker.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/platform-webworker'},
  moduleName: 'ng.platformWebworker',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
