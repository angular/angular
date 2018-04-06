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
  '@angular/platform-browser': 'ng.platformBrowser',
  'rxjs': 'rxjs',
  'rxjs/operators': 'rxjs.operators',
};

module.exports = {
  entry: '../../dist/packages-dist/router/fesm5/router.js',
  dest: '../../dist/packages-dist/router/bundles/router.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/router'},
  moduleName: 'ng.router',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
