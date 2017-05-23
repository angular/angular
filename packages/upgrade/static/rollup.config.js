/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';

const globals = {
  '@angular/core': 'ng.core'
};

export default {
  entry: '../../../dist/packages-dist/upgrade/@angular/upgrade/static.es5.js',
  dest: '../../../dist/packages-dist/upgrade/bundles/upgrade-static.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.upgrade.static',
  plugins: [resolve()],
  external: Object.keys(globals),
  globals: globals
};
