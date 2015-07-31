import {
  MessageBus,
  MessageBusSource,
  MessageBusSink,
  SourceListener
} from "angular2/src/web-workers/shared/message_bus";
import {Type, BaseException} from "angular2/src/facade/lang";
import {Binding} from "angular2/di";

import {bootstrapWebworkerCommon} from "angular2/src/web-workers/worker/application_common";
import {ApplicationRef} from "angular2/src/core/application";
import {Injectable} from "angular2/di";

// TODO(jteplitz602) remove this and compile with lib.webworker.d.ts (#3492)
var _postMessage: (message: any, transferrables?:[ArrayBuffer]) => void = <any>postMessage;

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
    appComponentType: Type, componentInjectableBindings: List<Type | Binding | List<any>> = null):
    Promise<ApplicationRef> {
  var bus: WorkerMessageBus =
      new WorkerMessageBus(new WorkerMessageBusSink(), new WorkerMessageBusSource());

  return bootstrapWebworkerCommon(appComponentType, bus, componentInjectableBindings);
}

@Injectable()
export class WorkerMessageBus implements MessageBus {
  sink: WorkerMessageBusSink;
  source: WorkerMessageBusSource;

  constructor(sink: WorkerMessageBusSink, source: WorkerMessageBusSource) {
    this.sink = sink;
    this.source = source;
  }
}

export class WorkerMessageBusSink implements MessageBusSink {
  public send(message: Object) { _postMessage(message); }
}

export class WorkerMessageBusSource implements MessageBusSource {
  private listenerStore: Map<int, SourceListener>;
  private numListeners: int;

  constructor() {
    this.numListeners = 0;
    this.listenerStore = new Map<int, SourceListener>();
  }

  public addListener(fn: SourceListener): int {
    addEventListener("message", fn);
    this.listenerStore[++this.numListeners] = fn;
    return this.numListeners;
  }

  public removeListener(index: int): void {
    removeEventListener("message", this.listenerStore[index]);
    this.listenerStore.delete(index);
  }
}
