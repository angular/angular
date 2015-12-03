'use strict';function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var post_message_bus_1 = require('angular2/src/web_workers/shared/post_message_bus');
var application_common_1 = require("angular2/src/web_workers/worker/application_common");
__export(require("angular2/src/web_workers/shared/message_bus"));
var parse5_adapter_1 = require('angular2/src/platform/server/parse5_adapter');
var _postMessage = postMessage;
/**
 * Bootstrapping a Webworker Application
 *
 * You instantiate the application side by calling bootstrapWebworker from your webworker index
 * script.
 * You can call bootstrapWebworker() exactly as you would call bootstrap() in a regular Angular
 * application
 * See the bootstrap() docs for more details.
 */
function bootstrapWebWorker(appComponentType, componentInjectableProviders) {
    if (componentInjectableProviders === void 0) { componentInjectableProviders = null; }
    parse5_adapter_1.Parse5DomAdapter.makeCurrent();
    var sink = new post_message_bus_1.PostMessageBusSink({
        postMessage: function (message, transferrables) { _postMessage(message, transferrables); }
    });
    var source = new post_message_bus_1.PostMessageBusSource();
    var bus = new post_message_bus_1.PostMessageBus(sink, source);
    return application_common_1.bootstrapWebWorkerCommon(appComponentType, bus, componentInjectableProviders);
}
exports.bootstrapWebWorker = bootstrapWebWorker;
//# sourceMappingURL=application.js.map