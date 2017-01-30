/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/upgrade/@angular/upgrade/static.es5.js',
  dest: '../../../dist/packages-dist/upgrade/bundles/upgrade-static.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.upgrade.static',
  globals: {'@angular/core': 'ng.core'}
};
