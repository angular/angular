/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isRootView} from '../interfaces/type_checks';
import {ENVIRONMENT, FLAGS, LView, LViewFlags} from '../interfaces/view';
import {getLViewParent} from '../util/view_utils';

/**
 * Marks current view and all ancestors dirty.
 *
 * Returns the root view because it is found as a byproduct of marking the view tree
 * dirty, and can be used by methods that consume markViewDirty() to easily schedule
 * change detection. Otherwise, such methods would need to traverse up the view tree
 * an additional time to get the root view and schedule a tick on it.
 *
 * @param lView The starting LView to mark dirty
 */
export function markViewDirty(lView: LView) {
  lView[ENVIRONMENT].changeDetectionScheduler?.notify();
  while (lView) {
    // If we're already refreshing the view, we should not mark it or ancestors dirty.
    // This is `ExpressionHasChangedAfterItWasCheckedError` if any bindings have actually changed
    // and completely unnecessary to refresh views again if there weren't any updated bindings.
    if (lView[FLAGS] & LViewFlags.ExecutingRefresh) {
      return;
    }
    lView[FLAGS] |= LViewFlags.Dirty;
    const parent = getLViewParent(lView);
    // Stop traversing up as soon as you find a root view that wasn't attached to any container
    if (isRootView(lView) && !parent) {
      return;
    }
    // continue otherwise
    lView = parent!;
  }
}
