var post_message_bus_1 = require('angular2/src/web_workers/shared/post_message_bus');
/*
 * Returns a PostMessageBus thats sink is connected to its own source.
 * Useful for testing the sink and source.
 */
function createConnectedMessageBus() {
    var mockPostMessage = new MockPostMessage();
    var source = new post_message_bus_1.PostMessageBusSource(mockPostMessage);
    var sink = new post_message_bus_1.PostMessageBusSink(mockPostMessage);
    return new post_message_bus_1.PostMessageBus(sink, source);
}
exports.createConnectedMessageBus = createConnectedMessageBus;
var MockPostMessage = (function () {
    function MockPostMessage() {
    }
    MockPostMessage.prototype.addEventListener = function (type, listener, useCapture) {
        if (type === "message") {
            this._listener = listener;
        }
    };
    MockPostMessage.prototype.postMessage = function (data, transfer) { this._listener({ data: data }); };
    return MockPostMessage;
})();
//# sourceMappingURL=message_bus_util.js.map