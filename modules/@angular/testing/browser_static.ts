import {
  APP_ID,
  NgZone,
  Provider,
  PLATFORM_COMMON_PROVIDERS,
  PLATFORM_INITIALIZER
} from '@angular/core';
import {DirectiveResolver, ViewResolver} from '@angular/compiler';
import {BROWSER_APP_COMMON_PROVIDERS} from '@angular/platform-browser';
import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
import {AnimationBuilder} from '@angular/platform-browser/src/animate/animation_builder';
import {MockAnimationBuilder} from './src/mock/animation_builder_mock';
import {MockDirectiveResolver} from './src/mock/directive_resolver_mock';
import {MockViewResolver} from './src/mock/view_resolver_mock';
import {MockLocationStrategy} from './src/mock/mock_location_strategy';
import {LocationStrategy} from '@angular/common';
import {MockNgZone} from './src/mock/ng_zone_mock';
import {XHRImpl} from '@angular/platform-browser/src/browser/xhr_impl';
import {XHR} from '@angular/compiler';
import {TestComponentBuilder} from '@angular/testing/src/test_component_builder';
import {BrowserDetection} from '@angular/testing/src/utils';
import {CONST_EXPR} from '@angular/facade';
import {Log} from '@angular/testing/src/utils';
import {ELEMENT_PROBE_PROVIDERS} from '@angular/platform-browser/src/dom/debug/ng_probe';

function initBrowserTests() {
  BrowserDomAdapter.makeCurrent();
  BrowserDetection.setup();
}

/**
 * Default platform providers for testing without a compiler.
 */
export const TEST_BROWSER_STATIC_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    CONST_EXPR([
      PLATFORM_COMMON_PROVIDERS,
      new Provider(PLATFORM_INITIALIZER, {useValue: initBrowserTests, multi: true})
    ]);

export const ADDITIONAL_TEST_BROWSER_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    CONST_EXPR([
      new Provider(APP_ID, {useValue: 'a'}),
      ELEMENT_PROBE_PROVIDERS,
      new Provider(DirectiveResolver, {useClass: MockDirectiveResolver}),
      new Provider(ViewResolver, {useClass: MockViewResolver}),
      Log,
      TestComponentBuilder,
      new Provider(NgZone, {useClass: MockNgZone}),
      new Provider(LocationStrategy, {useClass: MockLocationStrategy}),
      new Provider(AnimationBuilder, {useClass: MockAnimationBuilder}),
    ]);

/**
 * Default application providers for testing without a compiler.
 */
export const TEST_BROWSER_STATIC_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    CONST_EXPR([
      BROWSER_APP_COMMON_PROVIDERS,
      new Provider(XHR, {useClass: XHRImpl}),
      ADDITIONAL_TEST_BROWSER_PROVIDERS
    ]);
