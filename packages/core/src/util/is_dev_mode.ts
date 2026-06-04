/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {global} from './global';

/**
 * Returns whether Angular is in development mode.
 *
 * By default, this is true, unless `enableProdMode` is invoked prior to calling this method or the
 * application is built using the Angular CLI with the `optimization` option.
 * @see {@link /cli/build ng build}
 *
 * @publicApi
 */
export function isDevMode(): boolean {
  return typeof ngDevMode === 'undefined' || !!ngDevMode;
}

/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 * Using this method is discouraged as the Angular CLI will set production mode when using the
 * `optimization` option.
 * @see {@link /cli/build ng build}
 *
 * @publicApi
 */
export function enableProdMode(): void {
  // The below check is there so when ngDevMode is set via terser
  // `global['ngDevMode'] = false;` is also dropped.
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    global['ngDevMode'] = false;
  }
}

/**
 *
 * This is a global function that can be used to allow JIT compilation in production mode.
 *
 * IMPORTANT: Using the JIT compiler is a potential XSS vector attack surface.
 * Only use this function if you have a very specific use case and understand the security implications.
 *
 * @publicApi
 */
export function dangerousAllowJitInProduction() {
  global['dangerousAllowJitInProduction'] = true;
}
