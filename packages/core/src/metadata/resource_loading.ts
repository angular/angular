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
export function resolveComponentResources(
  resourceResolver: (url: string) => Promise<string | {text(): Promise<string>; status?: number}>,
): Promise<void> {
  // Store all promises which are fetching the resources.
  const componentResolved: Promise<void>[] = [];

  // Cache so that we don't fetch the same resource more than once.
  const urlMap = new Map<string, Promise<string>>();
  function cachedResourceResolve(url: string): Promise<string> {
    let promise = urlMap.get(url);
    if (!promise) {
      const resp = resourceResolver(url);
      urlMap.set(url, (promise = resp.then((res) => unwrapResponse(url, res))));
    }
    return promise;
  }

  componentResourceResolutionQueue.forEach((component: Component, type: Type<any>) => {
    const promises: Promise<void>[] = [];
    if (component.templateUrl) {
      promises.push(
        cachedResourceResolve(component.templateUrl).then((template) => {
          component.template = template;
        }),
      );
    }
    const styles =
      typeof component.styles === 'string' ? [component.styles] : component.styles || [];
    component.styles = styles;

    if (component.styleUrl && component.styleUrls?.length) {
      throw new Error(
        '@Component cannot define both `styleUrl` and `styleUrls`. ' +
          'Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple',
      );
    } else if (component.styleUrls?.length) {
      const styleOffset = component.styles.length;
      const styleUrls = component.styleUrls;
      component.styleUrls.forEach((styleUrl, index) => {
        styles.push(''); // pre-allocate array.
        promises.push(
          cachedResourceResolve(styleUrl).then((style) => {
            styles[styleOffset + index] = style;
            styleUrls.splice(styleUrls.indexOf(styleUrl), 1);
            if (styleUrls.length == 0) {
              component.styleUrls = undefined;
            }
          }),
        );
      });
    } else if (component.styleUrl) {
      promises.push(
        cachedResourceResolve(component.styleUrl).then((style) => {
          styles.push(style);
          component.styleUrl = undefined;
        }),
      );
    }

    const fullyResolved = Promise.all(promises).then(() => componentDefResolved(type));
    componentResolved.push(fullyResolved);
  });
  clearResolutionOfComponentResourcesQueue();
  return Promise.all(componentResolved).then(() => undefined);
}

let componentResourceResolutionQueue = new Map<Type<any>, Component>();

// Track when existing ɵcmp for a Type is waiting on resources.
const componentDefPendingResolution = new Set<Type<any>>();

export function maybeQueueResolutionOfComponentResources(type: Type<any>, metadata: Component) {
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
    (component.styleUrls && component.styleUrls.length) ||
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
  queue.forEach((_, type) => componentDefPendingResolution.add(type));
  componentResourceResolutionQueue = queue;
}

export function isComponentResourceResolutionQueueEmpty() {
  return componentResourceResolutionQueue.size === 0;
}

function unwrapResponse(
  url: string,
  response: string | {text(): Promise<string>; status?: number},
): string | Promise<string> {
  if (typeof response === 'string') {
    return response;
  }
  if (response.status !== undefined && response.status !== 200) {
    return Promise.reject(
      new RuntimeError(
        RuntimeErrorCode.EXTERNAL_RESOURCE_LOADING_FAILED,
        ngDevMode && `Could not load resource: ${url}. Response status: ${response.status}`,
      ),
    );
  }
  return response.text();
}

function componentDefResolved(type: Type<any>): void {
  componentDefPendingResolution.delete(type);
}
