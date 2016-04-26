import {
  APP_ID,
  NgZone,
  Provider,
  PLATFORM_COMMON_PROVIDERS,
  PLATFORM_INITIALIZER,
  APPLICATION_COMMON_PROVIDERS,
  Renderer
} from '@angular/core';
import {DirectiveResolver, ViewResolver} from '@angular/compiler';

import {Parse5DomAdapter} from '@angular/platform-server';

import {AnimationBuilder} from '@angular/platform-browser/src/animate/animation_builder';
import {MockAnimationBuilder} from './src/mock/animation_builder_mock';
import {MockDirectiveResolver} from './src/mock/directive_resolver_mock';
import {MockViewResolver} from './src/mock/view_resolver_mock';
import {MockLocationStrategy} from './src/mock/mock_location_strategy';
import {MockNgZone} from './src/mock/ng_zone_mock';

import {TestComponentBuilder} from '@angular/testing/src/test_component_builder';
import {XHR} from '@angular/compiler/src/xhr';
import {BrowserDetection} from '@angular/testing/src/utils';

import {COMPILER_PROVIDERS} from '@angular/compiler/src/compiler';
import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {DOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {RootRenderer} from '@angular/core/src/render/api';
import {DomRootRenderer, DomRootRenderer_} from '@angular/platform-browser/src/dom/dom_renderer';
import {DomSharedStylesHost, SharedStylesHost} from '@angular/platform-browser/src/dom/shared_styles_host';

import {
  EventManager,
  EVENT_MANAGER_PLUGINS,
  ELEMENT_PROBE_PROVIDERS
} from '@angular/platform-browser';
import {DomEventsPlugin} from '@angular/platform-browser/src/dom/events/dom_events';
import {LocationStrategy} from '@angular/common';
import {Log} from '@angular/testing/src/utils';

function initServerTests() {
  Parse5DomAdapter.makeCurrent();
  BrowserDetection.setup();
}

/**
 * Default platform providers for testing.
 */
export const TEST_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/ ([
      PLATFORM_COMMON_PROVIDERS,
      {provide: PLATFORM_INITIALIZER, useValue: initServerTests, multi: true}
    ]);

function appDoc() {
  try {
    return DOM.defaultDoc();
  } catch (e) {
    return null;
  }
}

/**
 * Default application providers for testing.
 */
export const TEST_SERVER_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/ ([
      // TODO(julie): when angular2/platform/server is available, use that instead of making our own
      // list here.
      APPLICATION_COMMON_PROVIDERS,
      COMPILER_PROVIDERS,
      {provide: DOCUMENT, useFactory: appDoc},
      {provide: DomRootRenderer, useClass: DomRootRenderer_},
      {provide: RootRenderer, useExisting: DomRootRenderer},
      EventManager,
      {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
      {provide: XHR, useClass: XHR},
      {provide: APP_ID, useValue: 'a'},
      {provide: SharedStylesHost, useExisting: DomSharedStylesHost},
      DomSharedStylesHost,
      ELEMENT_PROBE_PROVIDERS,
      {provide: DirectiveResolver, useClass: MockDirectiveResolver},
      {provide: ViewResolver, useClass: MockViewResolver},
      Log,
      TestComponentBuilder,
      {provide: NgZone, useClass: MockNgZone},
      {provide: LocationStrategy, useClass: MockLocationStrategy},
      {provide: AnimationBuilder, useClass: MockAnimationBuilder},
    ]);
