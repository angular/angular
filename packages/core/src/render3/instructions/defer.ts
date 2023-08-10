/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';

export type DeferredDepsFn = () => Array<Promise<Type<unknown>>|Type<unknown>>;

/** Configuration object for a `{:loading}` block as it is stored in the component constants. */
type DeferredLoadingConfig = [minimumTime: number|null, afterTime: number|null];

/** Configuration object for a `{:placeholder}` block as it is stored in the component constants. */
type DeferredPlaceholderConfig = [afterTime: number|null];

/**
 * Creates runtime data structures for `{#defer}` blocks.
 *
 * @param deferIndex Index of the underlying deferred block data structure.
 * @param primaryTemplateIndex Index of the template function with the block's content.
 * @param deferredDepsFn Function that contains dependencies for this defer block
 * @param loadingIndex Index of the template with the `{:loading}` block content.
 * @param placeholderIndex Index of the template with the `{:placeholder}` block content.
 * @param error Index of the template with the `{:error}` block content.
 * @param loadingConfigIndex Index in the constants array of the configuration of the `{:loading}`
 *     block.
 * @param placeholderConfigIndexIndex in the constants array of the configuration of the
 *     `{:placeholder}` block.
 *
 * @codeGenApi
 */
export function ɵɵdefer(
    deferIndex: number,
    primaryTemplateIndex: number,
    deferredDepsFn?: DeferredDepsFn|null,
    loadingIndex?: number|null,
    placeholderIndex?: number|null,
    errorIndex?: number|null,
    loadingConfigIndex?: number|null,
    placeholderConfigIndex?: number|null,
) {}  // TODO: implement runtime logic.
