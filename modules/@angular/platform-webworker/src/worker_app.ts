/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {APP_INITIALIZER, ApplicationModule, ErrorHandler, NgModule, NgZone, PlatformRef, Provider, RootRenderer, createPlatformFactory, platformCore} from '@angular/core';

import {BROWSER_SANITIZATION_PROVIDERS} from './private_import_platform-browser';
import {ON_WEB_WORKER} from './web_workers/shared/api';
import {ClientMessageBrokerFactory, ClientMessageBrokerFactory_} from './web_workers/shared/client_message_broker';
import {MessageBus} from './web_workers/shared/message_bus';
import {PostMessageBus, PostMessageBusSink, PostMessageBusSource} from './web_workers/shared/post_message_bus';
import {RenderStore} from './web_workers/shared/render_store';
import {Serializer} from './web_workers/shared/serializer';
import {ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_} from './web_workers/shared/service_message_broker';
import {WebWorkerRootRenderer} from './web_workers/worker/renderer';
import {WorkerDomAdapter} from './web_workers/worker/worker_adapter';



/**
 * @experimental
 */
export const platformWorkerApp = createPlatformFactory(platformCore, 'workerApp');

export function errorHandler(): ErrorHandler {
  return new ErrorHandler();
}


// TODO(jteplitz602) remove this and compile with lib.webworker.d.ts (#3492)
let _postMessage = {
  postMessage: (message: any, transferrables?: [ArrayBuffer]) => {
    (<any>postMessage)(message, transferrables);
  }
};


export function createMessageBus(zone: NgZone): MessageBus {
  let sink = new PostMessageBusSink(_postMessage);
  let source = new PostMessageBusSource();
  let bus = new PostMessageBus(sink, source);
  bus.attachToZone(zone);
  return bus;
}


export function setupWebWorker(): void {
  WorkerDomAdapter.makeCurrent();
}

/**
 * The ng module for the worker app side.
 *
 * @experimental
 */
@NgModule({
  providers: [
    BROWSER_SANITIZATION_PROVIDERS, Serializer,
    {provide: ClientMessageBrokerFactory, useClass: ClientMessageBrokerFactory_},
    {provide: ServiceMessageBrokerFactory, useClass: ServiceMessageBrokerFactory_},
    WebWorkerRootRenderer, {provide: RootRenderer, useExisting: WebWorkerRootRenderer},
    {provide: ON_WEB_WORKER, useValue: true}, RenderStore,
    {provide: ErrorHandler, useFactory: errorHandler, deps: []},
    {provide: MessageBus, useFactory: createMessageBus, deps: [NgZone]},
    {provide: APP_INITIALIZER, useValue: setupWebWorker, multi: true}
  ],
  exports: [CommonModule, ApplicationModule]
})
export class WorkerAppModule {
}
