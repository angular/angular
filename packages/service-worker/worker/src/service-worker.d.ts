/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference lib="webworker" />

export declare global {
  interface ServiceWorkerGlobalScope {
    /**
     * Disallow accessing `CacheStorage APIs directly to ensure that all accesses go through a
     * `NamedCacheStorage` instance (exposed by the `Adapter`).
     */
    caches: unknown;
  }
}
