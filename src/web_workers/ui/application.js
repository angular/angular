'use strict';function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var post_message_bus_1 = require('angular2/src/web_workers/shared/post_message_bus');
var impl_1 = require('angular2/src/web_workers/ui/impl');
var impl_2 = require('angular2/src/web_workers/ui/impl');
exports.WebWorkerApplication = impl_2.WebWorkerApplication;
__export(require('angular2/src/web_workers/shared/message_bus'));
/**
 * Bootstrapping a WebWorker
 *
 * You instantiate a WebWorker application by calling bootstrap with the URI of your worker's index
 * script
 * Note: The WebWorker script must call bootstrapWebworker once it is set up to complete the
 * bootstrapping process
 */
function bootstrap(uri) {
    var instance = spawnWebWorker(uri);
    instance.app = impl_1.bootstrapUICommon(instance.bus);
    return instance;
}
exports.bootstrap = bootstrap;
function spawnWebWorker(uri) {
    var webWorker = new Worker(uri);
    var sink = new post_message_bus_1.PostMessageBusSink(webWorker);
    var source = new post_message_bus_1.PostMessageBusSource(webWorker);
    var bus = new post_message_bus_1.PostMessageBus(sink, source);
    return new WebWorkerInstance(null, webWorker, bus);
}
exports.spawnWebWorker = spawnWebWorker;
/**
 * Wrapper class that exposes the {@link WebWorkerApplication}
 * Isolate instance and underlying {@link MessageBus} for lower level message passing.
 */
var WebWorkerInstance = (function () {
    function WebWorkerInstance(app, worker, bus) {
        this.app = app;
        this.worker = worker;
        this.bus = bus;
    }
    return WebWorkerInstance;
})();
exports.WebWorkerInstance = WebWorkerInstance;
//# sourceMappingURL=application.js.map