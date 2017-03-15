/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, ɵPLATFORM_WORKER_UI_ID as PLATFORM_WORKER_UI_ID} from '@angular/common';
import {ErrorHandler, Injectable, InjectionToken, Injector, NgZone, PLATFORM_ID, PLATFORM_INITIALIZER, PlatformRef, Provider, RendererFactory2, RootRenderer, Testability, createPlatformFactory, isDevMode, platformCore, ɵAPP_ID_RANDOM_PROVIDER as APP_ID_RANDOM_PROVIDER} from '@angular/core';
import {DOCUMENT, EVENT_MANAGER_PLUGINS, EventManager, HAMMER_GESTURE_CONFIG, HammerGestureConfig, ɵBROWSER_SANITIZATION_PROVIDERS as BROWSER_SANITIZATION_PROVIDERS, ɵBrowserDomAdapter as BrowserDomAdapter, ɵBrowserGetTestability as BrowserGetTestability, ɵDomEventsPlugin as DomEventsPlugin, ɵDomRendererFactory2 as DomRendererFactory2, ɵDomSharedStylesHost as DomSharedStylesHost, ɵHammerGesturesPlugin as HammerGesturesPlugin, ɵKeyEventsPlugin as KeyEventsPlugin, ɵSharedStylesHost as SharedStylesHost, ɵgetDOM as getDOM} from '@angular/platform-browser';

import {ON_WEB_WORKER} from './web_workers/shared/api';
import {ClientMessageBrokerFactory, ClientMessageBrokerFactory_} from './web_workers/shared/client_message_broker';
import {MessageBus} from './web_workers/shared/message_bus';
import {PostMessageBus, PostMessageBusSink, PostMessageBusSource} from './web_workers/shared/post_message_bus';
import {RenderStore} from './web_workers/shared/render_store';
import {Serializer} from './web_workers/shared/serializer';
import {ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_} from './web_workers/shared/service_message_broker';
import {MessageBasedRenderer2} from './web_workers/ui/renderer';


/**
 * Wrapper class that exposes the Worker
 * and underlying {@link MessageBus} for lower level message passing.
 *
 * @experimental WebWorker support is currently experimental.
 */
@Injectable()
export class WebWorkerInstance {
  public worker: Worker;
  public bus: MessageBus;

  /** @internal */
  public init(worker: Worker, bus: MessageBus) {
    this.worker = worker;
    this.bus = bus;
  }
}

/**
 * @experimental WebWorker support is currently experimental.
 */
export const WORKER_SCRIPT = new InjectionToken<string>('WebWorkerScript');

/**
 * A multi-provider used to automatically call the `start()` method after the service is
 * created.
 *
 * @experimental WebWorker support is currently experimental.
 */
export const WORKER_UI_STARTABLE_MESSAGING_SERVICE =
    new InjectionToken<({start: () => void})[]>('WorkerRenderStartableMsgService');

export const _WORKER_UI_PLATFORM_PROVIDERS: Provider[] = [
  {provide: NgZone, useFactory: createNgZone, deps: []},
  MessageBasedRenderer2,
  {provide: WORKER_UI_STARTABLE_MESSAGING_SERVICE, useExisting: MessageBasedRenderer2, multi: true},
  BROWSER_SANITIZATION_PROVIDERS,
  {provide: ErrorHandler, useFactory: _exceptionHandler, deps: []},
  {provide: DOCUMENT, useFactory: _document, deps: []},
  // TODO(jteplitz602): Investigate if we definitely need EVENT_MANAGER on the render thread
  // #5298
  {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
  {provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true},
  {provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true},
  {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig},
  APP_ID_RANDOM_PROVIDER,
  DomRendererFactory2,
  {provide: RendererFactory2, useExisting: DomRendererFactory2},
  {provide: SharedStylesHost, useExisting: DomSharedStylesHost},
  {provide: ServiceMessageBrokerFactory, useClass: ServiceMessageBrokerFactory_},
  {provide: ClientMessageBrokerFactory, useClass: ClientMessageBrokerFactory_},
  Serializer,
  {provide: ON_WEB_WORKER, useValue: false},
  RenderStore,
  DomSharedStylesHost,
  Testability,
  EventManager,
  WebWorkerInstance,
  {
    provide: PLATFORM_INITIALIZER,
    useFactory: initWebWorkerRenderPlatform,
    multi: true,
    deps: [Injector]
  },
  {provide: PLATFORM_ID, useValue: PLATFORM_WORKER_UI_ID},
  {provide: MessageBus, useFactory: messageBusFactory, deps: [WebWorkerInstance]},
];

function initializeGenericWorkerRenderer(injector: Injector) {
  const bus = injector.get(MessageBus);
  const zone = injector.get(NgZone);
  bus.attachToZone(zone);

  // initialize message services after the bus has been created
  const services = injector.get(WORKER_UI_STARTABLE_MESSAGING_SERVICE);
  zone.runGuarded(() => { services.forEach((svc: any) => { svc.start(); }); });
}

function messageBusFactory(instance: WebWorkerInstance): MessageBus {
  return instance.bus;
}

function initWebWorkerRenderPlatform(injector: Injector): () => void {
  return () => {
    BrowserDomAdapter.makeCurrent();
    BrowserGetTestability.init();
    let scriptUri: string;
    try {
      scriptUri = injector.get(WORKER_SCRIPT);
    } catch (e) {
      throw new Error(
          'You must provide your WebWorker\'s initialization script with the WORKER_SCRIPT token');
    }

    const instance = injector.get(WebWorkerInstance);
    spawnWebWorker(scriptUri, instance);

    initializeGenericWorkerRenderer(injector);
  };
}

/**
 * @experimental WebWorker support is currently experimental.
 */
export const platformWorkerUi =
    createPlatformFactory(platformCore, 'workerUi', _WORKER_UI_PLATFORM_PROVIDERS);

function _exceptionHandler(): ErrorHandler {
  return new ErrorHandler();
}

function _document(): any {
  return document;
}

function createNgZone(): NgZone {
  return new NgZone({enableLongStackTrace: isDevMode()});
}

/**
 * Spawns a new class and initializes the WebWorkerInstance
 */
function spawnWebWorker(uri: string, instance: WebWorkerInstance): void {
  const webWorker: Worker = new Worker(uri);
  const sink = new PostMessageBusSink(webWorker);
  const source = new PostMessageBusSource(webWorker);
  const bus = new PostMessageBus(sink, source);

  instance.init(webWorker, bus);
}
