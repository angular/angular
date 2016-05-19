import {APP_ID, NgZone, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER} from '@angular/core';
import {BROWSER_APP_COMMON_PROVIDERS} from '../src/platform/common/browser';
import {BrowserDomAdapter} from '../src/browser/browser_adapter';
import {AnimationBuilder} from '../src/animate/animation_builder';
import {MockAnimationBuilder} from './animation_builder_mock';
import {MockLocationStrategy} from '@angular/common/testing';
import {LocationStrategy} from '@angular/common';
import {MockNgZone} from '@angular/core/testing';
import {BrowserDetection} from './browser_util';
import {Log} from '@angular/core/testing';
import {ELEMENT_PROBE_PROVIDERS} from '../src/dom/debug/ng_probe';
import {IS_DART} from '../src/facade/lang';

function initBrowserTests() {
  BrowserDomAdapter.makeCurrent();
  BrowserDetection.setup();
}

function createNgZone(): NgZone {
  return IS_DART ? new MockNgZone() : new NgZone({enableLongStackTrace: true});
}

/**
 * Default platform providers for testing without a compiler.
 */
export const TEST_BROWSER_STATIC_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      PLATFORM_COMMON_PROVIDERS,
      /*@ts2dart_Provider*/{provide: PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true}
    ];

export const ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      /*@ts2dart_Provider*/ {provide: APP_ID, useValue: 'a'},
      ELEMENT_PROBE_PROVIDERS,
      Log,
      /*@ts2dart_Provider*/ {provide: NgZone, useFactory: createNgZone},
      /*@ts2dart_Provider*/ {provide: LocationStrategy, useClass: MockLocationStrategy},
      /*@ts2dart_Provider*/ {provide: AnimationBuilder, useClass: MockAnimationBuilder}
    ];

/**
 * Default application providers for testing without a compiler.
 */
export const TEST_BROWSER_STATIC_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[BROWSER_APP_COMMON_PROVIDERS, ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS];
