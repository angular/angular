/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/common/@angular/common/testing.es5.js',
  dest: '../../../dist/packages-dist/common/bundles/common-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.common.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
};
