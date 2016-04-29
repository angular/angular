import {NgZone} from '@angular/core/src/zone/ng_zone';
import {Provider} from '@angular/core/src/di';
import {Parse5DomAdapter} from '@angular/platform-server';
import {
  PostMessageBus,
  PostMessageBusSink,
  PostMessageBusSource
} from '../web_workers/shared/post_message_bus';
import {WORKER_APP_APPLICATION_COMMON} from './worker_app_common';
import {APP_INITIALIZER} from '@angular/core';
import {MessageBus} from '../web_workers/shared/message_bus';
import {COMPILER_PROVIDERS} from '@angular/compiler/src/compiler';

// TODO(jteplitz602) remove this and compile with lib.webworker.d.ts (#3492)
let _postMessage = {
  postMessage: (message: any, transferrables?:[ArrayBuffer]) => {
    (<any>postMessage)(message, transferrables);
  }
};

export const WORKER_APP_APPLICATION: Array<any /*Type | Provider | any[]*/> = [
  WORKER_APP_APPLICATION_COMMON,
  COMPILER_PROVIDERS,
  /* @ts2dart_Provider */ {provide: MessageBus, useFactory: createMessageBus, deps: [NgZone]},
  /* @ts2dart_Provider */ {provide: APP_INITIALIZER, useValue: setupWebWorker, multi: true}
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
