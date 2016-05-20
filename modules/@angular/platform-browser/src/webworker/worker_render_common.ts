import {IS_DART} from '../../src/facade/lang';
import {MessageBus} from '../web_workers/shared/message_bus';
import {NgZone, Provider, Injector, OpaqueToken, Testability} from '@angular/core';
import {wtfInit} from '../../core_private';
import {
  ExceptionHandler,
  APPLICATION_COMMON_PROVIDERS,
  PLATFORM_COMMON_PROVIDERS,
  RootRenderer,
  PLATFORM_INITIALIZER
} from '@angular/core';
import {getDOM} from '../dom/dom_adapter';
import {DomEventsPlugin} from '../dom/events/dom_events';
import {KeyEventsPlugin} from '../dom/events/key_events';
import {HammerGesturesPlugin} from '../dom/events/hammer_gestures';
import {DOCUMENT} from '../dom/dom_tokens';
import {DomRootRenderer, DomRootRenderer_} from '../dom/dom_renderer';
import {DomSharedStylesHost, SharedStylesHost} from '../dom/shared_styles_host';
import {BrowserDetails} from '../animate/browser_details';
import {AnimationBuilder} from '../animate/animation_builder';
import {BrowserGetTestability} from '../browser/testability';
import {BrowserDomAdapter} from '../browser/browser_adapter';
import {MessageBasedRenderer} from '../web_workers/ui/renderer';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBrokerFactory_
} from '../web_workers/shared/service_message_broker';
import {
  ClientMessageBrokerFactory,
  ClientMessageBrokerFactory_
} from '../web_workers/shared/client_message_broker';
import {Serializer} from '../web_workers/shared/serializer';
import {ON_WEB_WORKER} from '../web_workers/shared/api';
import {RenderStore} from '../web_workers/shared/render_store';
import {HAMMER_GESTURE_CONFIG, HammerGestureConfig} from '../dom/events/hammer_gestures';
import {EventManager, EVENT_MANAGER_PLUGINS} from '../dom/events/event_manager';
import {BROWSER_SANITIZATION_PROVIDERS} from '../browser_common';

export const WORKER_SCRIPT: OpaqueToken = /*@ts2dart_const*/ new OpaqueToken("WebWorkerScript");

/**
 * A multiple providers used to automatically call the `start()` method after the service is
 * created.
 *
 * TODO(vicb): create an interface for startable services to implement
 */
export const WORKER_RENDER_STARTABLE_MESSAGING_SERVICE =
    /*@ts2dart_const*/ new OpaqueToken('WorkerRenderStartableMsgService');

export const WORKER_RENDER_PLATFORM_MARKER =
    /*@ts2dart_const*/ new OpaqueToken('WorkerRenderPlatformMarker');

export const WORKER_RENDER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = /*@ts2dart_const*/[
  PLATFORM_COMMON_PROVIDERS,
  /*@ts2dart_const*/ (/* @ts2dart_Provider */ {provide: WORKER_RENDER_PLATFORM_MARKER, useValue: true}),
  /* @ts2dart_Provider */ {provide: PLATFORM_INITIALIZER, useValue: initWebWorkerRenderPlatform, multi: true}
];

export const WORKER_RENDER_APPLICATION_COMMON_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      APPLICATION_COMMON_PROVIDERS,
      MessageBasedRenderer,
      /* @ts2dart_Provider */ {provide: WORKER_RENDER_STARTABLE_MESSAGING_SERVICE, useExisting: MessageBasedRenderer, multi: true},
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

  // initialize message services after the bus has been created
  let services = injector.get(WORKER_RENDER_STARTABLE_MESSAGING_SERVICE);
  zone.runGuarded(() => { services.forEach((svc) => { svc.start(); }); });
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
