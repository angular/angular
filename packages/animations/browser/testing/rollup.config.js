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
  '@angular/animations': 'ng.animations',
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',
};

export default {
  entry: '../../../../dist/packages-dist/animations/esm5/browser/testing.js',
  dest: '../../../../dist/packages-dist/animations/bundles/animations-browser-testing.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/animations/browser/testing'},
  moduleName: 'ng.animations.browser.testing',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
