/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverridingTestComponentBuilder, platformCoreDynamicTesting} from '@angular/compiler/testing';
import {NgModule, PlatformRef, createPlatformFactory} from '@angular/core';
import {TestComponentBuilder, TestComponentRenderer} from '@angular/core/testing';
import {BrowserTestingModule} from '@angular/platform-browser/testing';

import {INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from './src/platform_providers';
import {DOMTestComponentRenderer} from './testing/dom_test_component_renderer';

export * from './private_export_testing'

/**
 * @experimental API related to bootstrapping are still under review.
 */
export const platformBrowserDynamicTesting = createPlatformFactory(
    platformCoreDynamicTesting, 'browserDynamicTesting',
    INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

/**
 * NgModule for testing.
 *
 * @stable
 */
@NgModule({
  exports: [BrowserTestingModule],
  providers: [
    {provide: TestComponentBuilder, useClass: OverridingTestComponentBuilder},
    {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
  ]
})
export class BrowserDynamicTestingModule {
}
