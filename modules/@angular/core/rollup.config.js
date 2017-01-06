/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/core/index.js',
  dest: '../../../dist/packages-dist/core/bundles/core.umd.js',
  format: 'umd',
  moduleName: 'ng.core',
  globals: {
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
  }
};
