/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Adapts the service worker to its runtime environment.
 *
 * Mostly, this is used to mock out identifiers which are otherwise read
 * from the global scope.
 */
export class Adapter {
  readonly cacheNamePrefix: string;
  readonly scopeUrl: string;
  readonly origin: string;

  constructor(scope: ServiceWorkerGlobalScope) {
    // Suffixing `ngsw` with the baseHref to avoid clash of cache names
    // for SWs with different scopes on the same domain.
    const baseHref = this.parseUrl(scope.registration.scope).path;
    this.cacheNamePrefix = 'ngsw:' + baseHref;

    this.scopeUrl = scope.registration.scope;
    // Determine the origin from the registration scope. This is used to differentiate between
    // relative and absolute URLs.
    this.origin = this.parseUrl(this.scopeUrl, this.scopeUrl).origin;
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
  newResponse(body: any, init?: ResponseInit) { return new Response(body, init); }

  /**
   * Wrapper around the `Headers` constructor.
   */
  newHeaders(headers: {[name: string]: string}): Headers { return new Headers(headers); }

  /**
   * Test if a given object is an instance of `Client`.
   */
  isClient(source: any): source is Client { return (source instanceof Client); }

  /**
   * Read the current UNIX time in milliseconds.
   */
  get time(): number { return Date.now(); }

  /**
   * Extract the pathname of a URL.
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
    return new Promise<void>(resolve => { setTimeout(() => resolve(), ms); });
  }

  getConfigUrl(url: string): string {
    // If the URL is relative to the SW's own origin, then only consider the path relative to
    // the domain root. Determine this by checking the URL's origin against the SW's.
    const parsed = this.parseUrl(url, this.scopeUrl);
    if (parsed.origin === this.origin) {
      // The URL is relative to the SW's origin domain.
      return parsed.path;
    } else {
      return url;
    }
  }
}

/**
 * An event context in which an operation is taking place, which allows
 * the delaying of Service Worker shutdown until certain triggers occur.
 */
export interface Context {
  /**
   * Delay shutdown of the Service Worker until the given promise resolves.
   */
  waitUntil(fn: Promise<any>): void;
}
