/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Gets whether the code is currently running in a test environment. */
export function _isTestEnvironment(): boolean {
  // We can't use `declare const` because it causes conflicts inside Google with the real typings
  // for these symbols and we can't read them off the global object, because they don't appear to
  // be attached there for some runners like Jest.
  // (see: https://github.com/angular/components/issues/23365#issuecomment-938146643)
  return (
    // @ts-ignore
    (typeof __karma__ !== 'undefined' && !!__karma__) ||
    // @ts-ignore
    (typeof jasmine !== 'undefined' && !!jasmine) ||
    // @ts-ignore
    (typeof jest !== 'undefined' && !!jest) ||
    // @ts-ignore
    (typeof Mocha !== 'undefined' && !!Mocha)
  );
}
