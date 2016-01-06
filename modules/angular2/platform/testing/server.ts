import {
  APP_ID,
  NgZone,
  Provider,
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
import {LocationStrategy} from 'angular2/src/router/location/location_strategy';
import {MockNgZone} from 'angular2/src/mock/ng_zone_mock';

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

import {CONST_EXPR} from 'angular2/src/facade/lang';

import {Log} from 'angular2/src/testing/utils';

function initServerTests() {
  Parse5DomAdapter.makeCurrent();
  BrowserDetection.setup();
}

/**
 * Default patform providers for testing.
 */
export const TEST_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = CONST_EXPR([
  PLATFORM_COMMON_PROVIDERS,
  new Provider(PLATFORM_INITIALIZER, {useValue: initServerTests, multi: true})
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
    CONST_EXPR([
      // TODO(julie): when angular2/platform/server is available, use that instead of making our own
      // list here.
      APPLICATION_COMMON_PROVIDERS,
      COMPILER_PROVIDERS,
      new Provider(DOCUMENT, {useFactory: appDoc}),
      new Provider(DomRootRenderer, {useClass: DomRootRenderer_}),
      new Provider(RootRenderer, {useExisting: DomRootRenderer}),
      EventManager,
      new Provider(EVENT_MANAGER_PLUGINS, {useClass: DomEventsPlugin, multi: true}),
      new Provider(XHR, {useClass: XHR}),
      new Provider(APP_ID, {useValue: 'a'}),
      new Provider(SharedStylesHost, {useExisting: DomSharedStylesHost}),
      DomSharedStylesHost,
      ELEMENT_PROBE_PROVIDERS,
      new Provider(DirectiveResolver, {useClass: MockDirectiveResolver}),
      new Provider(ViewResolver, {useClass: MockViewResolver}),
      Log,
      TestComponentBuilder,
      new Provider(NgZone, {useClass: MockNgZone}),
      new Provider(LocationStrategy, {useClass: MockLocationStrategy}),
      new Provider(AnimationBuilder, {useClass: MockAnimationBuilder}),
    ]);
