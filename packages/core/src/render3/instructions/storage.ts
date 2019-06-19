/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {HEADER_OFFSET, TVIEW} from '../interfaces/view';
import {getContextLView, getLView} from '../state';
import {loadInternal} from '../util/view_utils';

/** Store a value in the `data` at a given `index`. */
export function store<T>(index: number, value: T): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  // We don't store any static data for local variables, so the first time
  // we see the template, we should store as null to avoid a sparse array
  const adjustedIndex = index + HEADER_OFFSET;
  if (adjustedIndex >= tView.data.length) {
    tView.data[adjustedIndex] = null;
    tView.blueprint[adjustedIndex] = null;
  }
  lView[adjustedIndex] = value;
}

/**
 * Retrieves a local reference from the current contextViewData.
 *
 * If the reference to retrieve is in a parent view, this instruction is used in conjunction
 * with a nextContext() call, which walks up the tree and updates the contextViewData instance.
 *
 * @param index The index of the local ref in contextViewData.
 *
 * @codeGenApi
 */
export function ɵɵreference<T>(index: number) {
  const contextLView = getContextLView();
  return loadInternal<T>(contextLView, index);
}

/**
 * Retrieves a value from current `viewData`.
 *
 * @codeGenApi
 */
export function ɵɵload<T>(index: number): T {
  return loadInternal<T>(getLView(), index);
}
