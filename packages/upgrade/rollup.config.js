/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../rollup.config').globals('@angular/upgrade');

exports.default = {
  entry: '../../dist/packages-dist/upgrade/esm5/upgrade.js',
  dest: '../../dist/packages-dist/upgrade/bundles/upgrade.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/upgrade'},
  moduleName: 'ng.upgrade',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
