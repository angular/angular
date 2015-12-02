library angular2.test.web_workers.shared.message_bus_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        it,
        expect,
        beforeEach,
        createTestInjector,
        beforeEachProviders,
        SpyObject,
        proxy;
import "package:angular2/src/facade/async.dart"
    show ObservableWrapper, TimerWrapper;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "message_bus_util.dart" show createConnectedMessageBus;
import "package:angular2/src/mock/ng_zone_mock.dart" show MockNgZone;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;

main() {
  /**
   * Tests the PostMessageBus in TypeScript and the IsolateMessageBus in Dart
   */
  describe("MessageBus", () {
    MessageBus bus;
    beforeEach(() {
      bus = createConnectedMessageBus();
    });
    it(
        "should pass messages in the same channel from sink to source",
        inject([AsyncTestCompleter], (async) {
          const CHANNEL = "CHANNEL 1";
          const MESSAGE = "Test message";
          bus.initChannel(CHANNEL, false);
          var fromEmitter = bus.from(CHANNEL);
          ObservableWrapper.subscribe(fromEmitter, (dynamic message) {
            expect(message).toEqual(MESSAGE);
            async.done();
          });
          var toEmitter = bus.to(CHANNEL);
          ObservableWrapper.callEmit(toEmitter, MESSAGE);
        }));
    it(
        "should broadcast",
        inject([AsyncTestCompleter], (async) {
          const CHANNEL = "CHANNEL 1";
          const MESSAGE = "TESTING";
          const NUM_LISTENERS = 2;
          bus.initChannel(CHANNEL, false);
          var callCount = 0;
          var emitHandler = (dynamic message) {
            expect(message).toEqual(MESSAGE);
            callCount++;
            if (callCount == NUM_LISTENERS) {
              async.done();
            }
          };
          for (var i = 0; i < NUM_LISTENERS; i++) {
            var emitter = bus.from(CHANNEL);
            ObservableWrapper.subscribe(emitter, emitHandler);
          }
          var toEmitter = bus.to(CHANNEL);
          ObservableWrapper.callEmit(toEmitter, MESSAGE);
        }));
    it(
        "should keep channels independent",
        inject([AsyncTestCompleter], (async) {
          const CHANNEL_ONE = "CHANNEL 1";
          const CHANNEL_TWO = "CHANNEL 2";
          const MESSAGE_ONE = "This is a message on CHANNEL 1";
          const MESSAGE_TWO = "This is a message on CHANNEL 2";
          var callCount = 0;
          bus.initChannel(CHANNEL_ONE, false);
          bus.initChannel(CHANNEL_TWO, false);
          var firstFromEmitter = bus.from(CHANNEL_ONE);
          ObservableWrapper.subscribe(firstFromEmitter, (message) {
            expect(message).toEqual(MESSAGE_ONE);
            callCount++;
            if (callCount == 2) {
              async.done();
            }
          });
          var secondFromEmitter = bus.from(CHANNEL_TWO);
          ObservableWrapper.subscribe(secondFromEmitter, (message) {
            expect(message).toEqual(MESSAGE_TWO);
            callCount++;
            if (callCount == 2) {
              async.done();
            }
          });
          var firstToEmitter = bus.to(CHANNEL_ONE);
          ObservableWrapper.callEmit(firstToEmitter, MESSAGE_ONE);
          var secondToEmitter = bus.to(CHANNEL_TWO);
          ObservableWrapper.callEmit(secondToEmitter, MESSAGE_TWO);
        }));
  });
  describe("PostMessageBusSink", () {
    MessageBus bus;
    const CHANNEL = "Test Channel";
    setup(bool runInZone, NgZone zone) {
      bus.attachToZone(zone);
      bus.initChannel(CHANNEL, runInZone);
    }
    /**
     * Flushes pending messages and then runs the given function.
     */

    // TODO(mlaval): timeout is fragile, test to be rewritten
    flushMessages(dynamic /* () => void */ fn) {
      TimerWrapper.setTimeout(fn, 50);
    }
    beforeEach(() {
      bus = createConnectedMessageBus();
    });
    it(
        "should buffer messages and wait for the zone to exit before sending",
        inject([AsyncTestCompleter, NgZone], (async, MockNgZone zone) {
          setup(true, zone);
          var wasCalled = false;
          ObservableWrapper.subscribe(bus.from(CHANNEL), (message) {
            wasCalled = true;
          });
          ObservableWrapper.callEmit(bus.to(CHANNEL), "hi");
          flushMessages(() {
            expect(wasCalled).toBeFalsy();
            zone.simulateZoneExit();
            flushMessages(() {
              expect(wasCalled).toBeTruthy();
              async.done();
            });
          });
        }),
        500);
    it(
        "should send messages immediatly when run outside the zone",
        inject([AsyncTestCompleter, NgZone], (async, MockNgZone zone) {
          setup(false, zone);
          var wasCalled = false;
          ObservableWrapper.subscribe(bus.from(CHANNEL), (message) {
            wasCalled = true;
          });
          ObservableWrapper.callEmit(bus.to(CHANNEL), "hi");
          flushMessages(() {
            expect(wasCalled).toBeTruthy();
            async.done();
          });
        }),
        10000);
  });
}
