import {
  PostMessageBus,
  PostMessageBusSink,
  PostMessageBusSource
} from 'angular2/src/web_workers/shared/post_message_bus';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {BaseException} from "angular2/src/core/facade/lang";
import {bootstrapUICommon} from "angular2/src/web_workers/ui/impl";
export * from 'angular2/src/web_workers/shared/message_bus';

/**
 * Bootstrapping a WebWorker
 *
 * You instantiate a WebWorker application by calling bootstrap with the URI of your worker's index
 * script
 * Note: The WebWorker script must call bootstrapWebworker once it is set up to complete the
 * bootstrapping process
 */
export function bootstrap(uri: string): MessageBus {
  var messageBus = spawnWebWorker(uri);
  bootstrapUICommon(messageBus);
  return messageBus;
}

export function spawnWebWorker(uri: string): MessageBus {
  var webWorker: Worker = new Worker(uri);
  var sink = new PostMessageBusSink(webWorker);
  var source = new PostMessageBusSource(webWorker);
  return new PostMessageBus(sink, source);
}
