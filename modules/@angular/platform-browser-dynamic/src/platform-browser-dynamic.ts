/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader, platformCoreDynamic} from '@angular/compiler';
import {PlatformRef, Provider, createPlatformFactory} from '@angular/core';

import {INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from './platform_providers';
import {CachedResourceLoader} from './resource_loader/resource_loader_cache';

export * from './private_export';

/**
 * @experimental
 */
export const RESOURCE_CACHE_PROVIDER: Provider[] =
    [{provide: ResourceLoader, useClass: CachedResourceLoader}];

/**
 * @experimental API related to bootstrapping are still under review.
 */
export const platformBrowserDynamic = createPlatformFactory(
    platformCoreDynamic, 'browserDynamic', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);
