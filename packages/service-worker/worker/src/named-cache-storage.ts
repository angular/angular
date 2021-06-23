/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface NamedCache extends Cache {
  readonly name: string;
}

/**
 * A wrapper around `CacheStorage` to allow interacting with caches more easily and consistently by:
 * - Adding a `name` property to all opened caches, which can be used to easily perform other
 *   operations that require the cache name.
 * - Name-spacing cache names to avoid conflicts with other caches on the same domain.
 */
export class NamedCacheStorage<T extends CacheStorage> implements CacheStorage {
  constructor(readonly original: T, private cacheNamePrefix: string) {}

  delete(cacheName: string): Promise<boolean> {
    return this.original.delete(`${this.cacheNamePrefix}:${cacheName}`);
  }

  has(cacheName: string): Promise<boolean> {
    return this.original.has(`${this.cacheNamePrefix}:${cacheName}`);
  }

  async keys(): Promise<string[]> {
    const prefix = `${this.cacheNamePrefix}:`;
    const allCacheNames = await this.original.keys();
    const ownCacheNames = allCacheNames.filter(name => name.startsWith(prefix));
    return ownCacheNames.map(name => name.slice(prefix.length));
  }

  match(request: RequestInfo, options?: MultiCacheQueryOptions): Promise<Response|undefined> {
    return this.original.match(request, options);
  }

  async open(cacheName: string): Promise<NamedCache> {
    const cache = await this.original.open(`${this.cacheNamePrefix}:${cacheName}`);
    return Object.assign(cache, {name: cacheName});
  }
}
