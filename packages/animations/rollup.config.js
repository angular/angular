/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/animation/index.js',
  dest: '../../../dist/packages-dist/animation/bundles/animation.umd.js',
  format: 'umd',
  moduleName: 'ng.animation',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
  }
};
