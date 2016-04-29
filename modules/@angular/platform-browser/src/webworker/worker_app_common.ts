import {XHR} from '@angular/compiler';
import {WebWorkerXHRImpl} from '../web_workers/worker/xhr_impl';
import {WebWorkerRootRenderer} from '../web_workers/worker/renderer';
import {print} from '../../src/facade/lang';
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

export const WORKER_APP_PLATFORM_MARKER =
    /*@ts2dart_const*/ new OpaqueToken('WorkerAppPlatformMarker');

export const WORKER_APP_PLATFORM: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      PLATFORM_COMMON_PROVIDERS,
      /*@ts2dart_const*/ (
          /* @ts2dart_Provider */ {provide: WORKER_APP_PLATFORM_MARKER, useValue: true})
    ];

export const WORKER_APP_APPLICATION_COMMON: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      APPLICATION_COMMON_PROVIDERS,
      FORM_PROVIDERS,
      Serializer,
      /* @ts2dart_Provider */ {provide: PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true},
      /* @ts2dart_Provider */ {provide: PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true},
      /* @ts2dart_Provider */ {provide: ClientMessageBrokerFactory, useClass: ClientMessageBrokerFactory_},
      /* @ts2dart_Provider */ {provide: ServiceMessageBrokerFactory, useClass: ServiceMessageBrokerFactory_},
      WebWorkerRootRenderer,
      /* @ts2dart_Provider */ {provide: RootRenderer, useExisting: WebWorkerRootRenderer},
      /* @ts2dart_Provider */ {provide: ON_WEB_WORKER, useValue: true},
      RenderStore,
      /* @ts2dart_Provider */ {provide: ExceptionHandler, useFactory: _exceptionHandler, deps: []},
      WebWorkerXHRImpl,
      /* @ts2dart_Provider */ {provide: XHR, useExisting: WebWorkerXHRImpl}
    ];

function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(new PrintLogger());
}
