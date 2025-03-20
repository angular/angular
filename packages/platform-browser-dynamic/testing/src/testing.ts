/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createPlatformFactory, NgModule, PlatformRef, StaticProvider} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserTestingModule} from '@angular/platform-browser/testing';

/**
 * @publicApi
 */
export const platformBrowserDynamicTesting = createPlatformFactory(
  platformBrowserDynamic,
  'browserDynamicTesting',
);

/**
 * NgModule for testing.
 *
 * @publicApi
 */
@NgModule({
  exports: [BrowserTestingModule],
})
export class BrowserDynamicTestingModule {}
