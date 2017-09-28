/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

const globals = {
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/compiler': 'ng.compiler',
  '@angular/platform-browser': 'ng.platformBrowser',
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/operator/toPromise': 'Rx.Observable.prototype',
  'rxjs/operator/filter': 'Rx.Observable.prototype',
  'rxjs/operator/first': 'Rx.Observable.prototype'
};

export default {
  entry: '../../dist/packages-dist/platform-server/esm5/platform-server.js',
  dest: '../../dist/packages-dist/platform-server/bundles/platform-server.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/platform-server'},
  moduleName: 'ng.platformServer',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
