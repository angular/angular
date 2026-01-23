/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import type {Component} from './directives';

let componentResourceResolutionQueue = new Map<Type<any>, Component>();

// Track when existing ɵcmp for a Type is waiting on resources.
const componentDefPendingResolution = new Set<Type<any>>();

/**
 * Used to resolve resource URLs on `@Component` when used with JIT compilation.
 *
 * Example:
 * ```ts
 * @Component({
 *   selector: 'my-comp',
 *   templateUrl: 'my-comp.html', // This requires asynchronous resolution
 * })
 * class MyComponent { }
 *
 * // Calling `renderComponent` will fail because `renderComponent` is a synchronous process
 * // and `MyComponent`'s `@Component.templateUrl` needs to be resolved asynchronously.
 *
 * // Calling `resolveComponentResources()` will resolve `@Component.templateUrl` into
 * // `@Component.template`, which allows `renderComponent` to proceed in a synchronous manner.
 *
 * // Use browser's `fetch()` function as the default resource resolution strategy.
 * resolveComponentResources(fetch).then(() => {
 * // After resolution all URLs have been converted into `template` strings.
 * renderComponent(MyComponent);
 * });
 *
 * ```
 *
 * @remarks In AOT the resolution happens during compilation, and so there should be no need
 * to call this method outside JIT mode.
 *
 * @param resourceResolver a function which is responsible for returning a `Promise` to the
 * contents of the resolved URL. Browser's `fetch()` method is a good default implementation.
 */
export async function resolveComponentResources(
  resourceResolver: (url: string) => Promise<string | {text(): Promise<string>; status?: number}>,
): Promise<void> {
  const currentQueue = componentResourceResolutionQueue;
  componentResourceResolutionQueue = new Map();

  // Cache so that we don't fetch the same resource more than once.
  const urlCache = new Map<string, Promise<string>>();

  // Helper to dedupe resource fetches
  function cachedResourceResolve(url: string): Promise<string> {
    const promiseCached = urlCache.get(url);
    if (promiseCached) {
      return promiseCached;
    }

    const promise = resourceResolver(url).then((response) => unwrapResponse(url, response));
    urlCache.set(url, promise);

    return promise;
  }

  const resolutionPromises = Array.from(currentQueue).map(async ([type, component]) => {
    if (component.styleUrl && component.styleUrls?.length) {
      throw new Error(
        '@Component cannot define both `styleUrl` and `styleUrls`. ' +
          'Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple',
      );
    }

    const componentTasks: Promise<void>[] = [];

    if (component.templateUrl) {
      componentTasks.push(
        cachedResourceResolve(component.templateUrl).then((template) => {
          component.template = template;
        }),
      );
    }

    const styles =
      typeof component.styles === 'string' ? [component.styles] : (component.styles ?? []);
    component.styles = styles;

    let {styleUrl, styleUrls} = component;
    if (styleUrl) {
      styleUrls = [styleUrl];
      component.styleUrl = undefined;
    }

    if (styleUrls?.length) {
      const allFetched = Promise.all(styleUrls.map((url) => cachedResourceResolve(url))).then(
        (fetchedStyles) => {
          styles.push(...fetchedStyles);
          component.styleUrls = undefined;
        },
      );

      componentTasks.push(allFetched);
    }

    await Promise.all(componentTasks);
    componentDefPendingResolution.delete(type);
  });

  await Promise.all(resolutionPromises);
}

export function maybeQueueResolutionOfComponentResources(
  type: Type<any>,
  metadata: Component,
): void {
  if (componentNeedsResolution(metadata)) {
    componentResourceResolutionQueue.set(type, metadata);
    componentDefPendingResolution.add(type);
  }
}

export function isComponentDefPendingResolution(type: Type<any>): boolean {
  return componentDefPendingResolution.has(type);
}

export function componentNeedsResolution(component: Component): boolean {
  return !!(
    (component.templateUrl && !component.hasOwnProperty('template')) ||
    component.styleUrls?.length ||
    component.styleUrl
  );
}

export function clearResolutionOfComponentResourcesQueue(): Map<Type<any>, Component> {
  const old = componentResourceResolutionQueue;
  componentResourceResolutionQueue = new Map();
  return old;
}

export function restoreComponentResolutionQueue(queue: Map<Type<any>, Component>): void {
  componentDefPendingResolution.clear();
  for (const type of queue.keys()) {
    componentDefPendingResolution.add(type);
  }
  componentResourceResolutionQueue = queue;
}

export function isComponentResourceResolutionQueueEmpty(): boolean {
  return componentResourceResolutionQueue.size === 0;
}

async function unwrapResponse(
  url: string,
  response: string | {text(): Promise<string>; status?: number},
): Promise<string> {
  if (typeof response === 'string') {
    return response;
  }

  if (response.status !== undefined && response.status !== 200) {
    throw new RuntimeError(
      RuntimeErrorCode.EXTERNAL_RESOURCE_LOADING_FAILED,
      ngDevMode && `Could not load resource: ${url}. Response status: ${response.status}`,
    );
  }

  return response.text();
}
