/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  createPlatformFactory,
  NgModule,
  platformCore,
  PlatformRef,
  StaticProvider,
} from '@angular/core';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {
  ɵINTERNAL_SERVER_PLATFORM_PROVIDERS as INTERNAL_SERVER_PLATFORM_PROVIDERS,
  ɵSERVER_RENDER_PROVIDERS as SERVER_RENDER_PROVIDERS,
} from '../../index';

const INTERNAL_SERVER_DYNAMIC_PLATFORM_TESTING_PROVIDERS: StaticProvider[] = [
  ...INTERNAL_SERVER_PLATFORM_PROVIDERS,
];

/**
 * Platform for testing
 *
 * @publicApi
 * @deprecated from v20.0.0, use e2e testing to verify SSR behavior.
 */
export const platformServerTesting: (extraProviders?: StaticProvider[]) => PlatformRef =
  createPlatformFactory(
    platformCore,
    'serverTesting',
    INTERNAL_SERVER_DYNAMIC_PLATFORM_TESTING_PROVIDERS,
  );

/**
 * NgModule for testing.
 *
 * @publicApi
 * @deprecated from v20.0.0, use e2e testing to verify SSR behavior.
 */
@NgModule({
  exports: [BrowserDynamicTestingModule],
  providers: SERVER_RENDER_PROVIDERS,
})
export class ServerTestingModule {}
