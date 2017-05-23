/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';

const globals = {
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/platform-browser': 'ng.platformBrowser',
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx'
};

export default {
  entry: '../../dist/packages-dist/platform-webworker/@angular/platform-webworker.es5.js',
  dest: '../../dist/packages-dist/platform-webworker/bundles/platform-webworker.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.platformWebworker',
  plugins: [resolve()],
  external: Object.keys(globals),
  globals: globals
};
