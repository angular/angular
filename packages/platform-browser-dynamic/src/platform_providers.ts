/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID} from '@angular/common';
import {ResourceLoader} from '@angular/compiler';
import {COMPILER_OPTIONS, PLATFORM_ID, StaticProvider} from '@angular/core';

import {ɵINTERNAL_BROWSER_PLATFORM_PROVIDERS as INTERNAL_BROWSER_PLATFORM_PROVIDERS} from '@angular/platform-browser';

import {ResourceLoaderImpl} from './resource_loader/resource_loader_impl';

/**
 * @publicApi
 */
export const INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: StaticProvider[] = [
  INTERNAL_BROWSER_PLATFORM_PROVIDERS,
  {
    provide: COMPILER_OPTIONS,
    useValue: {providers: [{provide: ResourceLoader, useClass: ResourceLoaderImpl, deps: []}]},
    multi: true
  },
  {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
];
