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
  'rxjs': 'rxjs',
  'rxjs/operators': 'rxjs.operators',
};

module.exports = {
  entry: '../../dist/packages-dist/forms/fesm5/forms.js',
  dest: '../../dist/packages-dist/forms/bundles/forms.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/forms'},
  moduleName: 'ng.forms',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
