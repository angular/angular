import {StringMap, StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {
  MessageBusSink,
  MessageBusSource,
  MessageBus
} from 'angular2/src/web_workers/shared/message_bus';
import {MockEventEmitter} from './mock_event_emitter';

/**
 * Returns two MessageBus instances that are attached to each other.
 * Such that whatever goes into one's sink comes out the others source.
 */
export function createPairedMessageBuses(): PairedMessageBuses {
  var firstChannels: StringMap<string, MockEventEmitter> = {};
  var workerMessageBusSink = new MockMessageBusSink(firstChannels);
  var uiMessageBusSource = new MockMessageBusSource(firstChannels);

  var secondChannels: StringMap<string, MockEventEmitter> = {};
  var uiMessageBusSink = new MockMessageBusSink(secondChannels);
  var workerMessageBusSource = new MockMessageBusSource(secondChannels);

  return new PairedMessageBuses(new MockMessageBus(uiMessageBusSink, uiMessageBusSource),
                                new MockMessageBus(workerMessageBusSink, workerMessageBusSource));
}

export class PairedMessageBuses {
  constructor(public ui: MessageBus, public worker: MessageBus) {}
}

export class MockMessageBusSource implements MessageBusSource {
  constructor(private _channels: StringMap<string, MockEventEmitter>) {}

  from(channel: string): MockEventEmitter {
    if (!StringMapWrapper.contains(this._channels, channel)) {
      this._channels[channel] = new MockEventEmitter();
    }
    return this._channels[channel];
  }
}

export class MockMessageBusSink implements MessageBusSink {
  constructor(private _channels: StringMap<string, MockEventEmitter>) {}

  to(channel: string): MockEventEmitter {
    if (!StringMapWrapper.contains(this._channels, channel)) {
      this._channels[channel] = new MockEventEmitter();
    }
    return this._channels[channel];
  }
}

export class MockMessageBus extends MessageBus {
  constructor(public sink: MockMessageBusSink, public source: MockMessageBusSource) { super(); }


  to(channel: string): MockEventEmitter { return this.sink.to(channel); }

  from(channel: string): MockEventEmitter { return this.source.from(channel); }
}
