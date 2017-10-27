/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const sourcemaps = require('rollup-plugin-sourcemaps');

exports.default = {
  plugins: [sourcemaps()]
};


/**
 *                  .--.         ______________
 *  {\             / q {\      / globalGlobal /
 *  { `\           \ (-(~`   <_______________/
 * { '.{`\          \ \ )
 * {'-{ ' \  .-""'-. \ \
 * {._{'.' \/       '.) \
 * {_.{.   {`            |
 * {._{ ' {   ;'-=-.     |
 *  {-.{.' {  ';-=-.`    /
 *   {._.{.;    '-=-   .'
 *    {_.-' `'.__  _,-'
 *             |||`
 *            .='==,
 */
const globalGlobal = {
  '@angular/animations': 'ng.animations',
  '@angular/animations/browser': 'ng.animations.browser',
  '@angular/animations/browser/testing': 'ng.animations.browser.testing',
  '@angular/common': 'ng.common',
  '@angular/common/http': 'ng.common.http',
  '@angular/common/testing': 'ng.common.testing',
  '@angular/compiler': 'ng.compiler',
  '@angular/compiler/testing': 'ng.compiler.testing',
  '@angular/core': 'ng.core',
  '@angular/core/testing': 'ng.core.testing',
  '@angular/http': 'ng.http',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
  '@angular/platform-browser/testing': 'ng.platformBrowser.testing',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  '@angular/platform-browser-dynamic/testing': 'ng.platformBrowserDynamic.testing',
  '@angular/platform-server': 'ng.platformServer',
  '@angular/router': 'ng.router',
  '@angular/service-worker': 'ng.serviceWorker',
  '@angular/service-worker/config': 'ng.serviceWorker.config',
  '@angular/upgrade': 'ng.upgrade',
  '@angular/upgrade/static': 'ng.upgrade.static',
  'fs': 'fs',
  'path': 'path',
  'rxjs/BehaviorSubject': 'Rx',
  'rxjs/ConnectableObservable': 'Rx',
  'rxjs/Observable': 'Rx',
  'rxjs/Observer': 'Rx',
  'rxjs/ReplaySubject': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/Subscription': 'Rx',
  'rxjs/observable/ConnectableObservable': 'Rx',
  'rxjs/observable/PromiseObservable': 'Rx',  // this is wrong, but this stuff has changed in rxjs
                                              // b.6 so we need to fix it when we update.
  'rxjs/observable/concat': 'Rx.Observable',
  'rxjs/observable/defer': 'Rx.Observable',
  'rxjs/observable/forkJoin': 'Rx.Observable',
  'rxjs/observable/from': 'Rx.Observable',
  'rxjs/observable/fromEvent': 'Rx.Observable',
  'rxjs/observable/fromPromise': 'Rx.Observable',
  'rxjs/observable/merge': 'Rx.Observable',
  'rxjs/observable/of': 'Rx.Observable',
  'rxjs/observable/throw': 'Rx.Observable',
  'rxjs/operator/catch': 'Rx.Observable.prototype',
  'rxjs/operator/concatAll': 'Rx.Observable.prototype',
  'rxjs/operator/concatMap': 'Rx.Observable.prototype',
  'rxjs/operator/do': 'Rx.Observable.prototype',
  'rxjs/operator/every': 'Rx.Observable.prototype',
  'rxjs/operator/filter': 'Rx.Observable.prototype',
  'rxjs/operator/first': 'Rx.Observable.prototype',
  'rxjs/operator/last': 'Rx.Observable.prototype',
  'rxjs/operator/map': 'Rx.Observable.prototype',
  'rxjs/operator/mergeAll': 'Rx.Observable.prototype',
  'rxjs/operator/mergeMap': 'Rx.Observable.prototype',
  'rxjs/operator/publish': 'Rx.Observable.prototype',
  'rxjs/operator/reduce': 'Rx.Observable.prototype',
  'rxjs/operator/share': 'Rx.Observable.prototype',
  'rxjs/operator/startWith': 'Rx.Observable.prototype',
  'rxjs/operator/switchMap': 'Rx.Observable.prototype',
  'rxjs/operator/take': 'Rx.Observable.prototype',
  'rxjs/operator/toPromise': 'Rx.Observable.prototype',
  'rxjs/util/EmptyError': 'Rx',
  'typescript': 'ts',
};


exports.globals = function(blacklist) {
  if (typeof blacklist == 'string') {
    blacklist = [blacklist];
  }

  const globalCopy = Object.assign({}, globalGlobal);
  blacklist.forEach(x => { delete globalCopy[x]; });
  return globalCopy;
};
