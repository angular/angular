/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {XHR} from '@angular/compiler';
import {COMPILER_OPTIONS} from '@angular/core';

import {INTERNAL_BROWSER_PLATFORM_PROVIDERS} from '../platform_browser_private';

import {XHRImpl} from './xhr/xhr_impl';

export const INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: any[] = [
  INTERNAL_BROWSER_PLATFORM_PROVIDERS,
  {
    provide: COMPILER_OPTIONS,
    useValue: {providers: [{provide: XHR, useClass: XHRImpl}]},
    multi: true
  },
];
