/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  COMPILER_OPTIONS,
  CompilerFactory,
  createPlatformFactory,
  StaticProvider,
} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';
import {ResourceLoader} from '@angular/compiler';
import {ResourceLoaderImpl} from './resource_loader/resource_loader_impl';
import {JitCompilerFactory} from './compiler_factory';

export const INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: StaticProvider[] = [
  {
    provide: COMPILER_OPTIONS,
    useValue: {providers: [{provide: ResourceLoader, useClass: ResourceLoaderImpl, deps: []}]},
    multi: true,
  },
  {provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS]},
];

/**
 * @publicApi
 */
export const platformBrowserDynamic = createPlatformFactory(
  platformBrowser,
  'browserDynamic',
  INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
);
