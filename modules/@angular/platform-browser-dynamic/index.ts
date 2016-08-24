/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader, platformCoreDynamic} from '@angular/compiler';
import {COMPILER_OPTIONS, ClassProvider, ExistingProvider, FactoryProvider, PlatformRef, Provider, TypeProvider, ValueProvider, createPlatformFactory} from '@angular/core';
import {WORKER_SCRIPT, platformWorkerUi} from '@angular/platform-browser';

import {INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from './src/platform_providers';
import {CachedResourceLoader} from './src/resource_loader/resource_loader_cache';
import {ResourceLoaderImpl} from './src/resource_loader/resource_loader_impl';



/**
 * @experimental
 */
export const RESOURCE_CACHE_PROVIDER: Provider[] =
    [{provide: ResourceLoader, useClass: CachedResourceLoader}];

/**
 * @stable
 */
export const platformBrowserDynamic = createPlatformFactory(
    platformCoreDynamic, 'browserDynamic', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

/**
 * Bootstraps the worker ui.
 *
 * @experimental WebWorker support is currently experimental
 */
export function bootstrapWorkerUi(
    workerScriptUri: string, customProviders: Provider[] = []): Promise<PlatformRef> {
  // For now, just creates the worker ui platform...
  return Promise.resolve(platformWorkerUi(([{
                                            provide: WORKER_SCRIPT,
                                            useValue: workerScriptUri,
                                          }] as Provider[])
                                              .concat(customProviders)));
}

/**
 * @experimental WebWorker support is currently experimental
 */
export const platformWorkerAppDynamic = createPlatformFactory(
    platformCoreDynamic, 'workerAppDynamic', [{
      provide: COMPILER_OPTIONS,
      useValue: {providers: [{provide: ResourceLoader, useClass: ResourceLoaderImpl}]},
      multi: true
    }]);

function normalizeArray(arr: any[]): any[] {
  return arr ? arr : [];
}
