/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default {
  entry: '../../../dist/packages-dist/http/@angular/http/testing.es5.js',
  dest: '../../../dist/packages-dist/http/bundles/http-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.http.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/http': 'ng.http',
    'rxjs/Observable': 'Rx',
    'rxjs/ReplaySubject': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/operator/take': 'Rx.Observable.prototype'
  }
};
