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
  '@angular/router': 'ng.router',
  '@angular/upgrade/static': 'ng.upgrade.static'
};


module.exports = {
  entry: '../../../dist/packages-dist/router/fesm5/upgrade.js',
  dest: '../../../dist/packages-dist/router/bundles/router-upgrade.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/router/upgrade'},
  moduleName: 'ng.router.upgrade',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
