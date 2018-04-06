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
  '@angular/compiler': 'ng.compiler',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  'rxjs': 'rxjs',
  'rxjs/operators': 'rxjs.operators',
};

module.exports = {
  entry: '../../dist/packages-dist/upgrade/fesm5/upgrade.js',
  dest: '../../dist/packages-dist/upgrade/bundles/upgrade.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/upgrade'},
  moduleName: 'ng.upgrade',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
