/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = {
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/Subscription': 'Rx'
};

module.exports = {
  entry: '../../../dist/packages-dist/common/esm5/testing.js',
  dest: '../../../dist/packages-dist/common/bundles/common-testing.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/common/testing'},
  moduleName: 'ng.common.testing',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
