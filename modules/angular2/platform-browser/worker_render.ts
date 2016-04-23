import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {
  ApplicationRef,
  PlatformRef,
  ReflectiveInjector,
  Provider,
  getPlatform,
  createPlatform,
  assertPlatform
} from 'angular2/core';
import {WORKER_RENDER_APPLICATION} from 'angular2/src/platform/worker_render';
import {
  WORKER_SCRIPT,
  WORKER_RENDER_PLATFORM,
  WORKER_RENDER_PLATFORM_MARKER
} from 'angular2/src/platform/worker_render_common';

export {
  WORKER_SCRIPT,
  WORKER_RENDER_PLATFORM,
  initializeGenericWorkerRenderer,
  WORKER_RENDER_APPLICATION_COMMON
} from 'angular2/src/platform/worker_render_common';
export {WORKER_RENDER_APPLICATION, WebWorkerInstance} from 'angular2/src/platform/worker_render';
export {
  ClientMessageBroker,
  ClientMessageBrokerFactory,
  FnArg,
  UiArguments
} from '../src/web_workers/shared/client_message_broker';
export {
  ReceivedMessage,
  ServiceMessageBroker,
  ServiceMessageBrokerFactory
} from '../src/web_workers/shared/service_message_broker';
export {PRIMITIVE} from '../src/web_workers/shared/serializer';
export * from '../src/web_workers/shared/message_bus';

/**
 * @deprecated Use WORKER_RENDER_APPLICATION
 */
export const WORKER_RENDER_APP = WORKER_RENDER_APPLICATION;
export {WORKER_RENDER_ROUTER} from 'angular2/src/web_workers/ui/router_providers';

export function workerRenderPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(WORKER_RENDER_PLATFORM));
  }
  return assertPlatform(WORKER_RENDER_PLATFORM_MARKER);
}

export function bootstrapRender(
    workerScriptUri: string,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ApplicationRef> {
  var pf = ReflectiveInjector.resolveAndCreate(WORKER_RENDER_PLATFORM);
  var app = ReflectiveInjector.resolveAndCreate(
      [
        WORKER_RENDER_APPLICATION,
        new Provider(WORKER_SCRIPT, {useValue: workerScriptUri}),
        isPresent(customProviders) ? customProviders : []
      ],
      workerRenderPlatform().injector);
  // Return a promise so that we keep the same semantics as Dart,
  // and we might want to wait for the app side to come up
  // in the future...
  return PromiseWrapper.resolve(app.get(ApplicationRef));
}
