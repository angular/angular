library angular2.test.web_workers.shared.web_worker_test_util;

import "package:angular2/src/facade/collection.dart"
    show StringMapWrapper, ListWrapper;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBusSink, MessageBusSource, MessageBus;
import "mock_event_emitter.dart" show MockEventEmitter;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;

/**
 * Returns two MessageBus instances that are attached to each other.
 * Such that whatever goes into one's sink comes out the others source.
 */
PairedMessageBuses createPairedMessageBuses() {
  Map<String, MockEventEmitter<dynamic>> firstChannels = {};
  var workerMessageBusSink = new MockMessageBusSink(firstChannels);
  var uiMessageBusSource = new MockMessageBusSource(firstChannels);
  Map<String, MockEventEmitter<dynamic>> secondChannels = {};
  var uiMessageBusSink = new MockMessageBusSink(secondChannels);
  var workerMessageBusSource = new MockMessageBusSource(secondChannels);
  return new PairedMessageBuses(
      new MockMessageBus(uiMessageBusSink, uiMessageBusSource),
      new MockMessageBus(workerMessageBusSink, workerMessageBusSource));
}

class PairedMessageBuses {
  MessageBus ui;
  MessageBus worker;
  PairedMessageBuses(this.ui, this.worker) {}
}

class MockMessageBusSource implements MessageBusSource {
  Map<String, MockEventEmitter<dynamic>> _channels;
  MockMessageBusSource(this._channels) {}
  initChannel(String channel, [runInZone = true]) {
    if (!StringMapWrapper.contains(this._channels, channel)) {
      this._channels[channel] = new MockEventEmitter();
    }
  }

  MockEventEmitter<dynamic> from(String channel) {
    if (!StringMapWrapper.contains(this._channels, channel)) {
      throw new BaseException(
          '''${ channel} is not set up. Did you forget to call initChannel?''');
    }
    return this._channels[channel];
  }

  attachToZone(NgZone zone) {}
}

class MockMessageBusSink implements MessageBusSink {
  Map<String, MockEventEmitter<dynamic>> _channels;
  MockMessageBusSink(this._channels) {}
  initChannel(String channel, [runInZone = true]) {
    if (!StringMapWrapper.contains(this._channels, channel)) {
      this._channels[channel] = new MockEventEmitter();
    }
  }

  MockEventEmitter<dynamic> to(String channel) {
    if (!StringMapWrapper.contains(this._channels, channel)) {
      this._channels[channel] = new MockEventEmitter();
    }
    return this._channels[channel];
  }

  attachToZone(NgZone zone) {}
}

/**
 * Mock implementation of the [MessageBus] for tests.
 * Runs syncronously, and does not support running within the zone.
 */
class MockMessageBus extends MessageBus {
  MockMessageBusSink sink;
  MockMessageBusSource source;
  MockMessageBus(this.sink, this.source) : super() {
    /* super call moved to initializer */;
  }
  initChannel(String channel, [runInZone = true]) {
    this.sink.initChannel(channel, runInZone);
    this.source.initChannel(channel, runInZone);
  }

  MockEventEmitter<dynamic> to(String channel) {
    return this.sink.to(channel);
  }

  MockEventEmitter<dynamic> from(String channel) {
    return this.source.from(channel);
  }

  attachToZone(NgZone zone) {}
}
