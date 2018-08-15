/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createPlatformFactory, NgModule, PlatformRef, StaticProvider} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';
import {ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS as INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from '@angular/platform-browser-dynamic';
import {BrowserTestingModule} from '@angular/platform-browser/testing';

import {DOMTestComponentRenderer} from './dom_test_component_renderer';
import {platformCoreDynamicTesting} from './platform_core_dynamic_testing';

export * from './private_export_testing';

/**
 * @publicApi
 */
export const platformBrowserDynamicTesting = createPlatformFactory(
    platformCoreDynamicTesting, 'browserDynamicTesting',
    INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

/**
 * NgModule for testing.
 *
 * @publicApi
 */
@NgModule({
  exports: [BrowserTestingModule],
  providers: [
    {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
  ]
})
export class BrowserDynamicTestingModule {
}
