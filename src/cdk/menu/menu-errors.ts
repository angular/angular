/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Throws an exception when an instance of the PointerFocusTracker is not provided.
 * @docs-private
 */
export function throwMissingPointerFocusTracker() {
  throw Error('expected an instance of PointerFocusTracker to be provided');
}

/**
 * Throws an exception when a reference to the parent menu is not provided.
 * @docs-private
 */
export function throwMissingMenuReference() {
  throw Error('expected a reference to the parent menu');
}
