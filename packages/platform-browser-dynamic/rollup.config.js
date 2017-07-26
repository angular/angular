/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

const globals = {
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/compiler': 'ng.compiler',
  '@angular/platform-browser': 'ng.platformBrowser',
};

export default {
  entry: '../../dist/packages-dist/platform-browser-dynamic/esm5/platform-browser-dynamic.js',
  dest: '../../dist/packages-dist/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/platform-browser-dynamic'},
  moduleName: 'ng.platformBrowserDynamic',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
