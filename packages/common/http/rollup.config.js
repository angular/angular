/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const globals = {
  '@angular/core': 'ng.core',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/common': 'ng.common',
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',

  'rxjs/observable/of': 'Rx.Observable.prototype',

  'rxjs/operator/concatMap': 'Rx.Observable.prototype',
  'rxjs/operator/filter': 'Rx.Observable.prototype',
  'rxjs/operator/map': 'Rx.Observable.prototype',
};

export default {
  entry: '../../../dist/packages-dist/common/esm5/http.js',
  dest: '../../../dist/packages-dist/common/bundles/common-http.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/common/http'},
  moduleName: 'ng.common.http',
  external: Object.keys(globals),
  globals: globals
};
