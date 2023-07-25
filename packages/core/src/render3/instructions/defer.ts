/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';

export type DeferredDepsFn = () => Array<Promise<Type<unknown>>|Type<unknown>>;

/**
 * Creates runtime data structures for `{#defer}` blocks.
 *
 * @param index The index of the defer block in the data array
 * @param deferredDepsFn Function that contains dependencies for this defer block
 *
 * @codeGenApi
 */
export function ɵɵdefer(index: number, deferredDepsFn: DeferredDepsFn|null) {
  // TODO: implement runtime logic.
}
