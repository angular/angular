/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/platform-server/@angular/platform-server/testing.es5.js',
  dest: '../../../dist/packages-dist/platform-server/bundles/platform-server-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.platformServer.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/compiler/testing': 'ng.compiler.testing',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-server': 'ng.platformServer',
    '@angular/platform-browser-dynamic/testing': 'ng.platformBrowserDynamic.testing'
  }
};
