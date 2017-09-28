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
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx'
};

export default {
  entry: '../../../dist/packages-dist/common/esm5/testing.js',
  dest: '../../../dist/packages-dist/common/bundles/common-testing.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/common/testing'},
  moduleName: 'ng.common.testing',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
