import {buildConfig} from './build-config';
import {rollupRemoveLicensesPlugin} from './rollup-remove-licenses';

// There are no type definitions available for these imports.
const rollup = require('rollup');
const rollupNodeResolutionPlugin = require('rollup-plugin-node-resolve');

const ROLLUP_GLOBALS = {
  // Import tslib rather than having TypeScript output its helpers multiple times.
  // See https://github.com/Microsoft/tslib
  'tslib': 'tslib',

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
  'rxjs/BehaviorSubject': 'Rx',
  'rxjs/Observable': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/Subscription': 'Rx',
  'rxjs/observable/combineLatest': 'Rx.Observable',
  'rxjs/observable/forkJoin': 'Rx.Observable',
  'rxjs/observable/fromEvent': 'Rx.Observable',
  'rxjs/observable/merge': 'Rx.Observable',
  'rxjs/observable/of': 'Rx.Observable',
  'rxjs/observable/throw': 'Rx.Observable',
  'rxjs/operator/auditTime': 'Rx.Observable.prototype',
  'rxjs/operator/catch': 'Rx.Observable.prototype',
  'rxjs/operator/debounceTime': 'Rx.Observable.prototype',
  'rxjs/operator/do': 'Rx.Observable.prototype',
  'rxjs/operator/filter': 'Rx.Observable.prototype',
  'rxjs/operator/finally': 'Rx.Observable.prototype',
  'rxjs/operator/first': 'Rx.Observable.prototype',
  'rxjs/operator/let': 'Rx.Observable.prototype',
  'rxjs/operator/map': 'Rx.Observable.prototype',
  'rxjs/operator/share': 'Rx.Observable.prototype',
  'rxjs/operator/startWith': 'Rx.Observable.prototype',
  'rxjs/operator/switchMap': 'Rx.Observable.prototype',
  'rxjs/operator/takeUntil': 'Rx.Observable.prototype',
  'rxjs/operator/toPromise': 'Rx.Observable.prototype',
};

export type BundleConfig = {
  entry: string;
  dest: string;
  format: string;
  moduleName: string;
};

/** Creates a rollup bundle of a specified JavaScript file.*/
export function createRollupBundle(config: BundleConfig): Promise<any> {
  const bundleOptions = {
    context: 'this',
    external: Object.keys(ROLLUP_GLOBALS),
    entry: config.entry,
    plugins: [rollupRemoveLicensesPlugin]
  };

  const writeOptions = {
    // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
    moduleId: '',
    moduleName: config.moduleName || 'ng.material',
    banner: buildConfig.licenseBanner,
    format: config.format,
    dest: config.dest,
    globals: ROLLUP_GLOBALS,
    sourceMap: true
  };

  // When creating a UMD, we want to exclude tslib from the `external` bundle option so that it
  // is inlined into the bundle.
  if (config.format === 'umd') {
    bundleOptions.plugins.push(rollupNodeResolutionPlugin());

    const external = Object.keys(ROLLUP_GLOBALS);
    external.splice(external.indexOf('tslib'), 1);
    bundleOptions.external = external;
  }

  return rollup.rollup(bundleOptions).then((bundle: any) => bundle.write(writeOptions));
}
