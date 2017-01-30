/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/router/@angular/router/testing.es5.js',
  dest: '../../../dist/packages-dist/router/bundles/router-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.router.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/common/testing': 'ng.common.testing',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/router': 'ng.router'
  }
};
