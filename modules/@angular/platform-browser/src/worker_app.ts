import {WebWorkerRootRenderer} from "./web_workers/worker/renderer";
import {print, isBlank, isPresent} from "./facade/lang";
import {
  PLATFORM_DIRECTIVES,
  PLATFORM_PIPES,
  ExceptionHandler,
  APPLICATION_COMMON_PROVIDERS,
  PLATFORM_COMMON_PROVIDERS,
  OpaqueToken,
  RootRenderer,
  PlatformRef,
  getPlatform,
  createPlatform,
  assertPlatform,
  ReflectiveInjector,
  APP_INITIALIZER,
  NgZone,
  Type,
  ComponentRef,
  coreLoadAndBootstrap
} from "@angular/core";
import {COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS} from "@angular/common";
import {ClientMessageBrokerFactory, ClientMessageBrokerFactory_} from "./web_workers/shared/client_message_broker";
import {ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_} from "./web_workers/shared/service_message_broker";
import {Serializer} from "./web_workers/shared/serializer";
import {ON_WEB_WORKER} from "./web_workers/shared/api";
import {RenderStore} from "./web_workers/shared/render_store";
import {BROWSER_SANITIZATION_PROVIDERS} from "./browser";
import {WorkerDomAdapter} from "./web_workers/worker/worker_adapter";
import {PostMessageBus, PostMessageBusSink, PostMessageBusSource} from "./web_workers/shared/post_message_bus";
import {MessageBus} from "./web_workers/shared/message_bus";
import {COMPILER_PROVIDERS, XHR} from "@angular/compiler";
import {XHRImpl} from "./xhr/xhr_impl";

class PrintLogger {
  log = print;
  logError = print;
  logGroup = print;
  logGroupEnd() {}
}

const WORKER_APP_PLATFORM_MARKER = new OpaqueToken('WorkerAppPlatformMarker');

export const WORKER_APP_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [
      PLATFORM_COMMON_PROVIDERS,
      {provide: WORKER_APP_PLATFORM_MARKER, useValue: true}
    ];

export const WORKER_APP_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [
      APPLICATION_COMMON_PROVIDERS,
      FORM_PROVIDERS,
      BROWSER_SANITIZATION_PROVIDERS,
      Serializer,
      {provide: PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true},
      {provide: PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true},
      {provide: ClientMessageBrokerFactory, useClass: ClientMessageBrokerFactory_},
      {provide: ServiceMessageBrokerFactory, useClass: ServiceMessageBrokerFactory_},
      WebWorkerRootRenderer,
      {provide: RootRenderer, useExisting: WebWorkerRootRenderer},
      {provide: ON_WEB_WORKER, useValue: true},
      RenderStore,
      {provide: ExceptionHandler, useFactory: _exceptionHandler, deps: []},
      {provide: MessageBus, useFactory: createMessageBus, deps: [NgZone]},
      {provide: APP_INITIALIZER, useValue: setupWebWorker, multi: true}
    ];

export function workerAppPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(WORKER_APP_PLATFORM_PROVIDERS));
  }
  return assertPlatform(WORKER_APP_PLATFORM_MARKER);
}

export function bootstrapApp(
  appComponentType: Type,
  customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<any>> {
  var appInjector = ReflectiveInjector.resolveAndCreate([
      WORKER_APP_APPLICATION_PROVIDERS,
      COMPILER_PROVIDERS,
      {provide: XHR, useClass: XHRImpl},
      isPresent(customProviders) ? customProviders : []],
    workerAppPlatform().injector);
  return coreLoadAndBootstrap(appComponentType, appInjector);
}


function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(new PrintLogger());
}

// TODO(jteplitz602) remove this and compile with lib.webworker.d.ts (#3492)
let _postMessage = {
  postMessage: (message: any, transferrables?:[ArrayBuffer]) => {
    (<any>postMessage)(message, transferrables);
  }
};

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