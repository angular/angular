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
import {WORKER_RENDER_APPLICATION} from 'angular2/src/platform/worker_render';

/**
 * @deprecated Use WORKER_RENDER_APPLICATION
 */
export const WORKER_RENDER_APP = WORKER_RENDER_APPLICATION;
export {WORKER_RENDER_ROUTER} from 'angular2/src/web_workers/ui/router_providers';
