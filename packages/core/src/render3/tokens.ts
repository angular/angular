/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface NO_CHANGE {
  // This is a brand that ensures that this type can never match anything else
  __brand__: 'NO_CHANGE';
}

/** A special value which designates that a value has not changed. */
export const NO_CHANGE: NO_CHANGE =
  typeof ngDevMode === 'undefined' || ngDevMode ? {__brand__: 'NO_CHANGE'} : ({} as NO_CHANGE);
