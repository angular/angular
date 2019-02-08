/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Component } from './directives';


/**
 * Used to resolve resource URLs on `@Component` when used with JIT compilation.
 *
 * Example:
 * ```
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
  resourceResolver: (url: string) => (Promise<string | { text(): Promise<string> }>)): Promise<null> {
  // Store all promises which are fetching the resources.
  const urlFetches: Promise<string>[] = [];

  // Cache so that we don't fetch the same resource more than once.
  const urlMap = new Map<string, Promise<string>>();
  function cachedResourceResolve(url: string): Promise<string> {
    let promise = urlMap.get(url);
    if (!promise) {
      const resp = resourceResolver(url);
      urlMap.set(url, promise = resp.then(unwrapResponse));
      urlFetches.push(promise);
    }
    return promise;
  }

  componentResourceResolutionQueue.forEach((component: Component) => {
    if (component.templateUrl) {
      cachedResourceResolve(component.templateUrl).then((template) => {
        component.template = template;
        component.templateUrl = undefined;
      });
    }
    const styleUrls = component.styleUrls;
    const styles = component.styles || (component.styles = []);
    const styleOffset = component.styles.length;
    styleUrls && styleUrls.forEach((styleUrl, index) => {
      styles.push('');  // pre-allocate array.
      cachedResourceResolve(styleUrl).then((style) => {
        styles[styleOffset + index] = style;
        styleUrls.splice(styleUrls.indexOf(styleUrl), 1);
        if (styleUrls.length == 0) {
          component.styleUrls = undefined;
        }
      });
    });
  });
  clearResolutionOfComponentResourcesQueue();
  return Promise.all(urlFetches).then(() => null);
}

const componentResourceResolutionQueue: Set<Component> = new Set();

export function maybeQueueResolutionOfComponentResources(metadata: Component) {
  if (componentNeedsResolution(metadata)) {
    componentResourceResolutionQueue.add(metadata);
  }
}

export function componentNeedsResolution(component: Component): boolean {
  return !!(component.templateUrl || component.styleUrls && component.styleUrls.length);
}
export function clearResolutionOfComponentResourcesQueue() {
  componentResourceResolutionQueue.clear();
}

function unwrapResponse(response: string | { text(): Promise<string> }): string | Promise<string> {
  return typeof response == 'string' ? response : response.text();
}
