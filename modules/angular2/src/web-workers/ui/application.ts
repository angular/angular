import {
  MessageBus,
  MessageBusSource,
  MessageBusSink,
  SourceListener
} from "angular2/src/web-workers/shared/message_bus";
import {BaseException} from "angular2/src/facade/lang";

/**
 * Bootstrapping a WebWorker
 *
 * You instantiate a WebWorker application by calling bootstrap with the URI of your worker's index
 * script
 * Note: The WebWorker script must call bootstrapWebworker once it is set up to complete the
 * bootstrapping process
 */
export function bootstrap(uri: string): void {
  throw new BaseException("Not Implemented");
}

export function spawnWorker(uri: string): MessageBus {
  var worker: Worker = new Worker(uri);
  return new UIMessageBus(new UIMessageBusSink(worker), new UIMessageBusSource(worker));
}

export class UIMessageBus implements MessageBus {
  constructor(public sink: UIMessageBusSink, public source: UIMessageBusSource) {}
}

export class UIMessageBusSink implements MessageBusSink {
  constructor(private _worker: Worker) {}

  send(message: Object): void { this._worker.postMessage(message); }
}

export class UIMessageBusSource implements MessageBusSource {
  constructor(private _worker: Worker) {}

  listen(fn: SourceListener): void { this._worker.addEventListener("message", fn); }
}
