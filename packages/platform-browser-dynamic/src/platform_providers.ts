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
  PlatformRef,
  StaticProvider,
} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';
import {ResourceLoader} from '@angular/compiler';
import {ResourceLoaderImpl} from './resource_loader/resource_loader_impl';
import {JitCompilerFactory} from './compiler_factory';

const INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: StaticProvider[] = [
  {
    provide: COMPILER_OPTIONS,
    useValue: {providers: [{provide: ResourceLoader, useClass: ResourceLoaderImpl, deps: []}]},
    multi: true,
  },
  {provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS]},
];

/**
 * @deprecated Use the `platformBrowser` function instead from `@angular/platform-browser`.
 * In case you are not in a CLI app and rely on JIT compilation, you will also need to import `@angular/compiler`
 */
export const platformBrowserDynamic: (extraProviders?: StaticProvider[]) => PlatformRef =
  createPlatformFactory(
    platformBrowser,
    'browserDynamic',
    INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  );
