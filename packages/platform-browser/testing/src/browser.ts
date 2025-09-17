/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵprovideFakePlatformNavigation} from '@angular/common/testing';
import {
  APP_ID,
  createPlatformFactory,
  NgModule,
  StaticProvider,
  ɵprovideZonelessChangeDetectionInternal as provideZonelessChangeDetectionInternal,
  ɵinternalProvideZoneChangeDetection as internalProvideZoneChangeDetection,
  PlatformRef,
} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';
import {BrowserModule, platformBrowser} from '../../index';
import {DOMTestComponentRenderer} from './dom_test_component_renderer';

const ZONELESS_BY_DEFAULT = true;

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
