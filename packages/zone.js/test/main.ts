/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="systemjs" />

declare const __karma__: {
  loaded: Function;
  start: Function;
  error: Function;
};

__karma__.loaded = function () {};

let entryPoint = 'browser_entry_point';

if (typeof __karma__ !== 'undefined') {
  (window as any)['__Zone_Error_ZoneJsInternalStackFrames_policy'] = (
    __karma__ as any
  ).config.errorpolicy;
  if ((__karma__ as any).config.entrypoint) {
    entryPoint = (__karma__ as any).config.entrypoint;
  }
} else if (typeof process !== 'undefined') {
  (window as any)['__Zone_Error_ZoneJsInternalStackFrames_policy'] = process.env['errorpolicy'];
  if (process.env['entrypoint']) {
    entryPoint = process.env['entrypoint'];
  }
}

(window as any).global = window;
System.config({
  defaultJSExtensions: true,
  map: {
    'rxjs': 'base/angular/node_modules/rxjs/index',
    'rxjs/operators': 'base/angular/node_modules/rxjs/operators/index',
    'core-js/features/set': 'base/angular/node_modules/core-js/es6/set',
    'core-js/features/map': 'base/angular/node_modules/core-js/es6/map',
    'es6-promise': 'base/angular/node_modules/es6-promise/dist/es6-promise',
  },
});

let browserPatchedPromise: any = null;
if ((window as any)[(Zone as any).__symbol__('setTimeout')]) {
  browserPatchedPromise = Promise.resolve('browserPatched');
} else {
  // this means that Zone has not patched the browser yet, which means we must be running in
  // build mode and need to load the browser patch.
  browserPatchedPromise = System.import(
    '/base/angular/packages/zone.js/test/browser-zone-setup',
  ).then(() => {
    let testFrameworkPatch =
      typeof (window as any).Mocha !== 'undefined'
        ? '/base/angular/packages/zone.js/lib/mocha/mocha'
        : '/base/angular/packages/zone.js/lib/jasmine/jasmine';
    return System.import(testFrameworkPatch);
  });
}

browserPatchedPromise.then(() => {
  let testFrameworkPatch =
    typeof (window as any).Mocha !== 'undefined'
      ? '/base/angular/packages/zone.js/test/test-env-setup-mocha'
      : '/base/angular/packages/zone.js/test/test-env-setup-jasmine';
  // Setup test environment
  System.import(testFrameworkPatch).then(() => {
    System.import('/base/angular/packages/zone.js/lib/common/error-rewrite').then(() => {
      System.import(`/base/angular/packages/zone.js/test/${entryPoint}`).then(
        () => {
          __karma__.start();
        },
        (error: any) => {
          console.error(error.stack || error);
        },
      );
    });
  });
});
