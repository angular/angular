/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertNumber} from '../../util/assert';

import {CONTAINER_HEADER_OFFSET} from './container';
import {isLView} from './type_checks';
import {CHILD_HEAD, ID, LView, NEXT} from './view';

// Keeps track of the currently-active LViews.
const TRACKED_LVIEWS = new Map<number, LView>();

// Used for generating unique IDs for LViews.
let uniqueIdCounter = 0;

/** Gets a unique ID that can be assigned to an LView. */
export function getUniqueLViewId(): number {
  return uniqueIdCounter++;
}

/** Starts tracking an LView. */
export function registerLView(lView: LView): void {
  ngDevMode && assertNumber(lView[ID], 'LView must have an ID in order to be registered');
  TRACKED_LVIEWS.set(lView[ID], lView);
}

/** Gets an LView by its unique ID. */
export function getLViewById(id: number): LView | null {
  ngDevMode && assertNumber(id, 'ID used for LView lookup must be a number');
  return TRACKED_LVIEWS.get(id) || null;
}

/** Stops tracking an LView. */
export function unregisterLView(lView: LView): void {
  ngDevMode && assertNumber(lView[ID], 'Cannot stop tracking an LView that does not have an ID');
  TRACKED_LVIEWS.delete(lView[ID]);
}

/**
 * Stops tracking an LView and all of the LViews nested inside of it. Used when the creation of a
 * view fails, because nothing is left to destroy the views that were created up to that point.
 */
export function unregisterLViewTree(lView: LView): void {
  unregisterLView(lView);

  for (let child = lView[CHILD_HEAD]; child !== null; child = child[NEXT]) {
    if (isLView(child)) {
      unregisterLViewTree(child);
    } else {
      for (let i = CONTAINER_HEADER_OFFSET; i < child.length; i++) {
        unregisterLViewTree(child[i]);
      }
    }
  }
}

/** Gets the currently-tracked views. */
export function getTrackedLViews(): ReadonlyMap<number, LView> {
  return TRACKED_LVIEWS;
}
