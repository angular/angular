/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';
import {Database, NotFound, Table} from './database';
import {NamedCache} from './named-cache-storage';


/**
 * An implementation of a `Database` that uses the `CacheStorage` API to serialize
 * state within mock `Response` objects.
 */
export class CacheDatabase implements Database {
  private cacheNamePrefix = 'db';
  private tables = new Map<string, CacheTable>();

  constructor(private adapter: Adapter) {}

  'delete'(name: string): Promise<boolean> {
    if (this.tables.has(name)) {
      this.tables.delete(name);
    }
    return this.adapter.caches.delete(`${this.cacheNamePrefix}:${name}`);
  }

  async list(): Promise<string[]> {
    const prefix = `${this.cacheNamePrefix}:`;
    const allCacheNames = await this.adapter.caches.keys();
    const dbCacheNames = allCacheNames.filter(name => name.startsWith(prefix));

    // Return the un-prefixed table names, so they can be used with other `CacheDatabase` methods
    // (for example, for opening/deleting a table).
    return dbCacheNames.map(name => name.slice(prefix.length));
  }

  async open(name: string, cacheQueryOptions?: CacheQueryOptions): Promise<Table> {
    if (!this.tables.has(name)) {
      const cache = await this.adapter.caches.open(`${this.cacheNamePrefix}:${name}`);
      const table = new CacheTable(name, cache, this.adapter, cacheQueryOptions);
      this.tables.set(name, table);
    }
    return this.tables.get(name)!;
  }
}

/**
 * A `Table` backed by a `Cache`.
 */
export class CacheTable implements Table {
  cacheName = this.cache.name;

  constructor(
      readonly name: string, private cache: NamedCache, private adapter: Adapter,
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
        return Promise.reject(new NotFound(this.name, key));
      }
      return res.json();
    });
  }

  write(key: string, value: Object): Promise<void> {
    return this.cache.put(this.request(key), this.adapter.newResponse(JSON.stringify(value)));
  }
}
