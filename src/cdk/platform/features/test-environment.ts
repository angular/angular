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

let testGlobals: TestGlobals;

// We check the Node-specific `global` first, because tools tend to add a fake
// `window` in Node environments which won't actually receive global variables.
if (typeof global !== 'undefined') {
  testGlobals = global as {} as TestGlobals;
} else if (typeof window !== 'undefined') {
  testGlobals = window as {} as TestGlobals;
} else {
  testGlobals = {} as TestGlobals;
}

/** Gets whether the code is currently running in a test environment. */
export function _isTestEnvironment(): boolean {
  return (
    (typeof testGlobals.__karma__ !== 'undefined' && !!testGlobals.__karma__) ||
    (typeof testGlobals.jasmine !== 'undefined' && !!testGlobals.jasmine) ||
    (typeof testGlobals.jest !== 'undefined' && !!testGlobals.jest) ||
    (typeof testGlobals.Mocha !== 'undefined' && !!testGlobals.Mocha)
  );
}
