/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';
import {CacheState, NormalizedUrl, UpdateCacheStatus, UpdateSource} from './api';
import {AssetGroup, LazyAssetGroup, PrefetchAssetGroup} from './assets';
import {DataGroup} from './data';
import {Database} from './database';
import {DebugHandler} from './debug';
import {IdleScheduler} from './idle';
import {Manifest} from './manifest';


const BACKWARDS_COMPATIBILITY_NAVIGATION_URLS = [
  {positive: true, regex: '^/.*$'},
  {positive: false, regex: '^/.*\\.[^/]*$'},
  {positive: false, regex: '^/.*__'},
];

/**
 * A specific version of the application, identified by a unique manifest
 * as determined by its hash.
 *
 * Each `AppVersion` can be thought of as a published version of the app
 * that can be installed as an update to any previously installed versions.
 */
export class AppVersion implements UpdateSource {
  /**
   * A Map of absolute URL paths (`/foo.txt`) to the known hash of their contents (if available).
   */
  private hashTable = new Map<NormalizedUrl, string>();

  /**
   * All of the asset groups active in this version of the app.
   */
  private assetGroups: AssetGroup[];

  /**
   * All of the data groups active in this version of the app.
   */
  private dataGroups: DataGroup[];

  /**
   * Requests to URLs that match any of the `include` RegExps and none of the `exclude` RegExps
   * are considered navigation requests and handled accordingly.
   */
  private navigationUrls: {include: RegExp[], exclude: RegExp[]};

  /**
   * The normalized URL to the file that serves as the index page to satisfy navigation requests.
   * Usually this is `/index.html`.
   */
  private indexUrl = this.adapter.normalizeUrl(this.manifest.index);

  /**
   * Tracks whether the manifest has encountered any inconsistencies.
   */
  private _okay = true;

  get okay(): boolean {
    return this._okay;
  }

  constructor(
      private scope: ServiceWorkerGlobalScope, private adapter: Adapter, private database: Database,
      idle: IdleScheduler, private debugHandler: DebugHandler, readonly manifest: Manifest,
      readonly manifestHash: string) {
    // The hashTable within the manifest is an Object - convert it to a Map for easier lookups.
    Object.keys(manifest.hashTable).forEach(url => {
      this.hashTable.set(adapter.normalizeUrl(url), manifest.hashTable[url]);
    });

    // Process each `AssetGroup` declared in the manifest. Each declared group gets an `AssetGroup`
    // instance created for it, of a type that depends on the configuration mode.
    const assetCacheNamePrefix = `${manifestHash}:assets`;
    this.assetGroups = (manifest.assetGroups || []).map(config => {
      // Check the caching mode, which determines when resources will be fetched/updated.
      switch (config.installMode) {
        case 'prefetch':
          return new PrefetchAssetGroup(
              scope, adapter, idle, config, this.hashTable, database, assetCacheNamePrefix);
        case 'lazy':
          return new LazyAssetGroup(
              scope, adapter, idle, config, this.hashTable, database, assetCacheNamePrefix);
      }
    });

    // Process each `DataGroup` declared in the manifest.
    this.dataGroups =
        (manifest.dataGroups || [])
            .map(
                config => new DataGroup(
                    scope, adapter, config, database, debugHandler, `${config.version}:data`));

    // This keeps backwards compatibility with app versions without navigation urls.
    // Fix: https://github.com/angular/angular/issues/27209
    manifest.navigationUrls = manifest.navigationUrls || BACKWARDS_COMPATIBILITY_NAVIGATION_URLS;

    // Create `include`/`exclude` RegExps for the `navigationUrls` declared in the manifest.
    const includeUrls = manifest.navigationUrls.filter(spec => spec.positive);
    const excludeUrls = manifest.navigationUrls.filter(spec => !spec.positive);
    this.navigationUrls = {
      include: includeUrls.map(spec => new RegExp(spec.regex)),
      exclude: excludeUrls.map(spec => new RegExp(spec.regex)),
    };
  }

  /**
   * Fully initialize this version of the application. If this Promise resolves successfully, all
   * required
   * data has been safely downloaded.
   */
  async initializeFully(updateFrom?: UpdateSource): Promise<void> {
    try {
      // Fully initialize each asset group, in series. Starts with an empty Promise,
      // and waits for the previous groups to have been initialized before initializing
      // the next one in turn.
      await this.assetGroups.reduce<Promise<void>>(async (previous, group) => {
        // Wait for the previous groups to complete initialization. If there is a
        // failure, this will throw, and each subsequent group will throw, until the
        // whole sequence fails.
        await previous;

        // Initialize this group.
        return group.initializeFully(updateFrom);
      }, Promise.resolve());
    } catch (err) {
      this._okay = false;
      throw err;
    }
  }

  async handleFetch(req: Request, event: ExtendableEvent): Promise<Response|null> {
    // Check the request against each `AssetGroup` in sequence. If an `AssetGroup` can't handle the
    // request,
    // it will return `null`. Thus, the first non-null response is the SW's answer to the request.
    // So reduce
    // the group list, keeping track of a possible response. If there is one, it gets passed
    // through, and if
    // not the next group is consulted to produce a candidate response.
    const asset = await this.assetGroups.reduce(async (potentialResponse, group) => {
      // Wait on the previous potential response. If it's not null, it should just be passed
      // through.
      const resp = await potentialResponse;
      if (resp !== null) {
        return resp;
      }

      // No response has been found yet. Maybe this group will have one.
      return group.handleFetch(req, event);
    }, Promise.resolve<Response|null>(null));

    // The result of the above is the asset response, if there is any, or null otherwise. Return the
    // asset
    // response if there was one. If not, check with the data caching groups.
    if (asset !== null) {
      return asset;
    }

    // Perform the same reduction operation as above, but this time processing
    // the data caching groups.
    const data = await this.dataGroups.reduce(async (potentialResponse, group) => {
      const resp = await potentialResponse;
      if (resp !== null) {
        return resp;
      }

      return group.handleFetch(req, event);
    }, Promise.resolve<Response|null>(null));

    // If the data caching group returned a response, go with it.
    if (data !== null) {
      return data;
    }

    // Next, check if this is a navigation request for a route. Detect circular
    // navigations by checking if the request URL is the same as the index URL.
    if (this.adapter.normalizeUrl(req.url) !== this.indexUrl && this.isNavigationRequest(req)) {
      if (this.manifest.navigationRequestStrategy === 'freshness') {
        // For navigation requests the freshness was configured. The request will always go trough
        // the network and fallback to default `handleFetch` behavior in case of failure.
        try {
          return await this.scope.fetch(req);
        } catch {
          // Navigation request failed - application is likely offline.
          // Proceed forward to the default `handleFetch` behavior, where
          // `indexUrl` will be requested and it should be available in the cache.
        }
      }

      // This was a navigation request. Re-enter `handleFetch` with a request for
      // the URL.
      return this.handleFetch(this.adapter.newRequest(this.indexUrl), event);
    }

    return null;
  }

  /**
   * Determine whether the request is a navigation request.
   * Takes into account: Request mode, `Accept` header, `navigationUrls` patterns.
   */
  isNavigationRequest(req: Request): boolean {
    if (req.mode !== 'navigate') {
      return false;
    }

    if (!this.acceptsTextHtml(req)) {
      return false;
    }

    const urlPrefix = this.scope.registration.scope.replace(/\/$/, '');
    const url = req.url.startsWith(urlPrefix) ? req.url.substr(urlPrefix.length) : req.url;
    const urlWithoutQueryOrHash = url.replace(/[?#].*$/, '');

    return this.navigationUrls.include.some(regex => regex.test(urlWithoutQueryOrHash)) &&
        !this.navigationUrls.exclude.some(regex => regex.test(urlWithoutQueryOrHash));
  }

  /**
   * Check this version for a given resource with a particular hash.
   */
  async lookupResourceWithHash(url: NormalizedUrl, hash: string): Promise<Response|null> {
    // Verify that this version has the requested resource cached. If not,
    // there's no point in trying.
    if (!this.hashTable.has(url)) {
      return null;
    }

    // Next, check whether the resource has the correct hash. If not, any cached
    // response isn't usable.
    if (this.hashTable.get(url) !== hash) {
      return null;
    }

    const cacheState = await this.lookupResourceWithoutHash(url);
    return cacheState && cacheState.response;
  }

  /**
   * Check this version for a given resource regardless of its hash.
   */
  lookupResourceWithoutHash(url: NormalizedUrl): Promise<CacheState|null> {
    // Limit the search to asset groups, and only scan the cache, don't
    // load resources from the network.
    return this.assetGroups.reduce(async (potentialResponse, group) => {
      const resp = await potentialResponse;
      if (resp !== null) {
        return resp;
      }

      // fetchFromCacheOnly() avoids any network fetches, and returns the
      // full set of cache data, not just the Response.
      return group.fetchFromCacheOnly(url);
    }, Promise.resolve<CacheState|null>(null));
  }

  /**
   * List all unhashed resources from all asset groups.
   */
  previouslyCachedResources(): Promise<NormalizedUrl[]> {
    return this.assetGroups.reduce(
        async (resources, group) => (await resources).concat(await group.unhashedResources()),
        Promise.resolve<NormalizedUrl[]>([]));
  }

  async recentCacheStatus(url: string): Promise<UpdateCacheStatus> {
    return this.assetGroups.reduce(async (current, group) => {
      const status = await current;
      if (status === UpdateCacheStatus.CACHED) {
        return status;
      }
      const groupStatus = await group.cacheStatus(url);
      if (groupStatus === UpdateCacheStatus.NOT_CACHED) {
        return status;
      }
      return groupStatus;
    }, Promise.resolve(UpdateCacheStatus.NOT_CACHED));
  }

  /**
   * Return a list of the names of all caches used by this version.
   */
  async getCacheNames(): Promise<string[]> {
    const allGroupCacheNames = await Promise.all([
      ...this.assetGroups.map(group => group.getCacheNames()),
      ...this.dataGroups.map(group => group.getCacheNames()),
    ]);
    return ([] as string[]).concat(...allGroupCacheNames);
  }

  /**
   * Get the opaque application data which was provided with the manifest.
   */
  get appData(): Object|null {
    return this.manifest.appData || null;
  }

  /**
   * Check whether a request accepts `text/html` (based on the `Accept` header).
   */
  private acceptsTextHtml(req: Request): boolean {
    const accept = req.headers.get('Accept');
    if (accept === null) {
      return false;
    }
    const values = accept.split(',');
    return values.some(value => value.trim().toLowerCase() === 'text/html');
  }
}
