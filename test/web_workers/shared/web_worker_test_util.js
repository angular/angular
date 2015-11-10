var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var mock_event_emitter_1 = require('./mock_event_emitter');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * Returns two MessageBus instances that are attached to each other.
 * Such that whatever goes into one's sink comes out the others source.
 */
function createPairedMessageBuses() {
    var firstChannels = {};
    var workerMessageBusSink = new MockMessageBusSink(firstChannels);
    var uiMessageBusSource = new MockMessageBusSource(firstChannels);
    var secondChannels = {};
    var uiMessageBusSink = new MockMessageBusSink(secondChannels);
    var workerMessageBusSource = new MockMessageBusSource(secondChannels);
    return new PairedMessageBuses(new MockMessageBus(uiMessageBusSink, uiMessageBusSource), new MockMessageBus(workerMessageBusSink, workerMessageBusSource));
}
exports.createPairedMessageBuses = createPairedMessageBuses;
var PairedMessageBuses = (function () {
    function PairedMessageBuses(ui, worker) {
        this.ui = ui;
        this.worker = worker;
    }
    return PairedMessageBuses;
})();
exports.PairedMessageBuses = PairedMessageBuses;
var MockMessageBusSource = (function () {
    function MockMessageBusSource(_channels) {
        this._channels = _channels;
    }
    MockMessageBusSource.prototype.initChannel = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        if (!collection_1.StringMapWrapper.contains(this._channels, channel)) {
            this._channels[channel] = new mock_event_emitter_1.MockEventEmitter();
        }
    };
    MockMessageBusSource.prototype.from = function (channel) {
        if (!collection_1.StringMapWrapper.contains(this._channels, channel)) {
            throw new exceptions_1.BaseException(channel + " is not set up. Did you forget to call initChannel?");
        }
        return this._channels[channel];
    };
    MockMessageBusSource.prototype.attachToZone = function (zone) { };
    return MockMessageBusSource;
})();
exports.MockMessageBusSource = MockMessageBusSource;
var MockMessageBusSink = (function () {
    function MockMessageBusSink(_channels) {
        this._channels = _channels;
    }
    MockMessageBusSink.prototype.initChannel = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        if (!collection_1.StringMapWrapper.contains(this._channels, channel)) {
            this._channels[channel] = new mock_event_emitter_1.MockEventEmitter();
        }
    };
    MockMessageBusSink.prototype.to = function (channel) {
        if (!collection_1.StringMapWrapper.contains(this._channels, channel)) {
            this._channels[channel] = new mock_event_emitter_1.MockEventEmitter();
        }
        return this._channels[channel];
    };
    MockMessageBusSink.prototype.attachToZone = function (zone) { };
    return MockMessageBusSink;
})();
exports.MockMessageBusSink = MockMessageBusSink;
/**
 * Mock implementation of the {@link MessageBus} for tests.
 * Runs syncronously, and does not support running within the zone.
 */
var MockMessageBus = (function (_super) {
    __extends(MockMessageBus, _super);
    function MockMessageBus(sink, source) {
        _super.call(this);
        this.sink = sink;
        this.source = source;
    }
    MockMessageBus.prototype.initChannel = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        this.sink.initChannel(channel, runInZone);
        this.source.initChannel(channel, runInZone);
    };
    MockMessageBus.prototype.to = function (channel) { return this.sink.to(channel); };
    MockMessageBus.prototype.from = function (channel) { return this.source.from(channel); };
    MockMessageBus.prototype.attachToZone = function (zone) { };
    return MockMessageBus;
})(message_bus_1.MessageBus);
exports.MockMessageBus = MockMessageBus;
//# sourceMappingURL=web_worker_test_util.js.map