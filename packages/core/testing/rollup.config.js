/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/core/@angular/core/testing.es5.js',
  dest: '../../../dist/packages-dist/core/bundles/core-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.core.testing',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
  }
};
