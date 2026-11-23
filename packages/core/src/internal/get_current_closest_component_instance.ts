/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isRootView} from '../render3/interfaces/type_checks';
import {CONTEXT, LView, TVIEW, TViewType} from '../render3/interfaces/view';
import {getLView} from '../render3/state';
import {getLViewParent} from '../render3/util/view_utils';

/**
 * Starts a traversal from the current view, going upwards in the hierarchy until a component
 * instance matches the specified predicate function. Returns the matching component instance.
 * @param predicate Function that decides if the component instance matches the criteria.
 */
export function getCurrentClosestComponentInstance<T>(
  predicate: (value: unknown) => value is T,
): T | null {
  let lView = getLView() as LView | null;

  while (lView) {
    if (lView[TVIEW].type === TViewType.Component && predicate(lView[CONTEXT])) {
      return lView[CONTEXT];
    }

    if (isRootView(lView)) {
      break;
    } else {
      lView = getLViewParent(lView);
    }
  }

  return null;
}
