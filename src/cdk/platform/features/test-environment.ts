/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Avoid using `declare const` because it caused conflicts inside Google
// with the real typings for these symbols. We use `declare interface` instead
// of just `interface` for interop with Closure Compiler (prevents property renaming):
// https://github.com/angular/tsickle/blob/master/README.md#differences-from-typescript
declare interface TestGlobals {
  jasmine: unknown;
  __karma__: unknown;
  jest: unknown;
  Mocha: unknown;
}

const testGlobals = (typeof window !== 'undefined' ? window : {}) as {} as TestGlobals;

/** Gets whether the code is currently running in a test environment. */
export function _isTestEnvironment(): boolean {
  return (typeof testGlobals.__karma__ !== 'undefined' && !!testGlobals.__karma__) ||
         (typeof testGlobals.jasmine !== 'undefined' && !!testGlobals.jasmine) ||
         (typeof testGlobals.jest !== 'undefined' && !!testGlobals.jest) ||
         (typeof testGlobals.Mocha !== 'undefined' && !!testGlobals.Mocha);
}
