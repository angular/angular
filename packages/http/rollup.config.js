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
  '@angular/compiler': 'ng.compiler',
  '@angular/platform-browser': 'ng.platformBrowser',
  'rxjs': 'rxjs'
};

module.exports = {
  entry: '../../dist/packages-dist/http/fesm5/http.js',
  dest: '../../dist/packages-dist/http/bundles/http.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/http'},
  moduleName: 'ng.http',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
