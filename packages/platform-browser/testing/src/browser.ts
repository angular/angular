/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵprovideFakePlatformNavigation} from '@angular/common/testing';
import {APP_ID, createPlatformFactory, NgModule, StaticProvider, PlatformRef} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';
// g3-only import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {BrowserModule, platformBrowser} from '../../index'; // 3p-only
import {DOMTestComponentRenderer} from './dom_test_component_renderer';

/**
 * Platform for testing
 *
 * @publicApi
 */
export const platformBrowserTesting: (extraProviders?: StaticProvider[]) => PlatformRef =
  createPlatformFactory(platformBrowser, 'browserTesting');

/**
 * NgModule for testing.
 *
 * @publicApi
 */
@NgModule({
  exports: [BrowserModule],
  providers: [
    {provide: APP_ID, useValue: 'a'},
    ɵprovideFakePlatformNavigation(),
    {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
  ],
})
export class BrowserTestingModule {}
