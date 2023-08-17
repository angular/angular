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

/**
 * Loads the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferWhen(value: unknown) {}  // TODO: implement runtime logic.

/**
 * Prefetches the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchWhen(value: unknown) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnIdle() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetech on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnIdle() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnImmediate() {}  // TODO: implement runtime logic.


/**
 * Creates runtime data structures for the `prefetech on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnImmediate() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on timer` deferred trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export function ɵɵdeferOnTimer(delay: number) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetch on timer` deferred trigger.
 * @param delay Amount of time to wait before prefetching the content.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnTimer(delay: number) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on hover` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnHover() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetech on hover` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnHover() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on interaction` deferred trigger.
 * @param target Optional element on which to listen for hover events.
 * @codeGenApi
 */
export function ɵɵdeferOnInteraction(target?: unknown) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetch on interaction` deferred trigger.
 * @param target Optional element on which to listen for hover events.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnInteraction(target?: unknown) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on viewport` deferred trigger.
 * @param target Optional element on which to listen for hover events.
 * @codeGenApi
 */
export function ɵɵdeferOnViewport(target?: unknown) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetch on viewport` deferred trigger.
 * @param target Optional element on which to listen for hover events.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnViewport(target?: unknown) {}  // TODO: implement runtime logic.
