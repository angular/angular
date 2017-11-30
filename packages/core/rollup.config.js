/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = {
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/Observer': 'Rx',
  'rxjs/Subscription': 'Rx',
  'rxjs/observable/merge': 'Rx.Observable',
  'rxjs/operator/share': 'Rx.Observable.prototype'
};

module.exports = {
  entry: '../../dist/packages-dist/core/esm5/core.js',
  dest: '../../dist/packages-dist/core/bundles/core.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/core'},
  moduleName: 'ng.core',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
