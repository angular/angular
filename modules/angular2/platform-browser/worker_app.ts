import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {
  WORKER_APP_PLATFORM,
  WORKER_APP_PLATFORM_MARKER
} from 'angular2/src/platform/worker_app_common';
import {WORKER_APP_APPLICATION} from 'angular2/src/platform/worker_app';
import {
  PlatformRef,
  Type,
  ComponentRef,
  ReflectiveInjector,
  coreLoadAndBootstrap,
  getPlatform,
  createPlatform,
  assertPlatform
} from 'angular2/core';

export {
  WORKER_APP_PLATFORM,
  WORKER_APP_APPLICATION_COMMON
} from 'angular2/src/platform/worker_app_common';
export {WORKER_APP_APPLICATION} from 'angular2/src/platform/worker_app';
export {
  ClientMessageBroker,
  ClientMessageBrokerFactory,
  FnArg,
  UiArguments
} from 'angular2/src/web_workers/shared/client_message_broker';
export {
  ReceivedMessage,
  ServiceMessageBroker,
  ServiceMessageBrokerFactory
} from 'angular2/src/web_workers/shared/service_message_broker';
export {PRIMITIVE} from 'angular2/src/web_workers/shared/serializer';
export * from 'angular2/src/web_workers/shared/message_bus';
export {AngularEntrypoint} from 'angular2/src/core/angular_entrypoint';
export {WORKER_APP_ROUTER} from 'angular2/src/web_workers/worker/router_providers';

export function workerAppPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(WORKER_APP_PLATFORM));
  }
  return assertPlatform(WORKER_APP_PLATFORM_MARKER);
}

export function bootstrapApp(
    appComponentType: Type,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef> {
  var appInjector = ReflectiveInjector.resolveAndCreate(
      [WORKER_APP_APPLICATION, isPresent(customProviders) ? customProviders : []],
      workerAppPlatform().injector);
  return coreLoadAndBootstrap(appInjector, appComponentType);
}
