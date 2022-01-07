/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';
import {Database, Table} from './database';
import {CacheTable} from './db-cache';
import {DebugHandler} from './debug';
import {DataGroupConfig} from './manifest';
import {NamedCache} from './named-cache-storage';

/**
 * A metadata record of how old a particular cached resource is.
 */
interface AgeRecord {
  age: number;
}

/**
 * A node in the LRU chain for a given `DataGroup`.
 *
 * Serializable as previous/next are identified by their URL and are not references.
 */
interface LruNode {
  /**
   * The URL tracked by this node.
   */
  url: string;

  /**
   * The previous (more recent) node in the chain, or null if this is the head.
   */
  previous: string|null;

  /**
   * The next (less recent) node in the chain, or null if this is the tail.
   */
  next: string|null;
}

/**
 * Serializable state of an entire LRU chain.
 *
 * Essentially a doubly linked list of URLs.
 */
interface LruState {
  /**
   * URL of the head node, or null if the chain is empty.
   */
  head: string|null;

  /**
   * URL of the tail node, or null if the chain is empty.
   */
  tail: string|null;

  /**
   * Map of URLs to data for each URL (including next/prev pointers).
   */
  map: {[url: string]: LruNode|undefined};

  /**
   * Count of the number of nodes in the chain.
   */
  count: number;
}

/**
 * Manages an instance of `LruState` and moves URLs to the head of the
 * chain when requested.
 */
class LruList {
  state: LruState;
  constructor(state?: LruState) {
    if (state === undefined) {
      state = {
        head: null,
        tail: null,
        map: {},
        count: 0,
      };
    }
    this.state = state;
  }

  /**
   * The current count of URLs in the list.
   */
  get size(): number {
    return this.state.count;
  }

  /**
   * Remove the tail.
   */
  pop(): string|null {
    // If there is no tail, return null.
    if (this.state.tail === null) {
      return null;
    }

    const url = this.state.tail;
    this.remove(url);

    // This URL has been successfully evicted.
    return url;
  }

  remove(url: string): boolean {
    const node = this.state.map[url];
    if (node === undefined) {
      return false;
    }

    // Special case if removing the current head.
    if (this.state.head === url) {
      // The node is the current head. Special case the removal.
      if (node.next === null) {
        // This is the only node. Reset the cache to be empty.
        this.state.head = null;
        this.state.tail = null;
        this.state.map = {};
        this.state.count = 0;
        return true;
      }

      // There is at least one other node. Make the next node the new head.
      const next = this.state.map[node.next!]!;
      next.previous = null;
      this.state.head = next.url;
      node.next = null;
      delete this.state.map[url];
      this.state.count--;
      return true;
    }

    // The node is not the head, so it has a previous. It may or may not be the tail.
    // If it is not, then it has a next. First, grab the previous node.
    const previous = this.state.map[node.previous!]!;

    // Fix the forward pointer to skip over node and go directly to node.next.
    previous.next = node.next;

    // node.next may or may not be set. If it is, fix the back pointer to skip over node.
    // If it's not set, then this node happened to be the tail, and the tail needs to be
    // updated to point to the previous node (removing the tail).
    if (node.next !== null) {
      // There is a next node, fix its back pointer to skip this node.
      this.state.map[node.next]!.previous = node.previous!;
    } else {
      // There is no next node - the accessed node must be the tail. Move the tail pointer.
      this.state.tail = node.previous!;
    }

    node.next = null;
    node.previous = null;
    delete this.state.map[url];
    // Count the removal.
    this.state.count--;

    return true;
  }

  accessed(url: string): void {
    // When a URL is accessed, its node needs to be moved to the head of the chain.
    // This is accomplished in two steps:
    //
    // 1) remove the node from its position within the chain.
    // 2) insert the node as the new head.
    //
    // Sometimes, a URL is accessed which has not been seen before. In this case, step 1 can
    // be skipped completely (which will grow the chain by one). Of course, if the node is
    // already the head, this whole operation can be skipped.
    if (this.state.head === url) {
      // The URL is already in the head position, accessing it is a no-op.
      return;
    }

    // Look up the node in the map, and construct a new entry if it's
    const node = this.state.map[url] || {url, next: null, previous: null};

    // Step 1: remove the node from its position within the chain, if it is in the chain.
    if (this.state.map[url] !== undefined) {
      this.remove(url);
    }

    // Step 2: insert the node at the head of the chain.

    // First, check if there's an existing head node. If there is, it has previous: null.
    // Its previous pointer should be set to the node we're inserting.
    if (this.state.head !== null) {
      this.state.map[this.state.head]!.previous = url;
    }

    // The next pointer of the node being inserted gets set to the old head, before the head
    // pointer is updated to this node.
    node.next = this.state.head;

    // The new head is the new node.
    this.state.head = url;

    // If there is no tail, then this is the first node, and is both the head and the tail.
    if (this.state.tail === null) {
      this.state.tail = url;
    }

    // Set the node in the map of nodes (if the URL has been seen before, this is a no-op)
    // and count the insertion.
    this.state.map[url] = node;
    this.state.count++;
  }
}

/**
 * A group of cached resources determined by a set of URL patterns which follow a LRU policy
 * for caching.
 */
export class DataGroup {
  /**
   * Compiled regular expression set used to determine which resources fall under the purview
   * of this group.
   */
  private readonly patterns: RegExp[];

  /**
   * The `Cache` instance in which resources belonging to this group are cached.
   */
  private readonly cache: Promise<NamedCache>;

  /**
   * Tracks the LRU state of resources in this cache.
   */
  private _lru: LruList|null = null;

  /**
   * Database table used to store the state of the LRU cache.
   */
  private readonly lruTable: Promise<Table>;

  /**
   * Database table used to store metadata for resources in the cache.
   */
  private readonly ageTable: Promise<Table>;

  constructor(
      private scope: ServiceWorkerGlobalScope, private adapter: Adapter,
      private config: DataGroupConfig, private db: Database, private debugHandler: DebugHandler,
      cacheNamePrefix: string) {
    this.patterns = config.patterns.map(pattern => new RegExp(pattern));
    this.cache = adapter.caches.open(`${cacheNamePrefix}:${config.name}:cache`);
    this.lruTable = this.db.open(`${cacheNamePrefix}:${config.name}:lru`, config.cacheQueryOptions);
    this.ageTable = this.db.open(`${cacheNamePrefix}:${config.name}:age`, config.cacheQueryOptions);
  }

  /**
   * Lazily initialize/load the LRU chain.
   */
  private async lru(): Promise<LruList> {
    if (this._lru === null) {
      const table = await this.lruTable;
      try {
        this._lru = new LruList(await table.read<LruState>('lru'));
      } catch {
        this._lru = new LruList();
      }
    }
    return this._lru;
  }

  /**
   * Sync the LRU chain to non-volatile storage.
   */
  async syncLru(): Promise<void> {
    if (this._lru === null) {
      return;
    }
    const table = await this.lruTable;
    try {
      return table.write('lru', this._lru!.state);
    } catch (err) {
      // Writing lru cache table failed. This could be a result of a full storage.
      // Continue serving clients as usual.
      this.debugHandler.log(
          err as Error, `DataGroup(${this.config.name}@${this.config.version}).syncLru()`);
      // TODO: Better detect/handle full storage; e.g. using
      // [navigator.storage](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorStorage/storage).
    }
  }

  /**
   * Process a fetch event and return a `Response` if the resource is covered by this group,
   * or `null` otherwise.
   */
  async handleFetch(req: Request, event: ExtendableEvent): Promise<Response|null> {
    // Do nothing
    if (!this.patterns.some(pattern => pattern.test(req.url))) {
      return null;
    }

    // Lazily initialize the LRU cache.
    const lru = await this.lru();

    // The URL matches this cache. First, check whether this is a mutating request or not.
    switch (req.method) {
      case 'OPTIONS':
        // Don't try to cache this - it's non-mutating, but is part of a mutating request.
        // Most likely SWs don't even see this, but this guard is here just in case.
        return null;
      case 'GET':
      case 'HEAD':
        // Handle the request with whatever strategy was selected.
        switch (this.config.strategy) {
          case 'freshness':
            return this.handleFetchWithFreshness(req, event, lru);
          case 'performance':
            return this.handleFetchWithPerformance(req, event, lru);
          default:
            throw new Error(`Unknown strategy: ${this.config.strategy}`);
        }
      default:
        // This was a mutating request. Assume the cache for this URL is no longer valid.
        const wasCached = lru.remove(req.url);

        // If there was a cached entry, remove it.
        if (wasCached) {
          await this.clearCacheForUrl(req.url);
        }

        // Sync the LRU chain to non-volatile storage.
        await this.syncLru();

        // Finally, fall back on the network.
        return this.safeFetch(req);
    }
  }

  private async handleFetchWithPerformance(req: Request, event: ExtendableEvent, lru: LruList):
      Promise<Response|null> {
    // The 'performance' strategy prioritizes cached response. Prefer to avoid caching opaque
    // responses to avoid caching an error response.
    const okToCacheOpaque = this.config.cacheOpaqueResponses ?? false;

    let res: Response|null|undefined = null;

    // Check the cache first. If the resource exists there (and is not expired), the cached
    // version can be used.
    const fromCache = await this.loadFromCache(req, lru);
    if (fromCache !== null) {
      res = fromCache.res;
      // Check the age of the resource.
      if (this.config.refreshAheadMs !== undefined && fromCache.age >= this.config.refreshAheadMs) {
        event.waitUntil(this.safeCacheResponse(req, this.safeFetch(req), lru, okToCacheOpaque));
      }
    }

    if (res !== null) {
      return res;
    }

    // No match from the cache. Go to the network. Note that this is not an 'await'
    // call, networkFetch is the actual Promise. This is due to timeout handling.
    const [timeoutFetch, networkFetch] = this.networkFetchWithTimeout(req);
    res = await timeoutFetch;

    // Since fetch() will always return a response, undefined indicates a timeout.
    if (res === undefined) {
      // The request timed out. Return a Gateway Timeout error.
      res = this.adapter.newResponse(null, {status: 504, statusText: 'Gateway Timeout'});

      // Cache the network response eventually.
      event.waitUntil(this.safeCacheResponse(req, networkFetch, lru, okToCacheOpaque));
    } else {
      // The request completed in time, so cache it inline with the response flow.
      await this.safeCacheResponse(req, res, lru, okToCacheOpaque);
    }

    return res;
  }

  private async handleFetchWithFreshness(req: Request, event: ExtendableEvent, lru: LruList):
      Promise<Response|null> {
    // The 'freshness' strategy prioritizes responses from the network. Therefore, it is OK to cache
    // an opaque response, even if it is an error response.
    const okToCacheOpaque = this.config.cacheOpaqueResponses ?? true;

    // Start with a network fetch.
    const [timeoutFetch, networkFetch] = this.networkFetchWithTimeout(req);
    let res: Response|null|undefined;


    // If that fetch errors, treat it as a timed out request.
    try {
      res = await timeoutFetch;
    } catch {
      res = undefined;
    }

    // If the network fetch times out or errors, fall back on the cache.
    if (res === undefined) {
      event.waitUntil(this.safeCacheResponse(req, networkFetch, lru, okToCacheOpaque));

      // Ignore the age, the network response will be cached anyway due to the
      // behavior of freshness.
      const fromCache = await this.loadFromCache(req, lru);
      res = (fromCache !== null) ? fromCache.res : null;
    } else {
      await this.safeCacheResponse(req, res, lru, okToCacheOpaque);
    }

    // Either the network fetch didn't time out, or the cache yielded a usable response.
    // In either case, use it.
    if (res !== null) {
      return res;
    }

    // No response in the cache. No choice but to fall back on the full network fetch.
    return networkFetch;
  }

  private networkFetchWithTimeout(req: Request): [Promise<Response|undefined>, Promise<Response>] {
    // If there is a timeout configured, race a timeout Promise with the network fetch.
    // Otherwise, just fetch from the network directly.
    if (this.config.timeoutMs !== undefined) {
      const networkFetch = this.scope.fetch(req);
      const safeNetworkFetch = (async () => {
        try {
          return await networkFetch;
        } catch {
          return this.adapter.newResponse(null, {
            status: 504,
            statusText: 'Gateway Timeout',
          });
        }
      })();
      const networkFetchUndefinedError = (async () => {
        try {
          return await networkFetch;
        } catch {
          return undefined;
        }
      })();
      // Construct a Promise<undefined> for the timeout.
      const timeout = this.adapter.timeout(this.config.timeoutMs) as Promise<undefined>;
      // Race that with the network fetch. This will either be a Response, or `undefined`
      // in the event that the request errored or timed out.
      return [Promise.race([networkFetchUndefinedError, timeout]), safeNetworkFetch];
    } else {
      const networkFetch = this.safeFetch(req);
      // Do a plain fetch.
      return [networkFetch, networkFetch];
    }
  }

  private async safeCacheResponse(
      req: Request, resOrPromise: Promise<Response>|Response, lru: LruList,
      okToCacheOpaque?: boolean): Promise<void> {
    try {
      const res = await resOrPromise;
      try {
        await this.cacheResponse(req, res, lru, okToCacheOpaque);
      } catch (err) {
        // Saving the API response failed. This could be a result of a full storage.
        // Since this data is cached lazily and temporarily, continue serving clients as usual.
        this.debugHandler.log(
            err as Error,
            `DataGroup(${this.config.name}@${this.config.version}).safeCacheResponse(${
                req.url}, status: ${res.status})`);

        // TODO: Better detect/handle full storage; e.g. using
        // [navigator.storage](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorStorage/storage).
      }
    } catch {
      // Request failed
      // TODO: Handle this error somehow?
    }
  }

  private async loadFromCache(req: Request, lru: LruList):
      Promise<{res: Response, age: number}|null> {
    // Look for a response in the cache. If one exists, return it.
    const cache = await this.cache;
    let res = await cache.match(req, this.config.cacheQueryOptions);
    if (res !== undefined) {
      // A response was found in the cache, but its age is not yet known. Look it up.
      try {
        const ageTable = await this.ageTable;
        const age = this.adapter.time - (await ageTable.read<AgeRecord>(req.url)).age;
        // If the response is young enough, use it.
        if (age <= this.config.maxAge) {
          // Successful match from the cache. Use the response, after marking it as having
          // been accessed.
          lru.accessed(req.url);
          return {res, age};
        }

        // Otherwise, or if there was an error, assume the response is expired, and evict it.
      } catch {
        // Some error getting the age for the response. Assume it's expired.
      }

      lru.remove(req.url);
      await this.clearCacheForUrl(req.url);

      // TODO: avoid duplicate in event of network timeout, maybe.
      await this.syncLru();
    }
    return null;
  }

  /**
   * Operation for caching the response from the server. This has to happen all
   * at once, so that the cache and LRU tracking remain in sync. If the network request
   * completes before the timeout, this logic will be run inline with the response flow.
   * If the request times out on the server, an error will be returned but the real network
   * request will still be running in the background, to be cached when it completes.
   */
  private async cacheResponse(req: Request, res: Response, lru: LruList, okToCacheOpaque = false):
      Promise<void> {
    // Only cache successful responses.
    if (!(res.ok || (okToCacheOpaque && res.type === 'opaque'))) {
      return;
    }

    // If caching this response would make the cache exceed its maximum size, evict something
    // first.
    if (lru.size >= this.config.maxSize) {
      // The cache is too big, evict something.
      const evictedUrl = lru.pop();
      if (evictedUrl !== null) {
        await this.clearCacheForUrl(evictedUrl);
      }
    }

    // TODO: evaluate for possible race conditions during flaky network periods.

    // Mark this resource as having been accessed recently. This ensures it won't be evicted
    // until enough other resources are requested that it falls off the end of the LRU chain.
    lru.accessed(req.url);

    // Store the response in the cache (cloning because the browser will consume
    // the body during the caching operation).
    await (await this.cache).put(req, res.clone());

    // Store the age of the cache.
    const ageTable = await this.ageTable;
    await ageTable.write(req.url, {age: this.adapter.time});

    // Sync the LRU chain to non-volatile storage.
    await this.syncLru();
  }

  /**
   * Delete all of the saved state which this group uses to track resources.
   */
  async cleanup(): Promise<void> {
    // Remove both the cache and the database entries which track LRU stats.
    await Promise.all([
      this.cache.then(cache => this.adapter.caches.delete(cache.name)),
      this.ageTable.then(table => this.db.delete(table.name)),
      this.lruTable.then(table => this.db.delete(table.name)),
    ]);
  }
  /**
   * Return a list of the names of all caches used by this group.
   */
  async getCacheNames(): Promise<string[]> {
    const [cache, ageTable, lruTable] = await Promise.all([
      this.cache,
      this.ageTable as Promise<CacheTable>,
      this.lruTable as Promise<CacheTable>,
    ]);
    return [cache.name, ageTable.cacheName, lruTable.cacheName];
  }

  /**
   * Clear the state of the cache for a particular resource.
   *
   * This doesn't remove the resource from the LRU table, that is assumed to have
   * been done already. This clears the GET and HEAD versions of the request from
   * the cache itself, as well as the metadata stored in the age table.
   */
  private async clearCacheForUrl(url: string): Promise<void> {
    const [cache, ageTable] = await Promise.all([this.cache, this.ageTable]);
    await Promise.all([
      cache.delete(this.adapter.newRequest(url, {method: 'GET'}), this.config.cacheQueryOptions),
      cache.delete(this.adapter.newRequest(url, {method: 'HEAD'}), this.config.cacheQueryOptions),
      ageTable.delete(url),
    ]);
  }

  private async safeFetch(req: Request): Promise<Response> {
    try {
      return this.scope.fetch(req);
    } catch {
      return this.adapter.newResponse(null, {
        status: 504,
        statusText: 'Gateway Timeout',
      });
    }
  }
}
