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
import {INTERNAL_SERVER_PLATFORM_PROVIDERS} from './private_import_platform_server';


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
@NgModule({exports: [BrowserDynamicTestingModule]})
export class ServerTestingModule {
}
