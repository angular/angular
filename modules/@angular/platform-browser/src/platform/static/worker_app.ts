import {APP_INITIALIZER, NgZone, ReflectiveInjector, ComponentRef, coreLoadAndBootstrap} from '@angular/core';
import {Type, isPresent} from '../../../src/facade/lang';
import {workerAppPlatform} from '../common/worker_app';
import {WorkerDomAdapter} from '../../web_workers/worker/worker_adapter';
import {
  PostMessageBus,
  PostMessageBusSink,
  PostMessageBusSource
} from '../../web_workers/shared/post_message_bus';
import {WORKER_APP_APPLICATION_COMMON_PROVIDERS} from '../common/worker_app';
import {MessageBus} from '../../web_workers/shared/message_bus';

// TODO(jteplitz602) remove this and compile with lib.webworker.d.ts (#3492)
let _postMessage = {
  postMessage: (message: any, transferrables?:[ArrayBuffer]) => {
    (<any>postMessage)(message, transferrables);
  }
};

export const WORKER_APP_STATIC_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  WORKER_APP_APPLICATION_COMMON_PROVIDERS,
  /* @ts2dart_Provider */ {provide: MessageBus, useFactory: createMessageBus, deps: [NgZone]},
  /* @ts2dart_Provider */ {provide: APP_INITIALIZER, useValue: setupWebWorker, multi: true}
];

export function bootstrapStaticApp(
  appComponentType: Type,
  customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<any>> {
  var appInjector = ReflectiveInjector.resolveAndCreate(
    [WORKER_APP_STATIC_APPLICATION_PROVIDERS, isPresent(customProviders) ? customProviders : []],
    workerAppPlatform().injector);
  return coreLoadAndBootstrap(appInjector, appComponentType);
}

function createMessageBus(zone: NgZone): MessageBus {
  let sink = new PostMessageBusSink(_postMessage);
  let source = new PostMessageBusSource();
  let bus = new PostMessageBus(sink, source);
  bus.attachToZone(zone);
  return bus;
}

function setupWebWorker(): void {
  WorkerDomAdapter.makeCurrent();
}