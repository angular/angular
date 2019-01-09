/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {executeHooks} from '../hooks';
import {BINDING_INDEX, FLAGS, LView, LViewFlags, TVIEW} from '../interfaces/view';
import {enterView, getCheckNoChangesMode, getLView, isCreationMode} from '../state/state';


/**
 * Used in lieu of enterView to make it clear when we are exiting a child view. This makes
 * the direction of traversal (up or down the view tree) a bit clearer.
 *
 * @param newView New state to become active
 */
export function leaveView(newView: LView): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  if (isCreationMode(lView)) {
    lView[FLAGS] &= ~LViewFlags.CreationMode;
  } else {
    const checkNoChangesMode = getCheckNoChangesMode();
    executeHooks(lView, tView.viewHooks, tView.viewCheckHooks, checkNoChangesMode);
    // Views are clean and in update mode after being checked, so these bits are cleared
    lView[FLAGS] &= ~(LViewFlags.Dirty | LViewFlags.FirstLViewPass);
    lView[FLAGS] |= LViewFlags.RunInit;
    lView[BINDING_INDEX] = tView.bindingStartIndex;
  }
  enterView(newView, null);
}
