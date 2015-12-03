'use strict';var parse5_adapter_1 = require('angular2/src/platform/server/parse5_adapter');
var post_message_bus_1 = require('angular2/src/web_workers/shared/post_message_bus');
var worker_app_common_1 = require('./worker_app_common');
var _postMessage = postMessage;
function setupWebWorker(zone) {
    parse5_adapter_1.Parse5DomAdapter.makeCurrent();
    var sink = new post_message_bus_1.PostMessageBusSink({
        postMessage: function (message, transferrables) { _postMessage(message, transferrables); }
    });
    var source = new post_message_bus_1.PostMessageBusSource();
    var bus = new post_message_bus_1.PostMessageBus(sink, source);
    return worker_app_common_1.genericWorkerAppProviders(bus, zone);
}
exports.setupWebWorker = setupWebWorker;
//# sourceMappingURL=worker_app.js.map