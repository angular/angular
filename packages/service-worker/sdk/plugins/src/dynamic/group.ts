import {Clock, NgSwAdapter, NgSwCache, ScopedCache, UrlConfig, UrlMatcher} from '@angular/service-worker/sdk';

import {CompareFn, SortedLinkedList} from './linked';
import {GroupManifest} from './manifest';

const DEFAULT_CACHE_SIZE = 100;

/**
 * Metadata that's tracked for every entry in the cache.
 *
 * @experimental
 */
export interface EntryMetadata {
  /**
   * Number of times this entry has been accessed. Used for LFU.
   */
  accessCount: number;

  /**
   * Timestamp (Date.now) since this cached request was last accessed. Used for LRU.
   */
  accessedTs: number;

  /**
   * Timestamp (Date.now) since this cached request was first added. Used for FIFO.
   */
  addedTs: number;
}

/**
 * Map of URLs to metadata for those URLs.
 *
 * @experimental
 */
export interface EntryMetadataMap { [url: string]: EntryMetadata; }

/**
 * A function which, when called, effects a side effect that may complete
 * asynchronously.
 *
 * @experimental
 */
export type SideEffectFn = () => Promise<any>;

/**
 * A potential `Response`, with an optional side effect function. Side effects
 * are used to update metadata and perform other operations outside of the critical
 * path for the request.
 *
 * If response is `null`, then there was no response available for this request.
 *
 * @experimental
 */
export interface ResponseWithSideEffect {
  /**
   * The response, or `null` if none existed for the request.
   */
  response: Response|null;

  /**
   * Age of this response, if available.
   */
  cacheAge?: number;

  /**
   * An optional function which, when executed, applies an asynchronous side effect.
   */
  sideEffect?: SideEffectFn;
}

/**
 * Optionally applies a side effect, returning a `Promise` which waits for the
 * side effect to be applied if it exists, or resolves immediately if not.
 *
 * @experimental
 */
export function maybeRun(sideEffect: SideEffectFn | null): Promise<any> {
  return !!sideEffect ? sideEffect() : Promise.resolve();
}

/**
 * A strategy that makes use of the cache information in the `DynamicGroup` to
 * optimize the loading of `Request`s.
 *
 * @experimental
 */
export interface DynamicStrategy {
  /**
   * The strategy name, which will be matched against "optimizeFor" configuration
   * in dynamic cache configurations.
   */
  readonly name: string;

  /**
   * Applies the strategy to a `Request` and returns an asynchronous response with an
   * optional side effect.
   *
   * The given delegate is used to forward the request to the remainder of the chain
   * in the event the strategy cannot or elects not to use a cached response.
   */
  fetch(group: DynamicGroup, req: Request, delegate: () => Promise<Response>):
      Promise<ResponseWithSideEffect>;
}

/**
 * Map of strategy names to implementations.
 *
 * @experimental
 */
export interface DynamicStrategyMap { [strategy: string]: DynamicStrategy; }

/**
 * Represents a specific cache group with a single policy.
 *
 * @experimental
 */
export class DynamicGroup {
  /**
   * A queue of cached URLs, sorted according to the caching configuration (fifo,
   * lfu, or lru). This is maintained in memory only, and reconstructed by `open`
   * when loading from saved state.
   */
  private queue: SortedLinkedList<string>;

  /**
   * Metadata for entries in this group's cache. Only URLs which exist in `queue`
   * should have entries in this metadata map.
   *
   * The metadata map is mirrored to a 'metadata' cache entry under this group's
   * scoped cache, keyed by the request.
   */
  private metadata: EntryMetadataMap;

  /**
   * The optimization strategy used for requests in this group. The actual work
   * of determining whether to used cached responses or continue to the network
   * is done by the `DynamicStrategy`, not the `DynamicGroup`.
   */
  private strategy: DynamicStrategy;

  /**
   * The user-provided manifest which configures the behavior of this dynamic
   * caching group.
   */
  config: GroupManifest;

  /**
   * Facade which enables unit testing of the cache group.
   */
  private adapter: NgSwAdapter;

  /**
   * A cache scoped to this particular dynamic group.
   */
  private cache: NgSwCache;

  /**
   * Matchers that will detect URLs which should be handled by this group.
   */
  private matchers: UrlMatcher[];

  /**
   * Clock which enables easy unit testing of `DynamicGroup`'s cache expiration
   * operations through mocking of the current time.
   */
  clock: Clock;

  /**
   * Consumers should use `DynamicGroup.open` instead.
   */
  constructor(
      strategy: DynamicStrategy, config: GroupManifest, adapter: NgSwAdapter, cache: NgSwCache,
      matchers: UrlMatcher[], metadata: EntryMetadataMap, clock: Clock) {
    // Obligatory Javaesque assignment of class properties.
    this.strategy = strategy;
    this.config = config;
    this.adapter = adapter;
    this.cache = cache;
    this.matchers = matchers;
    this.metadata = metadata;
    this.clock = clock;

    // Construct the queue with a comparison strategy based on the expiration
    // strategy chosen by the user.
    switch (config.cache.strategy) {
      case 'fifo':
        this.queue = new SortedLinkedList<string>(this.fifoCompare.bind(this));
        break;
      case 'lfu':
        this.queue = new SortedLinkedList<string>(this.lfuCompare.bind(this));
        break;
      case 'lru':
        this.queue = new SortedLinkedList<string>(this.lruCompare.bind(this));
        break;
      default:
        throw new Error(`Unknown cache strategy: ${config.cache.strategy}`);
    }
    Object.keys(this.metadata).forEach(url => this.queue.insert(url));
  }

  /**
   * Constructs a new `DynamicGroup`, based on the given manifest. If this group has
   * never existed before, it will be empty. If it has, the existing metadata will be
   * read out of
   */
  static open(
      config: GroupManifest, adapter: NgSwAdapter, delegateCache: NgSwCache, clock: Clock,
      strategies: DynamicStrategyMap): Promise<DynamicGroup> {
    // The cache passed to open() isn't scoped, so construct a new one that's scoped.
    const cache = new ScopedCache(delegateCache, `dynamic:${config.name}:`);

    // Select the desired strategy with which to process requests. If the user
    // asked for an invalid strategy, complain.
    const strategy = strategies[config.cache.optimizeFor];
    if (!strategy) {
      throw new Error(
          `No registered optimizeFor handler (${config.cache.optimizeFor}) for group ${config.name}`);
    }

    // Construct the chain of `UrlMatcher`s for all of the URL matching configurations
    // provided in the manifest.
    const matchers =
        Object.keys(config.urls).map(url => new UrlMatcher(url, config.urls[url], adapter.scope));

    // Look through the metadata cache for all cached requests, load the metadata for
    // them, and add it to a metadata map, keyed by URL. If this is a fresh cache and
    // there are no requests, then cache.keysOf() will return an empty array, and the
    // resulting metadata map will be empty.
    return cache
        .keysOf('metadata')
        // These keys are `Request`s, use them to actually load the data from the cache.
        .then(
            keys => Promise.all(keys.map(
                key => cache
                           // For each key, load the metadata for the key.
                           .load('metadata', key)
                           // Read it out as an `EntryMetadata` object.
                           .then(resp => resp.json() as Promise<EntryMetadata>)
                           // And capture the URL as well.
                           .then(metadata => ({url: key.url, metadata})))))
        // Transform the list of metadata objects into a map keyed by the URL.
        .then(
            metadata => metadata.reduce(
                (acc, curr) => {
                  acc[curr.url] = curr.metadata;
                  return acc;
                },
                {} as EntryMetadataMap))
        // Finally, create the `DynamicGroup` instance with the loaded data.
        .then(
            metadata =>
                new DynamicGroup(strategy, config, adapter, cache, matchers, metadata, clock));
  }

  /**
   * Match a `Request` against the URL patterns configured for this group.
   */
  matches(req: Request): boolean { return this.matchers.some(matcher => matcher.matches(req.url)); }

  /**
   * A comparison function for FIFO expiration, that compares two URLs by time added.
   */
  private fifoCompare(urlA: string, urlB: string): number {
    const a = this.metadata[urlA];
    const b = this.metadata[urlB];
    return compare(a.addedTs, b.addedTs);
  }

  /**
   * A comparison function for LFU expiration, that compares two URLs by access count.
   */
  private lfuCompare(urlA: string, urlB: string): number {
    const a = this.metadata[urlA];
    const b = this.metadata[urlB];
    return compare(a.accessCount, b.accessCount);
  }

  /**
   * A comparison function for LRU expiration, that compares two URLs by time accessed.
   */
  private lruCompare(urlA: string, urlB: string): number {
    const a = this.metadata[urlA];
    const b = this.metadata[urlB];
    return compare(a.accessedTs, b.accessedTs);
  }

  /**
   * Fetch a given request from the cache only.
   */
  fetchFromCache(req: Request): Promise<ResponseWithSideEffect> {
    // Firstly, check for metadata. If it doesn't exist, there's no point in
    // continuing, the request isn't cached.
    const metadata = this.metadata[req.url];
    if (!metadata) {
      return Promise.resolve({response: null});
    }

    // If the user's configured a maxAgeMs value for the cache, check the age of the
    // cached response against it. If it's too old, it needs to be removed from the
    // cache.
    const cacheAge = this.clock.dateNow() - metadata.addedTs;
    if (!!this.config.cache.maxAgeMs && cacheAge > this.config.cache.maxAgeMs) {
      // TODO: Possibly do this as a side effect and not inline.
      // Remove from the in-memory tracking.
      this.queue.remove(req.url);
      delete this.metadata[req.url];

      // And invalidate the entry in the actual cache.
      return Promise
          .all([
            this.cache.invalidate('cache', req.url),
            this.cache.invalidate('metadata', req.url),
          ])
          // Finally, signal that there was no cached response for this request.
          .then(() => ({response: null}));
    }

    // The cached response is valid and can be used.
    return this
        .cache
        // Grab the response from the cache.
        .load('cache', req.url)
        .then(response => {
          // Something went wrong, abort.
          // TODO: maybe need to invalidate the metadata here?
          if (!response) {
            return {response: null};
          }

          // The response is ready, but the metadata needs to be updated. Since this is
          // outside the critical path for servicing the request, it is done in a side
          // effect.
          const sideEffect = () => {
            // Update the 'accessed' stats.
            metadata.accessCount++;
            metadata.accessedTs = this.clock.dateNow();

            // Return a promise that saves the metadata to the metadata cache.
            return this.cache
                .store('metadata', req.url, this.adapter.newResponse(JSON.stringify(metadata)))
                // After caching, remove and insert the URL into the linked list which
                // tracks expiration order, to update its position based on the new stats.
                // TODO: optimize this operation to move the entry left or right in the list.
                .then(() => {
                  this.queue.remove(req.url);
                  this.queue.insert(req.url);
                });
          };

          // Finally, construct the final `ResponseWithSideEffects`.
          return {response, cacheAge, sideEffect};
        });
  }

  // Fetch a request from the network and store the response in the cache.
  fetchAndCache(req: Request, delegate: () => Promise<Response>): Promise<ResponseWithSideEffect> {
    // Call the delegate to run the rest of the fetch pipeline and get the response
    // from downstream plugins.
    return delegate().then(response => {
      // Don't cache unsuccessful responses.
      if (!response.ok) {
        return {response};
      }
      // TODO: check response size to implement maxSizeBytes.
      // Need to clone the response, as the body will be read twice
      const toCache = response.clone();

      // Adding to the cache is implemented as a side effect.
      const sideEffect =
          () => {
            // Check if the request already has associated metadata. If it does, then
            // it needs to be updated, otherwise insert new metadata (possibly causing an
            // eviction).
            let metadata = this.metadata[req.url];
            return !metadata ? this.insertIntoCache(req.url, toCache) :
                               this.updateIntoCache(req.url, toCache);
          }
      // Return the response together with the side effect that will cache it.
      return {response, sideEffect};
    });
  }

  /**
   * Handle fetching a request, using the configured strategy. `delegate` will invoke
   * the rest of the worker's fetch pipeline, ultimately fetching the request from the
   * network.
   */
  fetch(req: Request, delegate: () => Promise<Response>): Promise<ResponseWithSideEffect> {
    // If the request is mutating (not GET, OPTIONS, or HEAD) then it needs to go to the
    // server directly, bypassing the cache.
    if (req.method !== 'GET' && req.method !== 'OPTIONS' && req.method !== 'HEAD') {
      // TODO: invalidate cache on mutating request.
      const res = delegate().then(response => ({response}));
    }

    // Otherwise, delegate to the dynamic caching strategy to handle this request.
    return this.strategy.fetch(this, req, delegate);
  }

  /**
   * Insert a new URL into the cache, returning a `Promise` that resolves when all
   * the metadata updates are complete.
   */
  private insertIntoCache(url: string, res: Response): Promise<void> {
    // This should never happen, but sanity check that this entry does not have metadata
    // already.
    if (this.metadata[url]) {
      return Promise.reject(new Error(`insertIntoCache(${url}) but url is already cached`));
    }

    // New metadata entry for this respones.
    const now = this.clock.dateNow();
    const metadata: EntryMetadata = {
      addedTs: now,
      accessCount: 1,
      accessedTs: now,
    };

    // Start a Promise chain to keep the code organized.
    return Promise
        .resolve()
        // Evict requests if necessary.
        .then(() => {
          let maybeEvict: Promise<any> = Promise.resolve();

          // Evict items until the cache has room for the new entry.
          let queueLength = this.queue.length;
          while (queueLength >= (this.config.cache.maxEntries || DEFAULT_CACHE_SIZE)) {
            queueLength--;
            maybeEvict = maybeEvict.then(() => {
              // Need to evict something. Pick the top item on the queue and remove it.
              const evictUrl = this.queue.pop();
              if (evictUrl === null) {
                return Promise.resolve(null);
              }
              delete this.metadata[evictUrl];
              // Process the eviction, removing both the cached data and its metadata.
              return Promise.all([
                this.cache.invalidate('cache', evictUrl),
                this.cache.invalidate('metadata', evictUrl),
              ]);
            });
          }
          return maybeEvict;
        })
        // After all evictions, perform the insertion.
        .then(() => Promise.all([
          this.cache.store('cache', url, res),
          this.cache.store('metadata', url, this.adapter.newResponse(JSON.stringify(metadata))),
        ]))
        .then(() => {
          // After insertion is complete, track the changes in the in-memory metadata.
          this.metadata[url] = metadata;
          this.queue.insert(url);
        });
  }

  private updateIntoCache(url: string, res: Response): Promise<void> {
    const metadata = this.metadata[url];
    if (!metadata) {
      return Promise.reject(new Error(`updateIntoCache(${url}) but url is not cached`));
    }

    // Update metadata.
    metadata.accessCount++;
    metadata.addedTs = metadata.accessedTs = this.clock.dateNow();

    return Promise
        // Update both data and metadata.
        .all([
          this.cache.store('cache', url, res),
          this.cache.store('metadata', url, this.adapter.newResponse(JSON.stringify(metadata))),
        ])
        // Update the queue to properly track this entry.
        .then(() => {
          this.queue.remove(url);
          this.queue.insert(url);
        });
  }
}

/**
 * Compare two numbers, returning -1, 0, or 1 depending on order.
 */
function compare(a: number, b: number) {
  if (a < b) {
    return -1;
  } else if (a === b) {
    return 0;
  } else {
    return 1;
  }
}
