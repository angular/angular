/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MockResponse} from './fetch';
import {normalizeUrl} from './utils';

export interface DehydratedResponse {
  body: string | null;
  status: number;
  statusText: string;
  headers: {[name: string]: string};
}

export type DehydratedCache = {
  [url: string]: DehydratedResponse;
};
export type DehydratedCacheStorage = {
  [name: string]: DehydratedCache;
};

export class MockCacheStorage implements CacheStorage {
  private caches = new Map<string, MockCache>();

  constructor(
    private origin: string,
    hydrateFrom?: string,
  ) {
    if (hydrateFrom !== undefined) {
      const hydrated = JSON.parse(hydrateFrom) as DehydratedCacheStorage;
      Object.keys(hydrated).forEach((name) => {
        this.caches.set(name, new MockCache(this.origin, hydrated[name]));
      });
    }
  }

  async has(name: string): Promise<boolean> {
    return this.caches.has(name);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.caches.keys());
  }

  async open(name: string): Promise<Cache> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new MockCache(this.origin));
    }
    return this.caches.get(name) as any;
  }

  async match(req: Request): Promise<Response | undefined> {
    return await Array.from(this.caches.values()).reduce<Promise<Response | undefined>>(
      async (answer, cache): Promise<Response | undefined> => {
        const curr = await answer;
        if (curr !== undefined) {
          return curr;
        }

        return cache.match(req);
      },
      Promise.resolve<Response | undefined>(undefined),
    );
  }

  async 'delete'(name: string): Promise<boolean> {
    if (this.caches.has(name)) {
      this.caches.delete(name);
      return true;
    }
    return false;
  }

  dehydrate(): string {
    const dehydrated: DehydratedCacheStorage = {};
    Array.from(this.caches.keys()).forEach((name) => {
      const cache = this.caches.get(name)!;
      dehydrated[name] = cache.dehydrate();
    });
    return JSON.stringify(dehydrated);
  }
}

export class MockCache {
  private cache = new Map<string, Response>();

  constructor(
    private origin: string,
    hydrated?: DehydratedCache,
  ) {
    if (hydrated !== undefined) {
      Object.keys(hydrated).forEach((url) => {
        const resp = hydrated[url];
        this.cache.set(
          url,
          new MockResponse(resp.body, {
            status: resp.status,
            statusText: resp.statusText,
            headers: resp.headers,
          }),
        );
      });
    }
  }

  async add(request: RequestInfo): Promise<void> {
    throw 'Not implemented';
  }

  async addAll(requests: RequestInfo[]): Promise<void> {
    throw 'Not implemented';
  }

  async 'delete'(request: RequestInfo, options?: CacheQueryOptions): Promise<boolean> {
    let url = this.getRequestUrl(request);
    if (this.cache.has(url)) {
      this.cache.delete(url);
      return true;
    } else if (options?.ignoreSearch) {
      url = this.stripQueryAndHash(url);
      const cachedUrl = [...this.cache.keys()].find((key) => url === this.stripQueryAndHash(key));
      if (cachedUrl) {
        this.cache.delete(cachedUrl);
        return true;
      }
    }
    return false;
  }

  async keys(match?: Request | string): Promise<string[]> {
    if (match !== undefined) {
      throw 'Not implemented';
    }
    return Array.from(this.cache.keys());
  }

  async match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response> {
    let url = this.getRequestUrl(request);
    let res = this.cache.get(url);
    if (!res && options?.ignoreSearch) {
      // check if cache has url by ignoring search
      url = this.stripQueryAndHash(url);
      const matchingReq = [...this.cache.keys()].find((key) => url === this.stripQueryAndHash(key));
      if (matchingReq !== undefined) res = this.cache.get(matchingReq);
    }

    if (res !== undefined) {
      res = res.clone();
    }
    return res!;
  }

  async matchAll(request?: Request | string, options?: CacheQueryOptions): Promise<Response[]> {
    if (request === undefined) {
      return Array.from(this.cache.values());
    }
    const res = await this.match(request, options);
    if (res) {
      return [res];
    } else {
      return [];
    }
  }

  async put(request: RequestInfo, response: Response): Promise<void> {
    const url = this.getRequestUrl(request);
    this.cache.set(url, response.clone());

    // Even though the body above is cloned, consume it here because the
    // real cache consumes the body.
    await response.text();

    return;
  }

  dehydrate(): DehydratedCache {
    const dehydrated: DehydratedCache = {};
    Array.from(this.cache.keys()).forEach((url) => {
      const resp = this.cache.get(url) as MockResponse;
      const dehydratedResp = {
        body: resp._body,
        status: resp.status,
        statusText: resp.statusText,
        headers: {},
      } as DehydratedResponse;

      resp.headers.forEach((value: string, name: string) => {
        dehydratedResp.headers[name] = value;
      });

      dehydrated[url] = dehydratedResp;
    });
    return dehydrated;
  }

  /** Get the normalized URL from a `RequestInfo` value. */
  private getRequestUrl(request: RequestInfo): string {
    const url = typeof request === 'string' ? request : request.url;
    return normalizeUrl(url, this.origin);
  }

  /** remove the query/hash part from a url*/
  private stripQueryAndHash(url: string): string {
    return url.replace(/[?#].*/, '');
  }
}

// This can be used to simulate a situation (bug?), where the user clears the caches from DevTools,
// while the SW is still running (e.g. serving another tab) and keeps references to the deleted
// caches.
export async function clearAllCaches(caches: CacheStorage): Promise<void> {
  const cacheNames = await caches.keys();
  const cacheInstances = await Promise.all(cacheNames.map((name) => caches.open(name)));

  // Delete all cache instances from `CacheStorage`.
  await Promise.all(cacheNames.map((name) => caches.delete(name)));

  // Delete all entries from each cache instance.
  await Promise.all(
    cacheInstances.map(async (cache) => {
      const keys = await cache.keys();
      await Promise.all(keys.map((key) => cache.delete(key)));
    }),
  );
}
