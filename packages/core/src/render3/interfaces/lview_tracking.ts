/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNumber} from '../../util/assert';

import {ID, LView} from './view';

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
export function getLViewById(id: number): LView|null {
  ngDevMode && assertNumber(id, 'ID used for LView lookup must be a number');
  return TRACKED_LVIEWS.get(id) || null;
}

/** Stops tracking an LView. */
export function unregisterLView(lView: LView): void {
  ngDevMode && assertNumber(lView[ID], 'Cannot stop tracking an LView that does not have an ID');
  TRACKED_LVIEWS.delete(lView[ID]);
}
