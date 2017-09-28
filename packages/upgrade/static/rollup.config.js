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
  '@angular/core': 'ng.core'
};

export default {
  entry: '../../../dist/packages-dist/upgrade/esm5/static.js',
  dest: '../../../dist/packages-dist/upgrade/bundles/upgrade-static.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/upgrade/static'},
  moduleName: 'ng.upgrade.static',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
