import {
  MessageBus,
  MessageBusSource,
  MessageBusSink,
  SourceListener
} from "angular2/src/web-workers/shared/message_bus";
import {MapWrapper} from "angular2/src/facade/collection";

export class MockMessageBusSource implements MessageBusSource {
  private _listenerStore: Map<int, SourceListener> = new Map<int, SourceListener>();
  private _numListeners: number = 0;

  addListener(fn: SourceListener): int {
    this._listenerStore.set(++this._numListeners, fn);
    return this._numListeners;
  }

  removeListener(index: int): void { MapWrapper.delete(this._listenerStore, index); }

  receive(message: Object): void {
    MapWrapper.forEach(this._listenerStore, (fn: SourceListener, key: int) => { fn(message); });
  }
}

export class MockMessageBusSink implements MessageBusSink {
  private _sendTo: MockMessageBusSource;

  send(message: Object): void { this._sendTo.receive({'data': message}); }

  attachToSource(source: MockMessageBusSource) { this._sendTo = source; }
}

export class MockMessageBus implements MessageBus {
  constructor(public sink: MockMessageBusSink, public source: MockMessageBusSource) {}
  attachToBus(bus: MockMessageBus) { this.sink.attachToSource(bus.source); }
}
