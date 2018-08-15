/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';
import {Database, NotFound, Table} from './database';


/**
 * An implementation of a `Database` that uses the `CacheStorage` API to serialize
 * state within mock `Response` objects.
 */
export class CacheDatabase implements Database {
  private tables = new Map<string, Promise<CacheTable>>();

  constructor(private scope: ServiceWorkerGlobalScope, private adapter: Adapter) {}

  'delete'(name: string): Promise<boolean> {
    if (this.tables.has(name)) {
      this.tables.delete(name);
    }
    return this.scope.caches.delete(`${this.adapter.cacheNamePrefix}:db:${name}`);
  }

  list(): Promise<string[]> {
    return this.scope.caches.keys().then(
        keys => keys.filter(key => key.startsWith(`${this.adapter.cacheNamePrefix}:db:`)));
  }

  open(name: string, cacheQueryOptions?: CacheQueryOptions): Promise<Table> {
    if (!this.tables.has(name)) {
      const table =
          this.scope.caches.open(`${this.adapter.cacheNamePrefix}:db:${name}`)
              .then(cache => new CacheTable(name, cache, this.adapter, cacheQueryOptions));
      this.tables.set(name, table);
    }
    return this.tables.get(name)!;
  }
}

/**
 * A `Table` backed by a `Cache`.
 */
export class CacheTable implements Table {
  constructor(
      readonly table: string, private cache: Cache, private adapter: Adapter,
      private cacheQueryOptions?: CacheQueryOptions) {}

  private request(key: string): Request {
    return this.adapter.newRequest('/' + key);
  }

  'delete'(key: string): Promise<boolean> {
    return this.cache.delete(this.request(key), this.cacheQueryOptions);
  }

  keys(): Promise<string[]> {
    return this.cache.keys().then(requests => requests.map(req => req.url.substr(1)));
  }

  read(key: string): Promise<any> {
    return this.cache.match(this.request(key), this.cacheQueryOptions).then(res => {
      if (res === undefined) {
        return Promise.reject(new NotFound(this.table, key));
      }
      return res.json();
    });
  }

  write(key: string, value: Object): Promise<void> {
    return this.cache.put(this.request(key), this.adapter.newResponse(JSON.stringify(value)));
  }
}
