/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Clock} from '@angular/service-worker/sdk';
import {DynamicGroup, DynamicStrategy, ResponseWithSideEffect, maybeRun} from '../group';
import {CacheConfig} from '../manifest';

/**
 * Extension of the caching configuration specifically for freshness-optimized
 * caching.
 *
 * @experimental
 */
export interface FreshnessCacheConfig extends CacheConfig {
  optimizeFor: 'freshness';

  /**
   * A timeout that if provided, will cause network requests to be abandoned
   * in favor of cached values if they take longer than the provided timeout.
   */
  networkTimeoutMs?: number;
}

/**
 * A dynamic caching strategy which optimizes for the freshness of data it
 * returns, by always attempting a server fetch first.
 *
 * In the freshness strategy, requests are always sent to the server first.
 * If the network request times out (according to the timeout value passed
 * in the configuration), cached values are used instead, if available.
 *
 * If the network request times out but the cache does not contain data,
 * the network value will still be returned eventually.
 *
 * Regardless of whether the request times out or not, if the network fetch
 * eventually completes then the result is cached for future use.
 *
 * @experimental
 */
export class FreshnessStrategy implements DynamicStrategy {
  /**
   * Name of the strategy (matched to the value in `optimizeFor`).
   */
  get name() { return 'freshness'; }

  /**
   * Reads the cache configuration from the group's config.
   */
  config(group: DynamicGroup): FreshnessCacheConfig {
    return group.config.cache as FreshnessCacheConfig;
  }

  /**
   * Makes a request using this strategy, falling back on the `delegate` if
   * the cache is not being used.
   */
  fetch(group: DynamicGroup, req: Request, delegate: () => Promise<Response>):
      Promise<ResponseWithSideEffect> {
    // Firstly, read the configuration.
    const config = this.config(group);
    const unrestrictedFetch =
        group
            // Make a request to the network and cache the result, irrespective of the
            // timeout.
            .fetchAndCache(req, delegate)
            // If this operation fails (note that a failed HTTP status code is still
            // counted as success, treat it as an unavailable response.
            // TODO: allow more control over what constitutes request failure and
            // what happens in the case of failure.
            .catch(() => ({ response: null } as ResponseWithSideEffect));

    // By default, wait for the network request indefinitely.
    let networkFetch = unrestrictedFetch;

    // If a timeout is defined, then only wait that long before reverting to
    // the cache.
    if (!!config.networkTimeoutMs) {
      // Race the indefinite fetch operation with a timer that returns a null
      // response after the configured network timeout.
      networkFetch = Promise.race([
        unrestrictedFetch,
        this.timeout(config.networkTimeoutMs, group.clock).then(() => ({response: null})),
      ]);
    }

    return networkFetch.then(rse => {
      if (rse.response === null) {
        // Network request failed or timed out. Check the cache to see if
        // this request is available there.
        return group.fetchFromCache(req).then(cacheRse => {
          // Regardless of whether the cache hit, the network request may
          // still be going, so set up a side effect that runs the cache
          // effect first and the network effect following. This ensures
          // the network result will be cached if/when it comes back.
          const sideEffect = () => maybeRun(cacheRse.sideEffect || null)
                                       .then(() => unrestrictedFetch)
                                       .then(netRse => maybeRun(netRse.sideEffect || null));

          // Check whether the cache had the data or not.
          if (cacheRse.response !== null) {
            // Cache hit, the response is available in the cache.
            return <ResponseWithSideEffect>{
              response: cacheRse.response,
              cacheAge: cacheRse.cacheAge, sideEffect
            };
          } else {
            // The cache was missing the data. Right now, just fall back
            // on the indefinite fetch from the network.
            return unrestrictedFetch;
          }
        });
      } else {
        // The network returned in time, no need to consult the cache.
        return rse;
      }
    });
  }

  /**
   * Constructs a promise that resolves after a delay.
   */
  private timeout(delay: number, clock: Clock): Promise<any> {
    return new Promise(resolve => clock.setTimeout(resolve, delay));
  }
}
