/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertNumber} from '../../util/assert';

import {ID, LView, TVIEW, TView} from './view';

// Keeps track of the currently-active LViews.
const TRACKED_LVIEWS = new Map<number, LView>();

// Unlike discovery tracking, HMR needs views without debug data, including detached views.
let hmrLViews: WeakMap<TView, Set<WeakRef<LView>>> | undefined;
let hmrViewFinalizer:
  | FinalizationRegistry<{
      views: Set<WeakRef<LView>>;
      reference: WeakRef<LView>;
    }>
  | undefined;

export function trackHmrLView(lView: LView): void {
  const tView = lView[TVIEW];
  hmrLViews ??= new WeakMap();
  let views = hmrLViews.get(tView);
  if (views === undefined) {
    views = new Set();
    hmrLViews.set(tView, views);
  }
  const reference = new WeakRef(lView);
  views.add(reference);
  hmrViewFinalizer ??= new FinalizationRegistry(({views, reference}) => views.delete(reference));
  hmrViewFinalizer.register(lView, {views, reference});
}

export function* getHmrLViews(tView: TView): Iterable<LView> {
  for (const reference of hmrLViews?.get(tView) ?? []) {
    const view = reference.deref();
    if (view !== undefined) {
      yield view;
    }
  }
}

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

/** Gets the currently-tracked views. */
export function getTrackedLViews(): ReadonlyMap<number, LView> {
  return TRACKED_LVIEWS;
}
