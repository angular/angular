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
  '@angular/animations': 'ng.animations'
};

export default {
  entry: '../../../dist/packages-dist/animations/esm5/browser.js',
  dest: '../../../dist/packages-dist/animations/bundles/animations-browser.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/animations/browser'},
  moduleName: 'ng.animations.browser',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
