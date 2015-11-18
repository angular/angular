var testing_internal_1 = require('angular2/testing_internal');
var async_1 = require('angular2/src/facade/async');
var message_bus_util_1 = require('./message_bus_util');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
function main() {
    /**
     * Tests the PostMessageBus in TypeScript and the IsolateMessageBus in Dart
     */
    testing_internal_1.describe("MessageBus", function () {
        var bus;
        testing_internal_1.beforeEach(function () { bus = message_bus_util_1.createConnectedMessageBus(); });
        testing_internal_1.it("should pass messages in the same channel from sink to source", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var CHANNEL = "CHANNEL 1";
            var MESSAGE = "Test message";
            bus.initChannel(CHANNEL, false);
            var fromEmitter = bus.from(CHANNEL);
            async_1.ObservableWrapper.subscribe(fromEmitter, function (message) {
                testing_internal_1.expect(message).toEqual(MESSAGE);
                async.done();
            });
            var toEmitter = bus.to(CHANNEL);
            async_1.ObservableWrapper.callNext(toEmitter, MESSAGE);
        }));
        testing_internal_1.it("should broadcast", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var CHANNEL = "CHANNEL 1";
            var MESSAGE = "TESTING";
            var NUM_LISTENERS = 2;
            bus.initChannel(CHANNEL, false);
            var callCount = 0;
            var emitHandler = function (message) {
                testing_internal_1.expect(message).toEqual(MESSAGE);
                callCount++;
                if (callCount == NUM_LISTENERS) {
                    async.done();
                }
            };
            for (var i = 0; i < NUM_LISTENERS; i++) {
                var emitter = bus.from(CHANNEL);
                async_1.ObservableWrapper.subscribe(emitter, emitHandler);
            }
            var toEmitter = bus.to(CHANNEL);
            async_1.ObservableWrapper.callNext(toEmitter, MESSAGE);
        }));
        testing_internal_1.it("should keep channels independent", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var CHANNEL_ONE = "CHANNEL 1";
            var CHANNEL_TWO = "CHANNEL 2";
            var MESSAGE_ONE = "This is a message on CHANNEL 1";
            var MESSAGE_TWO = "This is a message on CHANNEL 2";
            var callCount = 0;
            bus.initChannel(CHANNEL_ONE, false);
            bus.initChannel(CHANNEL_TWO, false);
            var firstFromEmitter = bus.from(CHANNEL_ONE);
            async_1.ObservableWrapper.subscribe(firstFromEmitter, function (message) {
                testing_internal_1.expect(message).toEqual(MESSAGE_ONE);
                callCount++;
                if (callCount == 2) {
                    async.done();
                }
            });
            var secondFromEmitter = bus.from(CHANNEL_TWO);
            async_1.ObservableWrapper.subscribe(secondFromEmitter, function (message) {
                testing_internal_1.expect(message).toEqual(MESSAGE_TWO);
                callCount++;
                if (callCount == 2) {
                    async.done();
                }
            });
            var firstToEmitter = bus.to(CHANNEL_ONE);
            async_1.ObservableWrapper.callNext(firstToEmitter, MESSAGE_ONE);
            var secondToEmitter = bus.to(CHANNEL_TWO);
            async_1.ObservableWrapper.callNext(secondToEmitter, MESSAGE_TWO);
        }));
    });
    testing_internal_1.describe("PostMessageBusSink", function () {
        var bus;
        var CHANNEL = "Test Channel";
        function setup(runInZone, zone) {
            bus.attachToZone(zone);
            bus.initChannel(CHANNEL, runInZone);
        }
        /**
         * Flushes pending messages and then runs the given function.
         */
        // TODO(mlaval): timeout is fragile, test to be rewritten
        function flushMessages(fn) { async_1.TimerWrapper.setTimeout(fn, 50); }
        testing_internal_1.beforeEach(function () { bus = message_bus_util_1.createConnectedMessageBus(); });
        testing_internal_1.it("should buffer messages and wait for the zone to exit before sending", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, ng_zone_1.NgZone], function (async, zone) {
            setup(true, zone);
            var wasCalled = false;
            async_1.ObservableWrapper.subscribe(bus.from(CHANNEL), function (message) { wasCalled = true; });
            async_1.ObservableWrapper.callNext(bus.to(CHANNEL), "hi");
            flushMessages(function () {
                testing_internal_1.expect(wasCalled).toBeFalsy();
                zone.simulateZoneExit();
                flushMessages(function () {
                    testing_internal_1.expect(wasCalled).toBeTruthy();
                    async.done();
                });
            });
        }), 500);
        testing_internal_1.it("should send messages immediatly when run outside the zone", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, ng_zone_1.NgZone], function (async, zone) {
            setup(false, zone);
            var wasCalled = false;
            async_1.ObservableWrapper.subscribe(bus.from(CHANNEL), function (message) { wasCalled = true; });
            async_1.ObservableWrapper.callNext(bus.to(CHANNEL), "hi");
            flushMessages(function () {
                testing_internal_1.expect(wasCalled).toBeTruthy();
                async.done();
            });
        }), 500);
    });
}
exports.main = main;
//# sourceMappingURL=message_bus_spec.js.map