/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Patch a `debug` property on top of the existing object.
 *
 * NOTE: always call this method with `ngDevMode && attachDebugObject(...)`
 *
 * @param obj Object to patch
 * @param debug Value to patch
 */
export function attachDebugObject(obj: any, debug: any): void {
  if (ngDevMode) {
    Object.defineProperty(obj, 'debug', {value: debug, enumerable: false});
  } else {
    throw new Error(
        'This method should be guarded with `ngDevMode` so that it can be tree shaken in production!');
  }
}

/**
 * Patch a `debug` property getter on top of the existing object.
 *
 * NOTE: always call this method with `ngDevMode && attachDebugObject(...)`
 *
 * @param obj Object to patch
 * @param debugGetter Getter returning a value to patch
 */
export function attachDebugGetter<T>(obj: T, debugGetter: (this: T) => any): void {
  if (ngDevMode) {
    Object.defineProperty(obj, 'debug', {get: debugGetter, enumerable: false});
  } else {
    throw new Error(
        'This method should be guarded with `ngDevMode` so that it can be tree shaken in production!');
  }
}
