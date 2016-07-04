/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationStrategy} from '@angular/common';
import {APP_ID, AppModule, NgZone, OpaqueToken, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER, PlatformRef, ReflectiveInjector, assertPlatform, createPlatform, getPlatform} from '@angular/core';

import {BROWSER_APP_PROVIDERS, BrowserModule} from '../src/browser';
import {BrowserDomAdapter} from '../src/browser/browser_adapter';
import {AnimationDriver} from '../src/dom/animation_driver';
import {ELEMENT_PROBE_PROVIDERS} from '../src/dom/debug/ng_probe';

import {BrowserDetection} from './browser_util';

const BROWSER_TEST_PLATFORM_MARKER = new OpaqueToken('BrowserTestPlatformMarker');

function initBrowserTests() {
  BrowserDomAdapter.makeCurrent();
  BrowserDetection.setup();
}

function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: true});
}

const TEST_BROWSER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  PLATFORM_COMMON_PROVIDERS, {provide: BROWSER_TEST_PLATFORM_MARKER, useValue: true},
  {provide: PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true}
];

/**
 * Platform for testing
 *
 * @experimental API related to bootstrapping are still under review.
 */
export function browserTestPlatform(): PlatformRef {
  if (!getPlatform()) {
    createPlatform(ReflectiveInjector.resolveAndCreate(TEST_BROWSER_PLATFORM_PROVIDERS));
  }
  return assertPlatform(BROWSER_TEST_PLATFORM_MARKER);
}

/**
 * AppModule for testing.
 *
 * @stable
 */
@AppModule({
  modules: [BrowserModule],
  providers: [
    {provide: APP_ID, useValue: 'a'}, ELEMENT_PROBE_PROVIDERS,
    {provide: NgZone, useFactory: createNgZone},
    {provide: AnimationDriver, useValue: AnimationDriver.NOOP}
  ]
})
export class BrowserTestModule {
}
