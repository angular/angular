/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';

const globals = {
  '@angular/core': 'ng.core',
  '@angular/compiler': 'ng.compiler',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/http': 'ng.http',
  'rxjs/Observable': 'Rx',
  'rxjs/ReplaySubject': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/operator/take': 'Rx.Observable.prototype'
};

export default {
  entry: '../../../dist/packages-dist/http/@angular/http/testing.es5.js',
  dest: '../../../dist/packages-dist/http/bundles/http-testing.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.http.testing',
  plugins: [resolve()],
  external: Object.keys(globals),
  globals: globals
};
