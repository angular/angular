/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/platform-browser/@angular/platform-browser/animations.es5.js',
  dest: '../../../dist/packages-dist/platform-browser/bundles/platform-browser-animations.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.platformBrowser.animations',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/animations': 'ng.animations',
    '@angular/animations/browser': 'ng.animations.browser'
  }
};
