/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {platformCoreDynamicTesting} from '@angular/compiler/testing';
import {NgModule, PlatformRef, Provider, createPlatformFactory} from '@angular/core';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ɵINTERNAL_SERVER_PLATFORM_PROVIDERS as INTERNAL_SERVER_PLATFORM_PROVIDERS, ɵSERVER_RENDER_PROVIDERS as SERVER_RENDER_PROVIDERS} from '@angular/platform-server';


/**
 * Platform for testing
 *
 * @experimental API related to bootstrapping are still under review.
 */
export const platformServerTesting = createPlatformFactory(
    platformCoreDynamicTesting, 'serverTesting', INTERNAL_SERVER_PLATFORM_PROVIDERS);

/**
 * NgModule for testing.
 *
 * @experimental API related to bootstrapping are still under review.
 */
@NgModule({
  exports: [BrowserDynamicTestingModule],
  imports: [NoopAnimationsModule],
  providers: SERVER_RENDER_PROVIDERS
})
export class ServerTestingModule {
}
