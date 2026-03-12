/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NotificationSource} from '../../change_detection/scheduling/zoneless_scheduling';
import {isRootView} from '../interfaces/type_checks';
import {ENVIRONMENT, FLAGS, LView, LViewFlags} from '../interfaces/view';
import {isRefreshingViews} from '../state';
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
 * @returns the root LView
 */
export function markViewDirty(lView: LView, source: NotificationSource): LView | null {
  const dirtyBitsToUse = isRefreshingViews()
    ? // When we are actively refreshing views, we only use the `Dirty` bit to mark a view
      // for check. This bit is ignored in ChangeDetectionMode.Targeted, which is used to
      // synchronously rerun change detection on a specific set of views (those which have
      // the `RefreshView` flag and those with dirty signal consumers). `LViewFlags.Dirty`
      // does not support re-entrant change detection on its own.
      LViewFlags.Dirty
    : // When we are not actively refreshing a view tree, it is absolutely
      // valid to update state and mark views dirty. We use the `RefreshView` flag in this
      // case to allow synchronously rerunning change detection. This applies today to
      // afterRender hooks as well as animation listeners which execute after detecting
      // changes in a view when the render factory flushes.
      LViewFlags.RefreshView | LViewFlags.Dirty;
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(source);
  while (lView) {
    lView[FLAGS] |= dirtyBitsToUse;
    const parent = getLViewParent(lView);
    // Stop traversing up as soon as you find a root view that wasn't attached to any container
    if (isRootView(lView) && !parent) {
      return lView;
    }
    // continue otherwise
    lView = parent!;
  }
  return null;
}
