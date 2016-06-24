/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationStrategy} from '@angular/common';
import {APP_ID, NgZone, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER} from '@angular/core';

import {AnimationDriver, NoOpAnimationDriver} from '../core_private';
import {BROWSER_APP_PROVIDERS} from '../src/browser';
import {BrowserDomAdapter} from '../src/browser/browser_adapter';
import {ELEMENT_PROBE_PROVIDERS} from '../src/dom/debug/ng_probe';

import {BrowserDetection} from './browser_util';


/**
 * Default platform providers for testing without a compiler.
 */
const TEST_BROWSER_STATIC_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  PLATFORM_COMMON_PROVIDERS,
  {provide: PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true}
];

const ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  {provide: APP_ID, useValue: 'a'}, ELEMENT_PROBE_PROVIDERS,
  {provide: NgZone, useFactory: createNgZone},
  {provide: AnimationDriver, useClass: NoOpAnimationDriver}
];


function initBrowserTests() {
  BrowserDomAdapter.makeCurrent();
  BrowserDetection.setup();
}

function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: true});
}


/**
 * Default platform providers for testing.
 */
export const TEST_BROWSER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS;

/**
 * Default application providers for testing without a compiler.
 */
export const TEST_BROWSER_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [BROWSER_APP_PROVIDERS, ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS];
