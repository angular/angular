import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {Type, CONST_EXPR, isPresent} from 'angular2/src/facade/lang';
import {Provider} from 'angular2/src/core/di';
import {Parse5DomAdapter} from 'angular2/src/platform/server/parse5_adapter';
import {
  PostMessageBus,
  PostMessageBusSink,
  PostMessageBusSource
} from 'angular2/src/web_workers/shared/post_message_bus';
import {WORKER_APP_APPLICATION_COMMON} from './worker_app_common';
import {APP_INITIALIZER} from 'angular2/core';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {COMPILER_PROVIDERS} from 'angular2/src/compiler/compiler';

// TODO(jteplitz602) remove this and compile with lib.webworker.d.ts (#3492)
let _postMessage = {
  postMessage: (message: any, transferrables?:[ArrayBuffer]) => {
    (<any>postMessage)(message, transferrables);
  }
};

export const WORKER_APP_APPLICATION: Array<any /*Type | Provider | any[]*/> = [
  WORKER_APP_APPLICATION_COMMON,
  COMPILER_PROVIDERS,
  new Provider(MessageBus, {useFactory: createMessageBus, deps: [NgZone]}),
  new Provider(APP_INITIALIZER, {useValue: setupWebWorker, multi: true})
];

function createMessageBus(zone: NgZone): MessageBus {
  let sink = new PostMessageBusSink(_postMessage);
  let source = new PostMessageBusSource();
  let bus = new PostMessageBus(sink, source);
  bus.attachToZone(zone);
  return bus;
}

function setupWebWorker(): void {
  Parse5DomAdapter.makeCurrent();
}
