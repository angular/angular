'use strict';var xhr_1 = require('angular2/src/compiler/xhr');
var xhr_impl_1 = require('angular2/src/web_workers/worker/xhr_impl');
var collection_1 = require('angular2/src/facade/collection');
var app_root_url_1 = require('angular2/src/compiler/app_root_url');
var renderer_1 = require('angular2/src/web_workers/worker/renderer');
var lang_1 = require('angular2/src/facade/lang');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var api_1 = require('angular2/src/core/render/api');
var core_1 = require('angular2/core');
var common_1 = require("angular2/common");
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
var compiler_1 = require('angular2/src/compiler/compiler');
var serializer_1 = require("angular2/src/web_workers/shared/serializer");
var api_2 = require("angular2/src/web_workers/shared/api");
var di_1 = require('angular2/src/core/di');
var render_proto_view_ref_store_1 = require('angular2/src/web_workers/shared/render_proto_view_ref_store');
var render_view_with_fragments_store_1 = require('angular2/src/web_workers/shared/render_view_with_fragments_store');
var event_dispatcher_1 = require('angular2/src/web_workers/worker/event_dispatcher');
var async_1 = require('angular2/src/facade/async');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var async_2 = require('angular2/src/facade/async');
var PrintLogger = (function () {
    function PrintLogger() {
        this.log = lang_1.print;
        this.logError = lang_1.print;
        this.logGroup = lang_1.print;
    }
    PrintLogger.prototype.logGroupEnd = function () { };
    return PrintLogger;
})();
exports.WORKER_APP_PLATFORM = lang_1.CONST_EXPR([core_1.PLATFORM_COMMON_PROVIDERS]);
exports.WORKER_APP_COMMON_PROVIDERS = lang_1.CONST_EXPR([
    core_1.APPLICATION_COMMON_PROVIDERS,
    compiler_1.COMPILER_PROVIDERS,
    common_1.FORM_PROVIDERS,
    serializer_1.Serializer,
    new di_1.Provider(core_1.PLATFORM_PIPES, { useValue: common_1.COMMON_PIPES, multi: true }),
    new di_1.Provider(core_1.PLATFORM_DIRECTIVES, { useValue: common_1.COMMON_DIRECTIVES, multi: true }),
    new di_1.Provider(client_message_broker_1.ClientMessageBrokerFactory, { useClass: client_message_broker_1.ClientMessageBrokerFactory_ }),
    new di_1.Provider(service_message_broker_1.ServiceMessageBrokerFactory, { useClass: service_message_broker_1.ServiceMessageBrokerFactory_ }),
    renderer_1.WebWorkerRenderer,
    new di_1.Provider(api_1.Renderer, { useExisting: renderer_1.WebWorkerRenderer }),
    new di_1.Provider(api_2.ON_WEB_WORKER, { useValue: true }),
    render_view_with_fragments_store_1.RenderViewWithFragmentsStore,
    render_proto_view_ref_store_1.RenderProtoViewRefStore,
    new di_1.Provider(core_1.ExceptionHandler, { useFactory: _exceptionHandler, deps: [] }),
    xhr_impl_1.WebWorkerXHRImpl,
    new di_1.Provider(xhr_1.XHR, { useExisting: xhr_impl_1.WebWorkerXHRImpl }),
    event_dispatcher_1.WebWorkerEventDispatcher
]);
function _exceptionHandler() {
    return new core_1.ExceptionHandler(new PrintLogger());
}
/**
 * Asynchronously returns a list of providers that can be used to initialize the
 * Application injector.
 * Also takes care of attaching the {@link MessageBus} to the given {@link NgZone}.
 */
function genericWorkerAppProviders(bus, zone) {
    var bootstrapProcess = async_1.PromiseWrapper.completer();
    bus.attachToZone(zone);
    bus.initChannel(messaging_api_1.SETUP_CHANNEL, false);
    var subscription;
    var emitter = bus.from(messaging_api_1.SETUP_CHANNEL);
    subscription = async_2.ObservableWrapper.subscribe(emitter, function (initData) {
        var bindings = collection_1.ListWrapper.concat(exports.WORKER_APP_COMMON_PROVIDERS, [
            new di_1.Provider(message_bus_1.MessageBus, { useValue: bus }),
            new di_1.Provider(app_root_url_1.AppRootUrl, { useValue: new app_root_url_1.AppRootUrl(initData['rootUrl']) }),
        ]);
        bootstrapProcess.resolve(bindings);
        async_2.ObservableWrapper.dispose(subscription);
    });
    async_2.ObservableWrapper.callNext(bus.to(messaging_api_1.SETUP_CHANNEL), "ready");
    return bootstrapProcess.promise;
}
exports.genericWorkerAppProviders = genericWorkerAppProviders;
//# sourceMappingURL=worker_app_common.js.map