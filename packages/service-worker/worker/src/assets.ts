/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';
import {CacheState, NormalizedUrl, UpdateCacheStatus, UpdateSource, UrlMetadata} from './api';
import {Database, Table} from './database';
import {CacheTable} from './db-cache';
import {errorToString, SwCriticalError, SwUnrecoverableStateError} from './error';
import {IdleScheduler} from './idle';
import {AssetGroupConfig} from './manifest';
import {NamedCache} from './named-cache-storage';
import {sha1Binary} from './sha1';

/**
 * A group of assets that are cached in a `Cache` and managed by a given policy.
 *
 * Concrete classes derive from this base and specify the exact caching policy.
 */
export abstract class AssetGroup {
  /**
   * A deduplication cache, to make sure the SW never makes two network requests
   * for the same resource at once. Managed by `fetchAndCacheOnce`.
   */
  private inFlightRequests = new Map<string, Promise<Response>>();

  /**
   * Normalized resource URLs.
   */
  protected urls: NormalizedUrl[] = [];

  /**
   * Regular expression patterns.
   */
  protected patterns: RegExp[] = [];

  /**
   * A Promise which resolves to the `Cache` used to back this asset group. This
   * is opened from the constructor.
   */
  protected cache: Promise<NamedCache>;

  /**
   * Group name from the configuration.
   */
  readonly name: string;

  /**
   * Metadata associated with specific cache entries.
   */
  protected metadata: Promise<Table>;

  constructor(
      protected scope: ServiceWorkerGlobalScope, protected adapter: Adapter,
      protected idle: IdleScheduler, protected config: AssetGroupConfig,
      protected hashes: Map<string, string>, protected db: Database, cacheNamePrefix: string) {
    this.name = config.name;

    // Normalize the config's URLs to take the ServiceWorker's scope into account.
    this.urls = config.urls.map(url => adapter.normalizeUrl(url));

    // Patterns in the config are regular expressions disguised as strings. Breathe life into them.
    this.patterns = config.patterns.map(pattern => new RegExp(pattern));

    // This is the primary cache, which holds all of the cached requests for this group. If a
    // resource isn't in this cache, it hasn't been fetched yet.
    this.cache = adapter.caches.open(`${cacheNamePrefix}:${config.name}:cache`);

    // This is the metadata table, which holds specific information for each cached URL, such as
    // the timestamp of when it was added to the cache.
    this.metadata =
        this.db.open(`${cacheNamePrefix}:${config.name}:meta`, config.cacheQueryOptions);
  }

  async cacheStatus(url: string): Promise<UpdateCacheStatus> {
    const cache = await this.cache;
    const meta = await this.metadata;
    const req = this.adapter.newRequest(url);
    const res = await cache.match(req, this.config.cacheQueryOptions);
    if (res === undefined) {
      return UpdateCacheStatus.NOT_CACHED;
    }
    try {
      const data = await meta.read<UrlMetadata>(req.url);
      if (!data.used) {
        return UpdateCacheStatus.CACHED_BUT_UNUSED;
      }
    } catch (_) {
      // Error on the side of safety and assume cached.
    }
    return UpdateCacheStatus.CACHED;
  }

  /**
   * Initialize this asset group, updating from the given source if available.
   */
  abstract initializeFully(updateFrom?: UpdateSource): Promise<void>;

  /**
   * Return a list of the names of all caches used by this group.
   */
  async getCacheNames(): Promise<string[]> {
    const [cache, metadata] = await Promise.all([
      this.cache,
      this.metadata as Promise<CacheTable>,
    ]);
    return [cache.name, metadata.cacheName];
  }

  /**
   * Process a request for a given resource and return it, or return null if it's not available.
   */
  async handleFetch(req: Request, _event: ExtendableEvent): Promise<Response|null> {
    const url = this.adapter.normalizeUrl(req.url);
    // Either the request matches one of the known resource URLs, one of the patterns for
    // dynamically matched URLs, or neither. Determine which is the case for this request in
    // order to decide how to handle it.
    if (this.urls.indexOf(url) !== -1 || this.patterns.some(pattern => pattern.test(url))) {
      // This URL matches a known resource. Either it's been cached already or it's missing, in
      // which case it needs to be loaded from the network.

      // Open the cache to check whether this resource is present.
      const cache = await this.cache;

      // Look for a cached response. If one exists, it can be used to resolve the fetch
      // operation.
      const cachedResponse = await cache.match(req, this.config.cacheQueryOptions);
      if (cachedResponse !== undefined) {
        // A response has already been cached (which presumably matches the hash for this
        // resource). Check whether it's safe to serve this resource from cache.
        if (this.hashes.has(url)) {
          // This resource has a hash, and thus is versioned by the manifest. It's safe to return
          // the response.
          return cachedResponse;
        } else {
          // This resource has no hash, and yet exists in the cache. Check how old this request is
          // to make sure it's still usable.
          if (await this.needToRevalidate(req, cachedResponse)) {
            this.idle.schedule(`revalidate(${cache.name}): ${req.url}`, async () => {
              await this.fetchAndCacheOnce(req);
            });
          }

          // In either case (revalidation or not), the cached response must be good.
          return cachedResponse;
        }
      }

      // No already-cached response exists, so attempt a fetch/cache operation.
      const res = await this.fetchAndCacheOnce(this.newRequestWithMetadata(req.url, req));

      // If this is successful, the response needs to be cloned as it might be used to respond to
      // multiple fetch operations at the same time.
      return res.clone();
    } else {
      return null;
    }
  }

  /**
   * Some resources are cached without a hash, meaning that their expiration is controlled
   * by HTTP caching headers. Check whether the given request/response pair is still valid
   * per the caching headers.
   */
  private async needToRevalidate(req: Request, res: Response): Promise<boolean> {
    // Three different strategies apply here:
    // 1) The request has a Cache-Control header, and thus expiration needs to be based on its age.
    // 2) The request has an Expires header, and expiration is based on the current timestamp.
    // 3) The request has no applicable caching headers, and must be revalidated.
    if (res.headers.has('Cache-Control')) {
      // Figure out if there is a max-age directive in the Cache-Control header.
      const cacheControl = res.headers.get('Cache-Control')!;
      const cacheDirectives =
          cacheControl
              // Directives are comma-separated within the Cache-Control header value.
              .split(',')
              // Make sure each directive doesn't have extraneous whitespace.
              .map(v => v.trim())
              // Some directives have values (like maxage and s-maxage)
              .map(v => v.split('='));

      // Lowercase all the directive names.
      cacheDirectives.forEach(v => v[0] = v[0].toLowerCase());

      // Find the max-age directive, if one exists.
      const maxAgeDirective = cacheDirectives.find(v => v[0] === 'max-age');
      const cacheAge = maxAgeDirective ? maxAgeDirective[1] : undefined;

      if (!cacheAge) {
        // No usable TTL defined. Must assume that the response is stale.
        return true;
      }
      try {
        const maxAge = 1000 * parseInt(cacheAge);

        // Determine the origin time of this request. If the SW has metadata on the request (which
        // it
        // should), it will have the time the request was added to the cache. If it doesn't for some
        // reason, the request may have a Date header which will serve the same purpose.
        let ts: number;
        try {
          // Check the metadata table. If a timestamp is there, use it.
          const metaTable = await this.metadata;
          ts = (await metaTable.read<UrlMetadata>(req.url)).ts;
        } catch {
          // Otherwise, look for a Date header.
          const date = res.headers.get('Date');
          if (date === null) {
            // Unable to determine when this response was created. Assume that it's stale, and
            // revalidate it.
            return true;
          }
          ts = Date.parse(date);
        }
        const age = this.adapter.time - ts;
        return age < 0 || age > maxAge;
      } catch {
        // Assume stale.
        return true;
      }
    } else if (res.headers.has('Expires')) {
      // Determine if the expiration time has passed.
      const expiresStr = res.headers.get('Expires')!;
      try {
        // The request needs to be revalidated if the current time is later than the expiration
        // time, if it parses correctly.
        return this.adapter.time > Date.parse(expiresStr);
      } catch {
        // The expiration date failed to parse, so revalidate as a precaution.
        return true;
      }
    } else {
      // No way to evaluate staleness, so assume the response is already stale.
      return true;
    }
  }

  /**
   * Fetch the complete state of a cached resource, or return null if it's not found.
   */
  async fetchFromCacheOnly(url: string): Promise<CacheState|null> {
    const cache = await this.cache;
    const metaTable = await this.metadata;

    // Lookup the response in the cache.
    const request = this.adapter.newRequest(url);
    const response = await cache.match(request, this.config.cacheQueryOptions);
    if (response === undefined) {
      // It's not found, return null.
      return null;
    }

    // Next, lookup the cached metadata.
    let metadata: UrlMetadata|undefined = undefined;
    try {
      metadata = await metaTable.read<UrlMetadata>(request.url);
    } catch {
      // Do nothing, not found. This shouldn't happen, but it can be handled.
    }

    // Return both the response and any available metadata.
    return {response, metadata};
  }

  /**
   * Lookup all resources currently stored in the cache which have no associated hash.
   */
  async unhashedResources(): Promise<NormalizedUrl[]> {
    const cache = await this.cache;
    // Start with the set of all cached requests.
    return (await cache.keys())
        // Normalize their URLs.
        .map(request => this.adapter.normalizeUrl(request.url))
        // Exclude the URLs which have hashes.
        .filter(url => !this.hashes.has(url));
  }

  /**
   * Fetch the given resource from the network, and cache it if able.
   */
  protected async fetchAndCacheOnce(req: Request, used: boolean = true): Promise<Response> {
    // The `inFlightRequests` map holds information about which caching operations are currently
    // underway for known resources. If this request appears there, another "thread" is already
    // in the process of caching it, and this work should not be duplicated.
    if (this.inFlightRequests.has(req.url)) {
      // There is a caching operation already in progress for this request. Wait for it to
      // complete, and hopefully it will have yielded a useful response.
      return this.inFlightRequests.get(req.url)!;
    }

    // No other caching operation is being attempted for this resource, so it will be owned here.
    // Go to the network and get the correct version.
    const fetchOp = this.fetchFromNetwork(req);

    // Save this operation in `inFlightRequests` so any other "thread" attempting to cache it
    // will block on this chain instead of duplicating effort.
    this.inFlightRequests.set(req.url, fetchOp);

    // Make sure this attempt is cleaned up properly on failure.
    try {
      // Wait for a response. If this fails, the request will remain in `inFlightRequests`
      // indefinitely.
      const res = await fetchOp;

      // It's very important that only successful responses are cached. Unsuccessful responses
      // should never be cached as this can completely break applications.
      if (!res.ok) {
        throw new Error(`Response not Ok (fetchAndCacheOnce): request for ${
            req.url} returned response ${res.status} ${res.statusText}`);
      }

      try {
        // This response is safe to cache (as long as it's cloned). Wait until the cache operation
        // is complete.
        const cache = await this.cache;
        await cache.put(req, res.clone());

        // If the request is not hashed, update its metadata, especially the timestamp. This is
        // needed for future determination of whether this cached response is stale or not.
        if (!this.hashes.has(this.adapter.normalizeUrl(req.url))) {
          // Metadata is tracked for requests that are unhashed.
          const meta: UrlMetadata = {ts: this.adapter.time, used};
          const metaTable = await this.metadata;
          await metaTable.write(req.url, meta);
        }

        return res;
      } catch (err) {
        // Among other cases, this can happen when the user clears all data through the DevTools,
        // but the SW is still running and serving another tab. In that case, trying to write to the
        // caches throws an `Entry was not found` error.
        // If this happens the SW can no longer work correctly. This situation is unrecoverable.
        throw new SwCriticalError(`Failed to update the caches for request to '${
            req.url}' (fetchAndCacheOnce): ${errorToString(err)}`);
      }
    } finally {
      // Finally, it can be removed from `inFlightRequests`. This might result in a double-remove
      // if some other chain was already making this request too, but that won't hurt anything.
      this.inFlightRequests.delete(req.url);
    }
  }

  protected async fetchFromNetwork(req: Request, redirectLimit: number = 3): Promise<Response> {
    // Make a cache-busted request for the resource.
    const res = await this.cacheBustedFetchFromNetwork(req);

    // Check for redirected responses, and follow the redirects.
    if ((res as any)['redirected'] && !!res.url) {
      // If the redirect limit is exhausted, fail with an error.
      if (redirectLimit === 0) {
        throw new SwCriticalError(
            `Response hit redirect limit (fetchFromNetwork): request redirected too many times, next is ${
                res.url}`);
      }

      // Unwrap the redirect directly.
      return this.fetchFromNetwork(this.newRequestWithMetadata(res.url, req), redirectLimit - 1);
    }

    return res;
  }

  /**
   * Load a particular asset from the network, accounting for hash validation.
   */
  protected async cacheBustedFetchFromNetwork(req: Request): Promise<Response> {
    const url = this.adapter.normalizeUrl(req.url);

    // If a hash is available for this resource, then compare the fetched version with the
    // canonical hash. Otherwise, the network version will have to be trusted.
    if (this.hashes.has(url)) {
      // It turns out this resource does have a hash. Look it up. Unless the fetched version
      // matches this hash, it's invalid and the whole manifest may need to be thrown out.
      const canonicalHash = this.hashes.get(url)!;

      // Ideally, the resource would be requested with cache-busting to guarantee the SW gets
      // the freshest version. However, doing this would eliminate any chance of the response
      // being in the HTTP cache. Given that the browser has recently actively loaded the page,
      // it's likely that many of the responses the SW needs to cache are in the HTTP cache and
      // are fresh enough to use. In the future, this could be done by setting cacheMode to
      // *only* check the browser cache for a cached version of the resource, when cacheMode is
      // fully supported. For now, the resource is fetched directly, without cache-busting, and
      // if the hash test fails a cache-busted request is tried before concluding that the
      // resource isn't correct. This gives the benefit of acceleration via the HTTP cache
      // without the risk of stale data, at the expense of a duplicate request in the event of
      // a stale response.

      // Fetch the resource from the network (possibly hitting the HTTP cache).
      let response = await this.safeFetch(req);

      // Decide whether a cache-busted request is necessary. A cache-busted request is necessary
      // only if the request was successful but the hash of the retrieved contents does not match
      // the canonical hash from the manifest.
      let makeCacheBustedRequest = response.ok;
      if (makeCacheBustedRequest) {
        // The request was successful. A cache-busted request is only necessary if the hashes
        // don't match.
        // (Make sure to clone the response so it can be used later if it proves to be valid.)
        const fetchedHash = sha1Binary(await response.clone().arrayBuffer());
        makeCacheBustedRequest = (fetchedHash !== canonicalHash);
      }

      // Make a cache busted request to the network, if necessary.
      if (makeCacheBustedRequest) {
        // Hash failure, the version that was retrieved under the default URL did not have the
        // hash expected. This could be because the HTTP cache got in the way and returned stale
        // data, or because the version on the server really doesn't match. A cache-busting
        // request will differentiate these two situations.
        // TODO: handle case where the URL has parameters already (unlikely for assets).
        const cacheBustReq = this.newRequestWithMetadata(this.cacheBust(req.url), req);
        response = await this.safeFetch(cacheBustReq);

        // If the response was successful, check the contents against the canonical hash.
        if (response.ok) {
          // Hash the contents.
          // (Make sure to clone the response so it can be used later if it proves to be valid.)
          const cacheBustedHash = sha1Binary(await response.clone().arrayBuffer());

          // If the cache-busted version doesn't match, then the manifest is not an accurate
          // representation of the server's current set of files, and the SW should give up.
          if (canonicalHash !== cacheBustedHash) {
            throw new SwCriticalError(`Hash mismatch (cacheBustedFetchFromNetwork): ${
                req.url}: expected ${canonicalHash}, got ${cacheBustedHash} (after cache busting)`);
          }
        }
      }

      // At this point, `response` is either successful with a matching hash or is unsuccessful.
      // Before returning it, check whether it failed with a 404 status. This would signify an
      // unrecoverable state.
      if (!response.ok && (response.status === 404)) {
        throw new SwUnrecoverableStateError(
            `Failed to retrieve hashed resource from the server. (AssetGroup: ${
                this.config.name} | URL: ${url})`);
      }

      // Return the response (successful or unsuccessful).
      return response;
    } else {
      // This URL doesn't exist in our hash database, so it must be requested directly.
      return this.safeFetch(req);
    }
  }

  /**
   * Possibly update a resource, if it's expired and needs to be updated. A no-op otherwise.
   */
  protected async maybeUpdate(updateFrom: UpdateSource, req: Request, cache: Cache):
      Promise<boolean> {
    const url = this.adapter.normalizeUrl(req.url);
    // Check if this resource is hashed and already exists in the cache of a prior version.
    if (this.hashes.has(url)) {
      const hash = this.hashes.get(url)!;

      // Check the caches of prior versions, using the hash to ensure the correct version of
      // the resource is loaded.
      const res = await updateFrom.lookupResourceWithHash(url, hash);

      // If a previously cached version was available, copy it over to this cache.
      if (res !== null) {
        // Copy to this cache.
        await cache.put(req, res);

        // No need to do anything further with this resource, it's now cached properly.
        return true;
      }
    }

    // No up-to-date version of this resource could be found.
    return false;
  }

  /**
   * Create a new `Request` based on the specified URL and `RequestInit` options, preserving only
   * metadata that are known to be safe.
   *
   * Currently, only headers are preserved.
   *
   * NOTE:
   *   Things like credential inclusion are intentionally omitted to avoid issues with opaque
   *   responses.
   *
   * TODO(gkalpak):
   *   Investigate preserving more metadata. See, also, discussion on preserving `mode`:
   *   https://github.com/angular/angular/issues/41931#issuecomment-1227601347
   */
  private newRequestWithMetadata(url: string, options: RequestInit): Request {
    return this.adapter.newRequest(url, {headers: options.headers});
  }

  /**
   * Construct a cache-busting URL for a given URL.
   */
  private cacheBust(url: string): string {
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'ngsw-cache-bust=' + Math.random();
  }

  protected async safeFetch(req: Request): Promise<Response> {
    try {
      return await this.scope.fetch(req);
    } catch {
      return this.adapter.newResponse('', {
        status: 504,
        statusText: 'Gateway Timeout',
      });
    }
  }
}

/**
 * An `AssetGroup` that prefetches all of its resources during initialization.
 */
export class PrefetchAssetGroup extends AssetGroup {
  override async initializeFully(updateFrom?: UpdateSource): Promise<void> {
    // Open the cache which actually holds requests.
    const cache = await this.cache;

    // Cache all known resources serially. As this reduce proceeds, each Promise waits
    // on the last before starting the fetch/cache operation for the next request. Any
    // errors cause fall-through to the final Promise which rejects.
    await this.urls.reduce(async (previous: Promise<void>, url: string) => {
      // Wait on all previous operations to complete.
      await previous;

      // Construct the Request for this url.
      const req = this.adapter.newRequest(url);

      // First, check the cache to see if there is already a copy of this resource.
      const alreadyCached = (await cache.match(req, this.config.cacheQueryOptions)) !== undefined;

      // If the resource is in the cache already, it can be skipped.
      if (alreadyCached) {
        return;
      }

      // If an update source is available.
      if (updateFrom !== undefined && await this.maybeUpdate(updateFrom, req, cache)) {
        return;
      }

      // Otherwise, go to the network and hopefully cache the response (if successful).
      await this.fetchAndCacheOnce(req, false);
    }, Promise.resolve());

    // Handle updating of unknown (unhashed) resources. This is only possible if there's
    // a source to update from.
    if (updateFrom !== undefined) {
      const metaTable = await this.metadata;

      // Select all of the previously cached resources. These are cached unhashed resources
      // from previous versions of the app, in any asset group.
      await (await updateFrom.previouslyCachedResources())
          // First, narrow down the set of resources to those which are handled by this group.
          // Either it's a known URL, or it matches a given pattern.
          .filter(
              url =>
                  this.urls.indexOf(url) !== -1 || this.patterns.some(pattern => pattern.test(url)))
          // Finally, process each resource in turn.
          .reduce(async (previous, url) => {
            await previous;
            const req = this.adapter.newRequest(url);

            // It's possible that the resource in question is already cached. If so,
            // continue to the next one.
            const alreadyCached =
                (await cache.match(req, this.config.cacheQueryOptions) !== undefined);
            if (alreadyCached) {
              return;
            }

            // Get the most recent old version of the resource.
            const res = await updateFrom.lookupResourceWithoutHash(url);
            if (res === null || res.metadata === undefined) {
              // Unexpected, but not harmful.
              return;
            }

            // Write it into the cache. It may already be expired, but it can still serve
            // traffic until it's updated (stale-while-revalidate approach).
            await cache.put(req, res.response);
            await metaTable.write(req.url, {...res.metadata, used: false} as UrlMetadata);
          }, Promise.resolve());
    }
  }
}

export class LazyAssetGroup extends AssetGroup {
  override async initializeFully(updateFrom?: UpdateSource): Promise<void> {
    // No action necessary if no update source is available - resources managed in this group
    // are all lazily loaded, so there's nothing to initialize.
    if (updateFrom === undefined) {
      return;
    }

    // Open the cache which actually holds requests.
    const cache = await this.cache;

    // Loop through the listed resources, caching any which are available.
    await this.urls.reduce(async (previous: Promise<void>, url: string) => {
      // Wait on all previous operations to complete.
      await previous;

      // Construct the Request for this url.
      const req = this.adapter.newRequest(url);

      // First, check the cache to see if there is already a copy of this resource.
      const alreadyCached = (await cache.match(req, this.config.cacheQueryOptions)) !== undefined;

      // If the resource is in the cache already, it can be skipped.
      if (alreadyCached) {
        return;
      }

      const updated = await this.maybeUpdate(updateFrom, req, cache);
      if (this.config.updateMode === 'prefetch' && !updated) {
        // If the resource was not updated, either it was not cached before or
        // the previously cached version didn't match the updated hash. In that
        // case, prefetch update mode dictates that the resource will be updated,
        // except if it was not previously utilized. Check the status of the
        // cached resource to see.

        const cacheStatus = await updateFrom.recentCacheStatus(url);

        // If the resource is not cached, or was cached but unused, then it will be
        // loaded lazily.
        if (cacheStatus !== UpdateCacheStatus.CACHED) {
          return;
        }

        // Update from the network.
        await this.fetchAndCacheOnce(req, false);
      }
    }, Promise.resolve());
  }
}
