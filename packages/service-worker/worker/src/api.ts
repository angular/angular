/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export enum UpdateCacheStatus {
  NOT_CACHED,
  CACHED_BUT_UNUSED,
  CACHED,
}

/**
 * A `string` representing a URL that has been normalized relative to an origin (usually that of the
 * ServiceWorker).
 *
 * If the URL is relative to the origin, then it is represented by the path part only. Otherwise,
 * the full URL is used.
 *
 * NOTE: A `string` is not assignable to a `NormalizedUrl`, but a `NormalizedUrl` is assignable to a
 *       `string`.
 */
export type NormalizedUrl = string&{_brand: 'normalizedUrl'};

/**
 * A source for old versions of URL contents and other resources.
 *
 * Used to abstract away the fetching of old contents, to avoid a
 * circular dependency between the `Driver` and `AppVersion`. Without
 * this interface, `AppVersion` would need a reference to the `Driver`
 * to access information from other versions.
 */
export interface UpdateSource {
  /**
   * Lookup an older version of a resource for which the hash is known.
   *
   * If an old version of the resource doesn't exist, or exists but does
   * not match the hash given, this returns null.
   */
  lookupResourceWithHash(url: NormalizedUrl, hash: string): Promise<Response|null>;

  /**
   * Lookup an older version of a resource for which the hash is not known.
   *
   * This will return the most recent previous version of the resource, if
   * it exists. It returns a `CacheState` object which encodes not only the
   * `Response`, but the cache metadata needed to re-cache the resource in
   * a newer `AppVersion`.
   */
  lookupResourceWithoutHash(url: NormalizedUrl): Promise<CacheState|null>;

  /**
   * List the URLs of all of the resources which were previously cached.
   *
   * This allows for the discovery of resources which are not listed in the
   * manifest but which were picked up because they matched URL patterns.
   */
  previouslyCachedResources(): Promise<NormalizedUrl[]>;

  /**
   * Check whether a particular resource exists in the most recent cache.
   *
   * This returns a state value which indicates whether the resource was
   * cached at all and whether that cache was utilized.
   */
  recentCacheStatus(url: string): Promise<UpdateCacheStatus>;
}

/**
 * Metadata cached along with a URL.
 */
export interface UrlMetadata {
  /**
   * The timestamp, in UNIX time in milliseconds, of when this URL was stored
   * in the cache.
   */
  ts: number;

  /**
   * Whether the resource was requested before for this particular cached
   * instance.
   */
  used: boolean;
}

/**
 * The fully cached state of a resource, including both the `Response` itself
 * and the cache metadata.
 */
export interface CacheState {
  response: Response;
  metadata?: UrlMetadata;
}

export interface DebugLogger {
  log(value: string|Error, context?: string): void;
}

export interface DebugState {
  state: string;
  why: string;
  latestHash: string|null;
  lastUpdateCheck: number|null;
}

export interface DebugVersion {
  hash: string;
  manifest: Object;
  clients: string[];
  status: string;
}

export interface DebugIdleState {
  queue: string[];
  lastTrigger: number|null;
  lastRun: number|null;
}

export interface Debuggable {
  debugState(): Promise<DebugState>;
  debugVersions(): Promise<DebugVersion[]>;
  debugIdleState(): Promise<DebugIdleState>;
}
