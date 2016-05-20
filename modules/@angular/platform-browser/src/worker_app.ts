import {isPresent, isBlank} from './facade/lang';
import {
  WORKER_APP_PLATFORM_PROVIDERS,
  WORKER_APP_PLATFORM_MARKER
} from './webworker/worker_app_common';
import {WORKER_APP_APPLICATION_PROVIDERS} from './webworker/worker_app';
import {
  PlatformRef,
  Type,
  ComponentRef,
  ReflectiveInjector,
  coreLoadAndBootstrap,
  getPlatform,
  createPlatform,
  assertPlatform
} from '@angular/core';

export {
  WORKER_APP_PLATFORM_PROVIDERS,
  WORKER_APP_APPLICATION_COMMON_PROVIDERS
} from './webworker/worker_app_common';
export {WORKER_APP_APPLICATION_PROVIDERS} from './webworker/worker_app';
export {
  ClientMessageBroker,
  ClientMessageBrokerFactory,
  FnArg,
  UiArguments
} from './web_workers/shared/client_message_broker';
export {
  ReceivedMessage,
  ServiceMessageBroker,
  ServiceMessageBrokerFactory
} from './web_workers/shared/service_message_broker';
export {PRIMITIVE} from './web_workers/shared/serializer';
export * from './web_workers/shared/message_bus';
export {WORKER_APP_LOCATION_PROVIDERS} from './web_workers/worker/location_providers';

export function workerAppPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(WORKER_APP_PLATFORM_PROVIDERS));
  }
  return assertPlatform(WORKER_APP_PLATFORM_MARKER);
}

export function bootstrapStaticApp(
    appComponentType: Type,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<any>> {
  var appInjector = ReflectiveInjector.resolveAndCreate(
      [WORKER_APP_APPLICATION_PROVIDERS, isPresent(customProviders) ? customProviders : []],
      workerAppPlatform().injector);
  return coreLoadAndBootstrap(appInjector, appComponentType);
}
