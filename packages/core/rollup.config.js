/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';

const globals = {
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/Observer': 'Rx',
  'rxjs/Subscription': 'Rx',
  'rxjs/observable/merge': 'Rx.Observable',
  'rxjs/operator/share': 'Rx.Observable.prototype'
};

export default {
  entry: '../../dist/packages-dist/core/@angular/core.es5.js',
  dest: '../../dist/packages-dist/core/bundles/core.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.core',
  plugins: [resolve()],
  external: Object.keys(globals),
  globals: globals
};
