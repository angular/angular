/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UrlConfig} from '@angular/service-worker/sdk';

/**
 * @experimental
 */
export interface DynamicManifest { group: GroupManifest[]; }

/**
 * @experimental
 */
export type GroupStrategy = 'backup' | 'cache' | 'staleWhileRefresh';

/**
 * @experimental
 */
export type UrlConfigMap = {
  [url: string]: UrlConfig
};

/**
 * @experimental
 */
export interface CacheConfig {
  optimizeFor: string;

  strategy: 'lru'|'lfu'|'fifo';
  maxAgeMs?: number;
  maxSizeBytes?: number;
  maxEntries: number;
}

/**
 * @experimental
 */
export interface GroupManifest {
  name: string;
  urls: UrlConfigMap;
  cache: CacheConfig;
}
