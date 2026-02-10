/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getBinding, updateBinding} from '../bindings';
import {LView} from '../interfaces/view';
import {getBindingRoot, getLView} from '../state';
import {NO_CHANGE} from '../tokens';

/**
 * Create, store and retrieve an arrow function that was defined in the template.
 *
 * @param slotOffset Offset from binding root to the reserved slot
 * @param factory Function used to create new instances of the function.
 * @param context Context that the template function is executing in.
 *
 * @codeGenApi
 */
export function ɵɵarrowFunction<T>(
  slotOffset: number,
  factory: (context: T, view: LView) => (...args: unknown[]) => unknown,
  context: T,
) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  return lView[bindingIndex] === NO_CHANGE
    ? updateBinding(lView, bindingIndex, factory(context, lView))
    : getBinding(lView, bindingIndex);
}
