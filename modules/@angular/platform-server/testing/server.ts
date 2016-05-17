import {
  APP_ID,
  NgZone,
  PLATFORM_COMMON_PROVIDERS,
  PLATFORM_INITIALIZER,
  APPLICATION_COMMON_PROVIDERS,
  RootRenderer
} from '@angular/core';
import {DirectiveResolver, ViewResolver, XHR, COMPILER_PROVIDERS} from '@angular/compiler';
import {
  TestComponentBuilder,
  MockDirectiveResolver,
  MockViewResolver,
  TestComponentRenderer
} from '@angular/compiler/testing';
import {Parse5DomAdapter} from '../index';
import {AnimationBuilder} from '../../platform-browser/src/animate/animation_builder';
import {MockAnimationBuilder} from '../../platform-browser/testing/animation_builder_mock';
import {MockLocationStrategy} from '../../common/testing/mock_location_strategy';
import {BrowserDetection, DOMTestComponentRenderer} from '@angular/platform-browser/testing';
import {
  DOCUMENT,
  BROWSER_SANITIZATION_PROVIDERS,
  EventManager,
  EVENT_MANAGER_PLUGINS,
  ELEMENT_PROBE_PROVIDERS,
  DomEventsPlugin
} from '@angular/platform-browser';
import {getDOM} from '../platform_browser_private';
import {DomRootRenderer, DomRootRenderer_} from '../../platform-browser/src/dom/dom_renderer';
import {DomSharedStylesHost, SharedStylesHost} from '../../platform-browser/src/dom/shared_styles_host';
import {LocationStrategy} from '@angular/common';
import {Log} from '@angular/core/testing';

function initServerTests() {
  Parse5DomAdapter.makeCurrent();
  BrowserDetection.setup();
}

/**
 * Default platform providers for testing.
 */
export const TEST_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      PLATFORM_COMMON_PROVIDERS,
      /*@ts2dart_Provider*/ {provide: PLATFORM_INITIALIZER, useValue: initServerTests, multi: true}
    ];

function appDoc() {
  try {
    return getDOM().defaultDoc();
  } catch (e) {
    return null;
  }
}


function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: true});
}


/**
 * Default application providers for testing.
 */
export const TEST_SERVER_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      // TODO(julie: when angular2/platform/server is available, use that instead of making our own
      // list here.
      APPLICATION_COMMON_PROVIDERS,
      COMPILER_PROVIDERS,
      BROWSER_SANITIZATION_PROVIDERS,
      /* @ts2dart_Provider */ {provide: DOCUMENT, useFactory: appDoc},
      /* @ts2dart_Provider */ {provide: DomRootRenderer, useClass: DomRootRenderer_},
      /* @ts2dart_Provider */ {provide: RootRenderer, useExisting: DomRootRenderer},
      EventManager,
      /* @ts2dart_Provider */ {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
      /* @ts2dart_Provider */ {provide: XHR, useClass: XHR},
      /* @ts2dart_Provider */ {provide: APP_ID, useValue: 'a'},
      /* @ts2dart_Provider */ {provide: SharedStylesHost, useExisting: DomSharedStylesHost},
      DomSharedStylesHost,
      ELEMENT_PROBE_PROVIDERS,
      /* @ts2dart_Provider */ {provide: DirectiveResolver, useClass: MockDirectiveResolver},
      /* @ts2dart_Provider */ {provide: ViewResolver, useClass: MockViewResolver},
      Log,
      /* @ts2dart_Provider */ {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
      TestComponentBuilder,
      /* @ts2dart_Provider */ {provide: NgZone, useFactory: createNgZone},
      /* @ts2dart_Provider */ {provide: LocationStrategy, useClass: MockLocationStrategy},
      /* @ts2dart_Provider */ {provide: AnimationBuilder, useClass: MockAnimationBuilder},
    ];
