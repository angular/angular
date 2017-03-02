/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/animation/testing/index.js',
  dest: '../../../dist/packages-dist/animation/bundles/animation-testing.umd.js',
  format: 'umd',
  moduleName: 'ng.animation.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/animation': 'ng.animation',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
};
