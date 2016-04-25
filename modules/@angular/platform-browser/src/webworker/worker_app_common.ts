import {XHR} from '@angular/compiler';
import {WebWorkerXHRImpl} from '../web_workers/worker/xhr_impl';
import {WebWorkerRootRenderer} from '../web_workers/worker/renderer';
import {print, CONST_EXPR} from '@angular/facade';
import {RootRenderer} from '@angular/core/src/render/api';
import {
  PLATFORM_DIRECTIVES,
  PLATFORM_PIPES,
  ExceptionHandler,
  APPLICATION_COMMON_PROVIDERS,
  PLATFORM_COMMON_PROVIDERS,
  OpaqueToken
} from '@angular/core';
import {COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS} from '@angular/common';
import {
  ClientMessageBrokerFactory,
  ClientMessageBrokerFactory_
} from '../web_workers/shared/client_message_broker';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBrokerFactory_
} from '../web_workers/shared/service_message_broker';
import {Serializer} from '../web_workers/shared/serializer';
import {ON_WEB_WORKER} from '../web_workers/shared/api';
import {Provider} from '@angular/core/src/di';
import {RenderStore} from '../web_workers/shared/render_store';

class PrintLogger {
  log = print;
  logError = print;
  logGroup = print;
  logGroupEnd() {}
}

export const WORKER_APP_PLATFORM_MARKER = CONST_EXPR(new OpaqueToken('WorkerAppPlatformMarker'));

export const WORKER_APP_PLATFORM: Array<any /*Type | Provider | any[]*/> = CONST_EXPR([
  PLATFORM_COMMON_PROVIDERS,
  CONST_EXPR(new Provider(WORKER_APP_PLATFORM_MARKER, {useValue: true}))
]);

export const WORKER_APP_APPLICATION_COMMON: Array<any /*Type | Provider | any[]*/> = CONST_EXPR([
  APPLICATION_COMMON_PROVIDERS,
  FORM_PROVIDERS,
  Serializer,
  new Provider(PLATFORM_PIPES, {useValue: COMMON_PIPES, multi: true}),
  new Provider(PLATFORM_DIRECTIVES, {useValue: COMMON_DIRECTIVES, multi: true}),
  new Provider(ClientMessageBrokerFactory, {useClass: ClientMessageBrokerFactory_}),
  new Provider(ServiceMessageBrokerFactory, {useClass: ServiceMessageBrokerFactory_}),
  WebWorkerRootRenderer,
  new Provider(RootRenderer, {useExisting: WebWorkerRootRenderer}),
  new Provider(ON_WEB_WORKER, {useValue: true}),
  RenderStore,
  new Provider(ExceptionHandler, {useFactory: _exceptionHandler, deps: []}),
  WebWorkerXHRImpl,
  new Provider(XHR, {useExisting: WebWorkerXHRImpl})
]);

function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(new PrintLogger());
}
