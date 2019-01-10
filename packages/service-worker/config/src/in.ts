/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @publicApi
 */
export type Glob = string;

/**
 * @publicApi
 */
export type Duration = string;

/**
 * A top-level Angular Service Worker configuration object.
 *
 * @publicApi
 */
export interface Config {
  appData?: {};
  index: string;
  assetGroups?: AssetGroup[];
  dataGroups?: DataGroup[];
  navigationUrls?: string[];
}

/**
 * Configuration for a particular group of assets.
 *
 * @publicApi
 */
export interface AssetGroup {
  name: string;
  installMode?: 'prefetch'|'lazy';
  updateMode?: 'prefetch'|'lazy';
  resources: {
    files?: Glob[];
    /** @deprecated As of v6 `versionedFiles` and `files` options have the same behavior. Use
       `files` instead. */
    versionedFiles?: Glob[];
    urls?: Glob[];
  };
}

/**
 * Configuration for a particular group of dynamic URLs.
 *
 * @publicApi
 */
export interface DataGroup {
  name: string;
  urls: Glob[];
  version?: number;
  cacheConfig: {
    maxSize: number; maxAge: Duration; timeout?: Duration; strategy?: 'freshness' | 'performance';
  };
}
