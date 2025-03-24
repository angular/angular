/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createPlatformFactory, NgModule, platformCore, StaticProvider} from '@angular/core';
import {ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS as INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from '@angular/platform-browser-dynamic';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {
  ɵINTERNAL_SERVER_PLATFORM_PROVIDERS as INTERNAL_SERVER_PLATFORM_PROVIDERS,
  ɵSERVER_RENDER_PROVIDERS as SERVER_RENDER_PROVIDERS,
} from '@angular/platform-server';

const INTERNAL_SERVER_DYNAMIC_PLATFORM_TESTING_PROVIDERS: StaticProvider[] = [
  ...INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  ...INTERNAL_SERVER_PLATFORM_PROVIDERS,
];

/**
 * Platform for testing
 *
 * @publicApi
 */
export const platformServerTesting = createPlatformFactory(
  platformCore,
  'serverTesting',
  INTERNAL_SERVER_DYNAMIC_PLATFORM_TESTING_PROVIDERS,
);

/**
 * NgModule for testing.
 *
 * @publicApi
 */
@NgModule({
  exports: [BrowserDynamicTestingModule],
  providers: SERVER_RENDER_PROVIDERS,
})
export class ServerTestingModule {}
