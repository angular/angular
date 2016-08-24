/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader} from '@angular/compiler';
import {COMPILER_OPTIONS, Provider} from '@angular/core';

import {INTERNAL_BROWSER_PLATFORM_PROVIDERS} from './private_import_platform-browser';

import {ResourceLoaderImpl} from './resource_loader/resource_loader_impl';

export const INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: Provider[] = [
  INTERNAL_BROWSER_PLATFORM_PROVIDERS,
  {
    provide: COMPILER_OPTIONS,
    useValue: {providers: [{provide: ResourceLoader, useClass: ResourceLoaderImpl}]},
    multi: true
  },
];
