import {APP_ID, NgZone, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER} from '@angular/core';
import {BROWSER_APP_PROVIDERS} from '../src/browser';
import {BrowserDomAdapter} from '../src/browser/browser_adapter';
import {AnimationBuilder} from '../src/animate/animation_builder';
import {MockAnimationBuilder} from './animation_builder_mock';
import {MockLocationStrategy} from '@angular/common/testing';
import {LocationStrategy} from '@angular/common';
import {BrowserDetection} from './browser_util';
import {Log} from '@angular/core/testing';
import {ELEMENT_PROBE_PROVIDERS} from '../src/dom/debug/ng_probe';

/**
 * Default platform providers for testing without a compiler.
 */
export const TEST_BROWSER_STATIC_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [
      PLATFORM_COMMON_PROVIDERS,
      {provide: PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true}
    ];

export const ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [
      {provide: APP_ID, useValue: 'a'},
      ELEMENT_PROBE_PROVIDERS,
      Log,
      {provide: NgZone, useFactory: createNgZone},
      {provide: LocationStrategy, useClass: MockLocationStrategy},
      {provide: AnimationBuilder, useClass: MockAnimationBuilder}
    ];

/**
 * Default application providers for testing without a compiler.
 */
export const TEST_BROWSER_STATIC_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [BROWSER_APP_PROVIDERS, ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS];

function initBrowserTests() {
  BrowserDomAdapter.makeCurrent();
  BrowserDetection.setup();
}

function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: true});
}
