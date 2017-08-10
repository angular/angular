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
  '@angular/router': 'ng.router',
  '@angular/upgrade/static': 'ng.upgrade.static'
};

export default {
  entry: '../../../dist/packages-dist/router/@angular/router/upgrade.es5.js',
  dest: '../../../dist/packages-dist/router/bundles/router-upgrade.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.router.upgrade',
  plugins: [resolve()],
  external: Object.keys(globals),
  globals: globals
};
