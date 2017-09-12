/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockResponse} from './fetch';

export interface DehydratedResponse {
  body: string|null;
  status: number;
  statusText: string;
  headers: {[name: string]: string};
}

export type DehydratedCache = {
  [url: string]: DehydratedResponse
};
export type DehydratedCacheStorage = {
  [name: string]: DehydratedCache
};

export class MockCacheStorage implements CacheStorage {
  private caches = new Map<string, MockCache>();

  constructor(hydrateFrom?: string) {
    if (hydrateFrom !== undefined) {
      const hydrated = JSON.parse(hydrateFrom) as DehydratedCacheStorage;
      Object.keys(hydrated).forEach(
          name => { this.caches.set(name, new MockCache(hydrated[name])); });
    }
  }

  async has(name: string): Promise<boolean> { return this.caches.has(name); }

  async keys(): Promise<string[]> { return Array.from(this.caches.keys()); }

  async open(name: string): Promise<Cache> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new MockCache());
    }
    return this.caches.get(name) !;
  }

  async match(req: Request): Promise<Response|undefined> {
    return await Array.from(this.caches.values())
        .reduce<Promise<Response|undefined>>(async(answer, cache): Promise<Response|undefined> => {
          const curr = await answer;
          if (curr !== undefined) {
            return curr;
          }

          return cache.match(req);
        }, Promise.resolve<Response|undefined>(undefined));
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
    Array.from(this.caches.keys()).forEach(name => {
      const cache = this.caches.get(name) !;
      dehydrated[name] = cache.dehydrate();
    });
    return JSON.stringify(dehydrated);
  }
}

export class MockCache implements Cache {
  private cache = new Map<string, Response>();

  constructor(hydrated?: DehydratedCache) {
    if (hydrated !== undefined) {
      Object.keys(hydrated).forEach(url => {
        const resp = hydrated[url];
        this.cache.set(
            url, new MockResponse(
                     resp.body,
                     {status: resp.status, statusText: resp.statusText, headers: resp.headers}));
      });
    }
  }

  async add(request: RequestInfo): Promise<void> { throw 'Not implemented'; }

  async addAll(requests: RequestInfo[]): Promise<void> { throw 'Not implemented'; }

  async 'delete'(request: RequestInfo): Promise<boolean> {
    const url = (typeof request === 'string' ? request : request.url);
    if (this.cache.has(url)) {
      this.cache.delete(url);
      return true;
    }
    return false;
  }

  async keys(match?: Request|string): Promise<string[]> {
    if (match !== undefined) {
      throw 'Not implemented';
    }
    return Array.from(this.cache.keys());
  }

  async match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response> {
    const url = (typeof request === 'string' ? request : request.url);
    // TODO: cleanup typings. Typescript doesn't know this can resolve to undefined.
    let res = this.cache.get(url);
    if (res !== undefined) {
      res = res.clone();
    }
    return res !;
  }


  async matchAll(request?: Request|string, options?: CacheQueryOptions): Promise<Response[]> {
    if (request === undefined) {
      return Array.from(this.cache.values());
    }
    const url = (typeof request === 'string' ? request : request.url);
    if (this.cache.has(url)) {
      return [this.cache.get(url) !];
    } else {
      return [];
    }
  }

  async put(request: RequestInfo, response: Response): Promise<void> {
    const url = (typeof request === 'string' ? request : request.url);
    this.cache.set(url, response.clone());
    return;
  }

  dehydrate(): DehydratedCache {
    const dehydrated: DehydratedCache = {};
    Array.from(this.cache.keys()).forEach(url => {
      const resp = this.cache.get(url) !as MockResponse;
      const dehydratedResp = {
        body: resp._body,
        status: resp.status,
        statusText: resp.statusText,
        headers: {},
      } as DehydratedResponse;

      resp.headers.forEach((value, name) => { dehydratedResp.headers[name] = value; });

      dehydrated[url] = dehydratedResp;
    });
    return dehydrated;
  }
}