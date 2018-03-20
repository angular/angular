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
  '@angular/platform-browser': 'ng.platformBrowser',
  'rxjs': 'rxjs',
  'rxjs/operators': 'rxjs.operators'
};

module.exports = {
  entry: '../../dist/packages-dist/elements/fesm5/elements.js',
  dest: '../../dist/packages-dist/elements/bundles/elements.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/elements'},
  moduleName: 'ng.elements',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
