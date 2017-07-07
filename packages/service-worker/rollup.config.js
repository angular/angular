/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';

const globals = {
  '@angular/core': 'ng.core',
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',
};

export default {
  entry: '../../dist/packages-dist/service-worker/@angular/service-worker.es5.js',
  dest: '../../dist/packages-dist/service-worker/bundles/service-worker.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.serviceWorker',
  plugins: [resolve(), commonJs()],
  external: Object.keys(globals),
  globals: globals
};
