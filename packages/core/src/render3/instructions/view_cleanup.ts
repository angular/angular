/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CLEANUP, LView, TView} from '../interfaces/view';

class LCleanup extends Array {}
class TCleanup extends Array {}

export function getOrCreateLViewCleanup(view: LView): any[] {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return view[CLEANUP] || (view[CLEANUP] = ngDevMode ? new LCleanup() : []);
}

export function getOrCreateTViewCleanup(tView: TView): any[] {
  return tView.cleanup || (tView.cleanup = ngDevMode ? new TCleanup() : []);
}

/**
 * Saves context for this cleanup function in LView.cleanupInstances.
 *
 * On the first template pass, saves in TView:
 * - Cleanup function
 * - Index of context we just saved in LView.cleanupInstances
 *
 * This function can also be used to store instance specific cleanup fns. In that case the `context`
 * is `null` and the function is store in `LView` (rather than it `TView`).
 */
export function storeCleanupWithContext(
    tView: TView, lView: LView, context: any, cleanupFn: Function): void {
  const lCleanup = getOrCreateLViewCleanup(lView);
  if (context === null) {
    // If context is null that this is instance specific callback. These callbacks can only be
    // inserted after template shared instances. For this reason in ngDevMode we freeze the TView.
    if (ngDevMode) {
      Object.freeze(getOrCreateTViewCleanup(tView));
    }
    lCleanup.push(cleanupFn);
  } else {
    lCleanup.push(context);

    if (tView.firstCreatePass) {
      getOrCreateTViewCleanup(tView).push(cleanupFn, lCleanup.length - 1);
    }
  }
}
