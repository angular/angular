/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {PlatformLocation} from '@angular/common';
import {MockPlatformLocation} from '@angular/common/testing';
import {
  APP_ID,
  createPlatformFactory,
  NgModule,
  PLATFORM_INITIALIZER,
  platformCore,
  StaticProvider,
  ɵinternalProvideZoneChangeDetection as internalProvideZoneChangeDetection,
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  ɵChangeDetectionSchedulerImpl as ChangeDetectionSchedulerImpl,
} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';
import {BrowserModule, ɵBrowserDomAdapter as BrowserDomAdapter} from '@angular/platform-browser';
import {DOMTestComponentRenderer} from './dom_test_component_renderer';

function initBrowserTests() {
  BrowserDomAdapter.makeCurrent();
}

const _TEST_BROWSER_PLATFORM_PROVIDERS: StaticProvider[] = [
  {provide: PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true},
];

/**
 * Platform for testing
 *
 * @publicApi
 */
export const platformBrowserTesting = createPlatformFactory(
  platformCore,
  'browserTesting',
  _TEST_BROWSER_PLATFORM_PROVIDERS,
);

/**
 * NgModule for testing.
 *
 * @publicApi
 */
@NgModule({
  exports: [BrowserModule],
  providers: [
    {provide: APP_ID, useValue: 'a'},
    internalProvideZoneChangeDetection({}),
    {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
    {provide: PlatformLocation, useClass: MockPlatformLocation},
    {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
  ],
})
export class BrowserTestingModule {}
