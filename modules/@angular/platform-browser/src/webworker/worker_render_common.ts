import {IS_DART} from '../../src/facade/lang';
import {MessageBus} from '../web_workers/shared/message_bus';
import {NgZone} from '@angular/core/src/zone/ng_zone';
import {
  ExceptionHandler,
  APPLICATION_COMMON_PROVIDERS,
  PLATFORM_COMMON_PROVIDERS,
  RootRenderer,
  PLATFORM_INITIALIZER
} from '@angular/core';
import {Provider, Injector, OpaqueToken} from '@angular/core/src/di';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DomEventsPlugin} from '@angular/platform-browser/src/dom/events/dom_events';
import {KeyEventsPlugin} from '@angular/platform-browser/src/dom/events/key_events';
import {HammerGesturesPlugin} from '@angular/platform-browser/src/dom/events/hammer_gestures';
import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {DomRootRenderer, DomRootRenderer_} from '@angular/platform-browser/src/dom/dom_renderer';
import {
  DomSharedStylesHost,
  SharedStylesHost
} from '@angular/platform-browser/src/dom/shared_styles_host';
import {BrowserDetails} from '../animate/browser_details';
import {AnimationBuilder} from '../animate/animation_builder';
import {Testability} from '@angular/core/src/testability/testability';
import {BrowserGetTestability} from '@angular/platform-browser/src/browser/testability';
import {BrowserDomAdapter} from '../browser/browser_adapter';
import {BROWSER_SANITIZATION_PROVIDERS} from '../browser_common';
import {wtfInit} from '@angular/core/src/profile/wtf_init';
import {MessageBasedRenderer} from '../web_workers/ui/renderer';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBrokerFactory_
} from '../web_workers/shared/service_message_broker';
import {
  ClientMessageBrokerFactory,
  ClientMessageBrokerFactory_
} from '../web_workers/shared/client_message_broker';
import {
  BrowserPlatformLocation
} from '@angular/platform-browser/src/browser/location/browser_platform_location';
import {Serializer} from '../web_workers/shared/serializer';
import {ON_WEB_WORKER} from '../web_workers/shared/api';
import {RenderStore} from '../web_workers/shared/render_store';
import {HAMMER_GESTURE_CONFIG, HammerGestureConfig} from '../dom/events/hammer_gestures';
import {SanitizationService} from '../../core_private';
import {DomSanitizationService} from '../security/dom_sanitization_service';
import {EventManager, EVENT_MANAGER_PLUGINS} from '../dom/events/event_manager';
import {XHR} from "../../../compiler/src/xhr";
import {XHRImpl} from "../../../platform-browser-dynamic/src/xhr/xhr_impl";
import {MessageBasedXHRImpl} from "../web_workers/ui/xhr_impl";
// TODO change these imports once dom_adapter is moved out of core

export const WORKER_SCRIPT: OpaqueToken = /*@ts2dart_const*/ new OpaqueToken("WebWorkerScript");

// Message based Worker classes that listen on the MessageBus
export const WORKER_RENDER_MESSAGING_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[MessageBasedRenderer, MessageBasedXHRImpl];

export const WORKER_RENDER_PLATFORM_MARKER =
    /*@ts2dart_const*/ new OpaqueToken('WorkerRenderPlatformMarker');

export const WORKER_RENDER_PLATFORM: Array<any /*Type | Provider | any[]*/> = /*@ts2dart_const*/[
  PLATFORM_COMMON_PROVIDERS,
  /*@ts2dart_const*/ (/* @ts2dart_Provider */ {provide: WORKER_RENDER_PLATFORM_MARKER, useValue: true}),
  /* @ts2dart_Provider */ {provide: PLATFORM_INITIALIZER, useValue: initWebWorkerRenderPlatform, multi: true}
];

/**
 * A list of {@link Provider}s. To use the router in a Worker enabled application you must
 * include these providers when setting up the render thread.
 */
export const WORKER_RENDER_ROUTER: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[BrowserPlatformLocation];

export const WORKER_RENDER_APPLICATION_COMMON: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      APPLICATION_COMMON_PROVIDERS,
      WORKER_RENDER_MESSAGING_PROVIDERS,
      BROWSER_SANITIZATION_PROVIDERS,
      /* @ts2dart_Provider */ {provide: ExceptionHandler, useFactory: _exceptionHandler, deps: []},
      /* @ts2dart_Provider */ {provide: DOCUMENT, useFactory: _document, deps: []},
      // TODO(jteplitz602): Investigate if we definitely need EVENT_MANAGER on the render thread
      // #5298
      /* @ts2dart_Provider */ {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
      /* @ts2dart_Provider */ {provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true},
      /* @ts2dart_Provider */ {provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true},
      /* @ts2dart_Provider */ {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig},
      /* @ts2dart_Provider */ {provide: DomRootRenderer, useClass: DomRootRenderer_},
      /* @ts2dart_Provider */ {provide: RootRenderer, useExisting: DomRootRenderer},
      /* @ts2dart_Provider */ {provide: SharedStylesHost, useExisting: DomSharedStylesHost},
      /* @ts2dart_Provider */ {provide: XHR, useClass: XHRImpl},
      MessageBasedXHRImpl,
      /* @ts2dart_Provider */ {provide: ServiceMessageBrokerFactory, useClass: ServiceMessageBrokerFactory_},
      /* @ts2dart_Provider */ {provide: ClientMessageBrokerFactory, useClass: ClientMessageBrokerFactory_},
      Serializer,
      /* @ts2dart_Provider */ {provide: ON_WEB_WORKER, useValue: false},
      RenderStore,
      DomSharedStylesHost,
      Testability,
      BrowserDetails,
      AnimationBuilder,
      EventManager
    ];

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
  return new ExceptionHandler(getDOM(), !IS_DART);
}

function _document(): any {
  return getDOM().defaultDoc();
}
