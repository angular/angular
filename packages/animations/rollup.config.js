/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../dist/packages-dist/animations/@angular/animations.es5.js',
  dest: '../../dist/packages-dist/animations/bundles/animations.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.animations',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
  }
};
