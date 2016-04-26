import {
  APP_ID,
  NgZone,
  PLATFORM_COMMON_PROVIDERS,
  PLATFORM_INITIALIZER,
  APPLICATION_COMMON_PROVIDERS,
  Renderer
} from 'angular2/core';
import {DirectiveResolver, ViewResolver} from 'angular2/compiler';

import {Parse5DomAdapter} from 'angular2/src/platform/server/parse5_adapter';

import {AnimationBuilder} from 'angular2/src/animate/animation_builder';
import {MockAnimationBuilder} from 'angular2/src/mock/animation_builder_mock';
import {MockDirectiveResolver} from 'angular2/src/mock/directive_resolver_mock';
import {MockViewResolver} from 'angular2/src/mock/view_resolver_mock';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';
import {MockNgZone} from 'angular2/src/mock/ng_zone_mock';

import {createNgZone} from 'angular2/src/core/application_ref';
import {TestComponentBuilder} from 'angular2/src/testing/test_component_builder';
import {XHR} from 'angular2/src/compiler/xhr';
import {BrowserDetection} from 'angular2/src/testing/utils';

import {COMPILER_PROVIDERS} from 'angular2/src/compiler/compiler';
import {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {RootRenderer} from 'angular2/src/core/render/api';
import {DomRootRenderer, DomRootRenderer_} from 'angular2/src/platform/dom/dom_renderer';
import {DomSharedStylesHost, SharedStylesHost} from 'angular2/src/platform/dom/shared_styles_host';

import {
  EventManager,
  EVENT_MANAGER_PLUGINS,
  ELEMENT_PROBE_PROVIDERS
} from 'angular2/platform/common_dom';
import {DomEventsPlugin} from 'angular2/src/platform/dom/events/dom_events';
import {LocationStrategy} from 'angular2/platform/common';


import {Log} from 'angular2/src/testing/utils';

function initServerTests() {
  Parse5DomAdapter.makeCurrent();
  BrowserDetection.setup();
}

/**
 * Default platform providers for testing.
 */
export const TEST_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/ [
      PLATFORM_COMMON_PROVIDERS,
      /*@ts2dart_Provider*/{provide: PLATFORM_INITIALIZER, useValue: initServerTests, multi: true}
    ];

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
    /*@ts2dart_const*/ [
      // TODO(julie: when angular2/platform/server is available, use that instead of making our own
      // list here.
      APPLICATION_COMMON_PROVIDERS,
      COMPILER_PROVIDERS,
      /*@ts2dart_Provider*/{provide: DOCUMENT, useFactory: appDoc},
      /*@ts2dart_Provider*/{provide: DomRootRenderer, useClass: DomRootRenderer_},
      /*@ts2dart_Provider*/{provide: RootRenderer, useExisting: DomRootRenderer},
      EventManager,
      /*@ts2dart_Provider*/{provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
      /*@ts2dart_Provider*/{provide: XHR, useClass: XHR},
      /*@ts2dart_Provider*/{provide: APP_ID, useValue: 'a'},
      /*@ts2dart_Provider*/{provide: SharedStylesHost, useExisting: DomSharedStylesHost},
      DomSharedStylesHost,
      ELEMENT_PROBE_PROVIDERS,
      /*@ts2dart_Provider*/{provide: DirectiveResolver, useClass: MockDirectiveResolver},
      /*@ts2dart_Provider*/{provide: ViewResolver, useClass: MockViewResolver},
      Log,
      TestComponentBuilder,
      /*@ts2dart_Provider*/{provide: NgZone, useFactory: createNgZone},
      /*@ts2dart_Provider*/{provide: LocationStrategy, useClass: MockLocationStrategy},
      /*@ts2dart_Provider*/{provide: AnimationBuilder, useClass: MockAnimationBuilder},
    ];
