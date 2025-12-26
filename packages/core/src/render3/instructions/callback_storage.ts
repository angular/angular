/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertFunction, assertNotDefined} from '../../util/assert';
import {HEADER_OFFSET} from '../interfaces/view';
import {getContextLView, getLView, getTView} from '../state';
import {load, store} from '../util/view_utils';

/**
 * Creation instruction that stores a callback function so it can be reused later.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param declaration Function to be stored.
 * @returns Itself for chaining purposes.
 *
 * @codeGenApi
 */
export function ɵɵstoreCallback(index: number, declaration: Function): typeof ɵɵstoreCallback {
  const tView = getTView();
  const lView = getLView();
  const adjustedIndex = index + HEADER_OFFSET;
  ngDevMode &&
    assertNotDefined(lView[adjustedIndex], 'Expected callback not to have been initialized.');
  store(tView, lView, adjustedIndex, declaration);
  return ɵɵstoreCallback;
}

/**
 * Retrieves a callback stored by `ɵɵstoreCallback`.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 *
 * @codeGenApi
 */
export function ɵɵgetCallback(index: number): Function {
  const contextLView = getContextLView();
  const value = load<Function>(contextLView, HEADER_OFFSET + index);
  ngDevMode && assertFunction(value, 'Expected stored callback to be a function.');
  return value;
}
