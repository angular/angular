/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
import type { Component } from './directives';
/**
 * Used to resolve resource URLs on `@Component` when used with JIT compilation.
 *
 * Example:
 * ```ts
 * @Component({
 *   selector: 'my-comp',
 *   templateUrl: 'my-comp.html', // This requires asynchronous resolution
 * })
 * class MyComponent{
 * }
 *
 * // Calling `renderComponent` will fail because `renderComponent` is a synchronous process
 * // and `MyComponent`'s `@Component.templateUrl` needs to be resolved asynchronously.
 *
 * // Calling `resolveComponentResources()` will resolve `@Component.templateUrl` into
 * // `@Component.template`, which allows `renderComponent` to proceed in a synchronous manner.
 *
 * // Use browser's `fetch()` function as the default resource resolution strategy.
 * resolveComponentResources(fetch).then(() => {
 *   // After resolution all URLs have been converted into `template` strings.
 *   renderComponent(MyComponent);
 * });
 *
 * ```
 *
 * NOTE: In AOT the resolution happens during compilation, and so there should be no need
 * to call this method outside JIT mode.
 *
 * @param resourceResolver a function which is responsible for returning a `Promise` to the
 * contents of the resolved URL. Browser's `fetch()` method is a good default implementation.
 */
export declare function resolveComponentResources(resourceResolver: (url: string) => Promise<string | {
    text(): Promise<string>;
    status?: number;
}>): Promise<void>;
export declare function maybeQueueResolutionOfComponentResources(type: Type<any>, metadata: Component): void;
export declare function isComponentDefPendingResolution(type: Type<any>): boolean;
export declare function componentNeedsResolution(component: Component): boolean;
export declare function clearResolutionOfComponentResourcesQueue(): Map<Type<any>, Component>;
export declare function restoreComponentResolutionQueue(queue: Map<Type<any>, Component>): void;
export declare function isComponentResourceResolutionQueueEmpty(): boolean;
