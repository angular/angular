/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {HEADER_OFFSET, LView, TView} from '../interfaces/view';
import {getContextLView} from '../state';
import {load} from '../util/view_utils';

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
  return load<T>(contextLView, HEADER_OFFSET + index);
}
