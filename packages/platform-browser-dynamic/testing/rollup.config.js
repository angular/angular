/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry:
      '../../../dist/packages-dist/platform-browser-dynamic/@angular/platform-browser-dynamic/testing.es5.js',
  dest:
      '../../../dist/packages-dist/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.platformBrowserDynamic.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/core/testing': 'ng.core.testing',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/compiler/testing': 'ng.compiler.testing',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser/testing': 'ng.platformBrowser.testing',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic'
  }
};
