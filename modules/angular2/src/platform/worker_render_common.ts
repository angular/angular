import {CONST_EXPR, IS_DART} from 'angular2/src/facade/lang';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {
  PLATFORM_DIRECTIVES,
  PLATFORM_PIPES,
  ComponentRef,
  ExceptionHandler,
  Reflector,
  reflector,
  APPLICATION_COMMON_PROVIDERS,
  PLATFORM_COMMON_PROVIDERS,
  RootRenderer,
  PLATFORM_INITIALIZER,
  APP_INITIALIZER
} from 'angular2/core';
import {EVENT_MANAGER_PLUGINS, EventManager} from 'angular2/platform/common_dom';
import {provide, Provider, Injector, OpaqueToken} from 'angular2/src/core/di';
// TODO change these imports once dom_adapter is moved out of core
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {DomEventsPlugin} from 'angular2/src/platform/dom/events/dom_events';
import {KeyEventsPlugin} from 'angular2/src/platform/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/platform/dom/events/hammer_gestures';
import {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
import {DomRootRenderer, DomRootRenderer_} from 'angular2/src/platform/dom/dom_renderer';
import {DomSharedStylesHost} from 'angular2/src/platform/dom/shared_styles_host';
import {SharedStylesHost} from "angular2/src/platform/dom/shared_styles_host";
import {BrowserDetails} from 'angular2/src/animate/browser_details';
import {AnimationBuilder} from 'angular2/src/animate/animation_builder';
import {XHR} from 'angular2/compiler';
import {XHRImpl} from 'angular2/src/platform/browser/xhr_impl';
import {Testability} from 'angular2/src/core/testability/testability';
import {BrowserGetTestability} from 'angular2/src/platform/browser/testability';
import {BrowserDomAdapter} from './browser/browser_adapter';
import {wtfInit} from 'angular2/src/core/profile/wtf_init';
import {MessageBasedRenderer} from 'angular2/src/web_workers/ui/renderer';
import {MessageBasedXHRImpl} from 'angular2/src/web_workers/ui/xhr_impl';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBrokerFactory_
} from 'angular2/src/web_workers/shared/service_message_broker';
import {
  ClientMessageBrokerFactory,
  ClientMessageBrokerFactory_
} from 'angular2/src/web_workers/shared/client_message_broker';
import {
  BrowserPlatformLocation
} from 'angular2/src/platform/browser/location/browser_platform_location';
import {Serializer} from 'angular2/src/web_workers/shared/serializer';
import {ON_WEB_WORKER} from 'angular2/src/web_workers/shared/api';
import {RenderStore} from 'angular2/src/web_workers/shared/render_store';
import {HAMMER_GESTURE_CONFIG, HammerGestureConfig} from './dom/events/hammer_gestures';

export const WORKER_SCRIPT: OpaqueToken = CONST_EXPR(new OpaqueToken("WebWorkerScript"));

// Message based Worker classes that listen on the MessageBus
export const WORKER_RENDER_MESSAGING_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    CONST_EXPR([MessageBasedRenderer, MessageBasedXHRImpl]);

export const WORKER_RENDER_PLATFORM_MARKER =
    CONST_EXPR(new OpaqueToken('WorkerRenderPlatformMarker'));

export const WORKER_RENDER_PLATFORM: Array<any /*Type | Provider | any[]*/> = CONST_EXPR([
  PLATFORM_COMMON_PROVIDERS,
  CONST_EXPR(new Provider(WORKER_RENDER_PLATFORM_MARKER, {useValue: true})),
  new Provider(PLATFORM_INITIALIZER, {useValue: initWebWorkerRenderPlatform, multi: true})
]);

/**
 * A list of {@link Provider}s. To use the router in a Worker enabled application you must
 * include these providers when setting up the render thread.
 */
export const WORKER_RENDER_ROUTER: Array<any /*Type | Provider | any[]*/> =
    CONST_EXPR([BrowserPlatformLocation]);

export const WORKER_RENDER_APPLICATION_COMMON: Array<any /*Type | Provider | any[]*/> = CONST_EXPR([
  APPLICATION_COMMON_PROVIDERS,
  WORKER_RENDER_MESSAGING_PROVIDERS,
  new Provider(ExceptionHandler, {useFactory: _exceptionHandler, deps: []}),
  new Provider(DOCUMENT, {useFactory: _document, deps: []}),
  // TODO(jteplitz602): Investigate if we definitely need EVENT_MANAGER on the render thread
  // #5298
  new Provider(EVENT_MANAGER_PLUGINS, {useClass: DomEventsPlugin, multi: true}),
  new Provider(EVENT_MANAGER_PLUGINS, {useClass: KeyEventsPlugin, multi: true}),
  new Provider(EVENT_MANAGER_PLUGINS, {useClass: HammerGesturesPlugin, multi: true}),
  new Provider(HAMMER_GESTURE_CONFIG, {useClass: HammerGestureConfig}),
  new Provider(DomRootRenderer, {useClass: DomRootRenderer_}),
  new Provider(RootRenderer, {useExisting: DomRootRenderer}),
  new Provider(SharedStylesHost, {useExisting: DomSharedStylesHost}),
  new Provider(XHR, {useClass: XHRImpl}),
  MessageBasedXHRImpl,
  new Provider(ServiceMessageBrokerFactory, {useClass: ServiceMessageBrokerFactory_}),
  new Provider(ClientMessageBrokerFactory, {useClass: ClientMessageBrokerFactory_}),
  Serializer,
  new Provider(ON_WEB_WORKER, {useValue: false}),
  RenderStore,
  DomSharedStylesHost,
  Testability,
  BrowserDetails,
  AnimationBuilder,
  EventManager
]);

export function initializeGenericWorkerRenderer(injector: Injector) {
  var bus = injector.get(MessageBus);
  let zone = injector.get(NgZone);
  bus.attachToZone(zone);

  zone.runGuarded(() => {
    WORKER_RENDER_MESSAGING_PROVIDERS.forEach((token) => { injector.get(token).start(); });
  });
}

export function initWebWorkerRenderPlatform(): void {
  BrowserDomAdapter.makeCurrent();
  wtfInit();
  BrowserGetTestability.init();
}

function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(DOM, !IS_DART);
}

function _document(): any {
  return DOM.defaultDoc();
}
