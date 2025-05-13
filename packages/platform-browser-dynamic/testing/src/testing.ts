/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createPlatformFactory, NgModule, PlatformRef, StaticProvider} from '@angular/core';
import {platformBrowserDynamic} from '../../index';
import {BrowserTestingModule} from '@angular/platform-browser/testing';

/**
 * @publicApi
 */
export const platformBrowserDynamicTesting: (extraProviders?: StaticProvider[]) => PlatformRef =
  createPlatformFactory(platformBrowserDynamic, 'browserDynamicTesting');

/**
 * NgModule for testing.
 *
 * @publicApi
 */
@NgModule({
  exports: [BrowserTestingModule],
})
export class BrowserDynamicTestingModule {}
