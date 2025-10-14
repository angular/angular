/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DependencyResolverFn, TDeferDetailsFlags } from './interfaces';
import { ɵɵdeferEnableTimerScheduling } from './rendering';
/**
 * Creates runtime data structures for defer blocks.
 *
 * @param index Index of the `defer` instruction.
 * @param primaryTmplIndex Index of the template with the primary block content.
 * @param dependencyResolverFn Function that contains dependencies for this defer block.
 * @param loadingTmplIndex Index of the template with the loading block content.
 * @param placeholderTmplIndex Index of the template with the placeholder block content.
 * @param errorTmplIndex Index of the template with the error block content.
 * @param loadingConfigIndex Index in the constants array of the configuration of the loading.
 *     block.
 * @param placeholderConfigIndex Index in the constants array of the configuration of the
 *     placeholder block.
 * @param enableTimerScheduling Function that enables timer-related scheduling if `after`
 *     or `minimum` parameters are setup on the `@loading` or `@placeholder` blocks.
 * @param flags A set of flags to define a particular behavior (e.g. to indicate that
 *              hydrate triggers are present and regular triggers should be deactivated
 *              in certain scenarios).
 *
 * @codeGenApi
 */
export declare function ɵɵdefer(index: number, primaryTmplIndex: number, dependencyResolverFn?: DependencyResolverFn | null, loadingTmplIndex?: number | null, placeholderTmplIndex?: number | null, errorTmplIndex?: number | null, loadingConfigIndex?: number | null, placeholderConfigIndex?: number | null, enableTimerScheduling?: typeof ɵɵdeferEnableTimerScheduling, flags?: TDeferDetailsFlags | null): void;
/**
 * Loads defer block dependencies when a trigger value becomes truthy.
 * @codeGenApi
 */
export declare function ɵɵdeferWhen(rawValue: unknown): void;
/**
 * Prefetches the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export declare function ɵɵdeferPrefetchWhen(rawValue: unknown): void;
/**
 * Hydrates the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export declare function ɵɵdeferHydrateWhen(rawValue: unknown): void;
/**
 * Specifies that hydration never occurs.
 * @codeGenApi
 */
export declare function ɵɵdeferHydrateNever(): void;
/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferOnIdle(): void;
/**
 * Sets up logic to handle the `prefetch on idle` deferred trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferPrefetchOnIdle(): void;
/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferHydrateOnIdle(): void;
/**
 * Sets up logic to handle the `on immediate` deferred trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferOnImmediate(): void;
/**
 * Sets up logic to handle the `prefetch on immediate` deferred trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferPrefetchOnImmediate(): void;
/**
 * Sets up logic to handle the `on immediate` hydrate trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferHydrateOnImmediate(): void;
/**
 * Creates runtime data structures for the `on timer` deferred trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export declare function ɵɵdeferOnTimer(delay: number): void;
/**
 * Creates runtime data structures for the `prefetch on timer` deferred trigger.
 * @param delay Amount of time to wait before prefetching the content.
 * @codeGenApi
 */
export declare function ɵɵdeferPrefetchOnTimer(delay: number): void;
/**
 * Creates runtime data structures for the `on timer` hydrate trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export declare function ɵɵdeferHydrateOnTimer(delay: number): void;
/**
 * Creates runtime data structures for the `on hover` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferOnHover(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `prefetch on hover` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferPrefetchOnHover(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `on hover` hydrate trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferHydrateOnHover(): void;
/**
 * Creates runtime data structures for the `on interaction` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferOnInteraction(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `prefetch on interaction` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferPrefetchOnInteraction(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `on interaction` hydrate trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferHydrateOnInteraction(): void;
/**
 * Creates runtime data structures for the `on viewport` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferOnViewport(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `prefetch on viewport` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferPrefetchOnViewport(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `on viewport` hydrate trigger.
 * @codeGenApi
 */
export declare function ɵɵdeferHydrateOnViewport(): void;
