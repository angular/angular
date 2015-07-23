import {
  MessageBus,
  MessageBusSource,
  MessageBusSink,
  SourceListener
} from "angular2/src/web-workers/shared/message_bus";
import {Type, BaseException} from "angular2/src/facade/lang";
import {Binding} from "angular2/di";

import {ApplicationRef} from "angular2/src/core/application";

/**
 * Bootstrapping a Webworker Application
 *
 * You instantiate the application side by calling bootstrapWebworker from your webworker index
 * script.
 * You can call bootstrapWebworker() exactly as you would call bootstrap() in a regular Angular
 * application
 * See the bootstrap() docs for more details.
 */
export function bootstrapWebworker(
    appComponentType: Type, componentInjectableBindings: List<Type | Binding | List<any>> = null,
    errorReporter: Function = null): Promise<ApplicationRef> {
  throw new BaseException("Not Implemented");
}

export class WorkerMessageBus implements MessageBus {
  sink: WorkerMessageBusSink;
  source: WorkerMessageBusSource;

  constructor(sink: WorkerMessageBusSink, source: WorkerMessageBusSource) {
    this.sink = sink;
    this.source = source;
  }
}

export class WorkerMessageBusSink implements MessageBusSink {
  public send(message: Object) { postMessage(message, null); }
}

export class WorkerMessageBusSource implements MessageBusSource {
  public listen(fn: SourceListener) { addEventListener("message", fn); }
}
