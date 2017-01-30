/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../../dist/packages-dist/animations/@angular/animations/browser/testing.es5.js',
  dest: '../../../../dist/packages-dist/animations/bundles/animations-browser-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.animations.browser.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/animations': 'ng.animations'
  }
};
