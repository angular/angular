/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DynamicGroup, DynamicStrategy, ResponseWithSideEffect, maybeRun} from '../group';
import {CacheConfig} from '../manifest';

/**
 * @experimental
 */
export interface PerformanceCacheConfig extends CacheConfig {
  optimizeFor: 'performance';

  refreshAheadMs?: number;
}

/**
 * A dynamic caching strategy which optimizes for the performance of requests
 * it serves, by placing the cache before the network.
 *
 * In the performance strategy, requests always hit the cache first. If cached
 * data is available it is returned immediately, and the network is not (usually)
 * consulted.
 *
 * An exception to this rule is if the user configures a `refreshAheadMs` age.
 * If cached responses are older than this configured age, a network request will
 * be made in the background to update them, even though the cached value is
 * returned to the consumer anyway. This allows caches to still be effective while
 * not letting them become too stale.
 *
 * If data is not available in the cache, it is fetched from the network and
 * cached.
 *
 * @experimental
 */
export class PerformanceStrategy implements DynamicStrategy {
  /**
   * Name of the strategy (matched to the value in `optimizeFor`).
   */
  get name(): string { return 'performance'; }

  /**
   * Reads the cache configuration from the group's config.
   */
  config(group: DynamicGroup): PerformanceCacheConfig {
    return group.config.cache as PerformanceCacheConfig;
  }

  /**
   * Makes a request using this strategy, falling back on the `delegate` if
   * the cache is not being used.
   */
  fetch(group: DynamicGroup, req: Request, delegate: () => Promise<Response>):
      Promise<ResponseWithSideEffect> {
    // Firstly, read the configuration.
    const config = this.config(group);

    return group
        // Attempt to load the data from the cache.
        .fetchFromCache(req)
        .then(rse => {
          // Check whether the cache had data.
          if (rse.response === null) {
            // No response found, fall back on the network.
            return group.fetchAndCache(req, delegate);
          } else if (
              !!rse.cacheAge && config.refreshAheadMs !== undefined &&
              rse.cacheAge >= config.refreshAheadMs) {
            // Response found, but it's old enough to trigger refresh ahead.
            // The side affect in rse.sideEffect is to update the metadata for the cache,
            // but that can be ignored since a fresh fetch will also update the metadata.
            // So return the cached response, but with a side effect that fetches from
            // the network and ignores the result, but runs that side effect instead
            // (which will update the cache to contain the new, fresh data).
            return {
              response: rse.response,
              cacheAge: rse.cacheAge,
              sideEffect: () => group
                                    // Fetch from the network again.
                                    .fetchAndCache(req, delegate)
                                    // And run the side effect if given.
                                    .then(raRse => maybeRun(raRse.sideEffect || null)),
            };
          } else {
            // Response found, and refresh ahead behavior was not triggered. Just return
            // the response directly.
            return rse;
          }
        });
  }
}
