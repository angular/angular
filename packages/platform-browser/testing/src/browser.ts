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
  StaticProvider,
  ɵinternalProvideZoneChangeDetection as internalProvideZoneChangeDetection,
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  ɵChangeDetectionSchedulerImpl as ChangeDetectionSchedulerImpl,
} from '@angular/core';
import {TestComponentRenderer} from '@angular/core/testing';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {DOMTestComponentRenderer} from './dom_test_component_renderer';

/**
 * Platform for testing
 *
 * @publicApi
 */
export const platformBrowserTesting = createPlatformFactory(platformBrowser, 'browserTesting');

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
