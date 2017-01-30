/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/platform-browser/@angular/platform-browser/testing.es5.js',
  dest: '../../../dist/packages-dist/platform-browser/bundles/platform-browser-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.platformBrowser.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/platform-browser': 'ng.platformBrowser'
  }
};
