/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NormalizedUrl} from './api';
import {NamedCacheStorage} from './named-cache-storage';


/**
 * Adapts the service worker to its runtime environment.
 *
 * Mostly, this is used to mock out identifiers which are otherwise read
 * from the global scope.
 */
export class Adapter<T extends CacheStorage = CacheStorage> {
  readonly caches: NamedCacheStorage<T>;
  readonly origin: string;

  constructor(protected readonly scopeUrl: string, caches: T) {
    const parsedScopeUrl = this.parseUrl(this.scopeUrl);

    // Determine the origin from the registration scope. This is used to differentiate between
    // relative and absolute URLs.
    this.origin = parsedScopeUrl.origin;

    // Use the baseHref in the cache name prefix to avoid clash of cache names for SWs with
    // different scopes on the same domain.
    this.caches = new NamedCacheStorage(caches, `ngsw:${parsedScopeUrl.path}`);
  }

  /**
   * Wrapper around the `Request` constructor.
   */
  newRequest(input: string|Request, init?: RequestInit): Request {
    return new Request(input, init);
  }

  /**
   * Wrapper around the `Response` constructor.
   */
  newResponse(body: any, init?: ResponseInit) {
    return new Response(body, init);
  }

  /**
   * Wrapper around the `Headers` constructor.
   */
  newHeaders(headers: {[name: string]: string}): Headers {
    return new Headers(headers);
  }

  /**
   * Test if a given object is an instance of `Client`.
   */
  isClient(source: any): source is Client {
    return (source instanceof Client);
  }

  /**
   * Read the current UNIX time in milliseconds.
   */
  get time(): number {
    return Date.now();
  }

  /**
   * Get a normalized representation of a URL such as those found in the ServiceWorker's `ngsw.json`
   * configuration.
   *
   * More specifically:
   * 1. Resolve the URL relative to the ServiceWorker's scope.
   * 2. If the URL is relative to the ServiceWorker's own origin, then only return the path part.
   *    Otherwise, return the full URL.
   *
   * @param url The raw request URL.
   * @return A normalized representation of the URL.
   */
  normalizeUrl(url: string): NormalizedUrl {
    // Check the URL's origin against the ServiceWorker's.
    const parsed = this.parseUrl(url, this.scopeUrl);
    return (parsed.origin === this.origin ? parsed.path : url) as NormalizedUrl;
  }

  /**
   * Parse a URL into its different parts, such as `origin`, `path` and `search`.
   */
  parseUrl(url: string, relativeTo?: string): {origin: string, path: string, search: string} {
    // Workaround a Safari bug, see
    // https://github.com/angular/angular/issues/31061#issuecomment-503637978
    const parsed = !relativeTo ? new URL(url) : new URL(url, relativeTo);
    return {origin: parsed.origin, path: parsed.pathname, search: parsed.search};
  }

  /**
   * Wait for a given amount of time before completing a Promise.
   */
  timeout(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms);
    });
  }
}
