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

  'rxjs/BehaviorSubject': 'Rx',
  'rxjs/ConnectableObservable': 'Rx',
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',

  'rxjs/observable/concat': 'Rx.Observable',
  'rxjs/observable/defer': 'Rx.Observable',
  'rxjs/observable/fromEvent': 'Rx.Observable',
  'rxjs/observable/merge': 'Rx.Observable',
  'rxjs/observable/of': 'Rx.Observable',
  'rxjs/observable/throw': 'Rx.Observable',

  'rxjs/operator/do': 'Rx.Observable.prototype',
  'rxjs/operator/filter': 'Rx.Observable.prototype',
  'rxjs/operator/map': 'Rx.Observable.prototype',
  'rxjs/operator/publish': 'Rx.Observable.prototype',
  'rxjs/operator/startWith': 'Rx.Observable.prototype',
  'rxjs/operator/switchMap': 'Rx.Observable.prototype',
  'rxjs/operator/take': 'Rx.Observable.prototype',
  'rxjs/operator/toPromise': 'Rx.Observable.prototype',
};

export default {
  entry: '../../dist/packages-dist/service-worker/esm5/service-worker.js',
  dest: '../../dist/packages-dist/service-worker/bundles/service-worker.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.serviceWorker',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
