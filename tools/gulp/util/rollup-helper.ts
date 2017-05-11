import {LICENSE_BANNER} from '../constants';

// There are no type definitions available for these imports.
const rollup = require('rollup');

const ROLLUP_GLOBALS = {
  // Angular dependencies
  '@angular/animations': 'ng.animations',
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/forms': 'ng.forms',
  '@angular/http': 'ng.http',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',

  // Local Angular packages inside of Material.
  '@angular/material': 'ng.material',
  '@angular/cdk': 'ng.cdk',

  // Rxjs dependencies
  'rxjs/Subject': 'Rx',
  'rxjs/add/observable/fromEvent': 'Rx.Observable',
  'rxjs/add/observable/forkJoin': 'Rx.Observable',
  'rxjs/add/observable/of': 'Rx.Observable',
  'rxjs/add/observable/merge': 'Rx.Observable',
  'rxjs/add/observable/throw': 'Rx.Observable',
  'rxjs/add/operator/auditTime': 'Rx.Observable.prototype',
  'rxjs/add/operator/toPromise': 'Rx.Observable.prototype',
  'rxjs/add/operator/map': 'Rx.Observable.prototype',
  'rxjs/add/operator/filter': 'Rx.Observable.prototype',
  'rxjs/add/operator/do': 'Rx.Observable.prototype',
  'rxjs/add/operator/share': 'Rx.Observable.prototype',
  'rxjs/add/operator/finally': 'Rx.Observable.prototype',
  'rxjs/add/operator/catch': 'Rx.Observable.prototype',
  'rxjs/add/operator/first': 'Rx.Observable.prototype',
  'rxjs/add/operator/startWith': 'Rx.Observable.prototype',
  'rxjs/add/operator/switchMap': 'Rx.Observable.prototype',
  'rxjs/add/operator/debounceTime': 'Rx.Observable.prototype',
  'rxjs/Observable': 'Rx',
  'rxjs/Subscription': 'Rx',
};

export type BundleConfig = {
  entry: string;
  dest: string;
  format: string;
  moduleName: string;
};

/** Creates a rollup bundles of the Material components.*/
export function createRollupBundle(config: BundleConfig): Promise<any> {
  let bundleOptions = {
    context: 'this',
    external: Object.keys(ROLLUP_GLOBALS),
    entry: config.entry
  };

  let writeOptions = {
    // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
    moduleId: '',
    moduleName: config.moduleName || 'ng.material',
    banner: LICENSE_BANNER,
    format: config.format,
    dest: config.dest,
    globals: ROLLUP_GLOBALS,
    sourceMap: true
  };

  return rollup.rollup(bundleOptions).then((bundle: any) => bundle.write(writeOptions));
}
