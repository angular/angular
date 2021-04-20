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

/** Starts tracking an LView and returns a unique ID that can be used for future lookups. */
export function registerLView(lView: LView): number {
  const id = uniqueIdCounter++;
  TRACKED_LVIEWS.set(id, lView);
  return id;
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
