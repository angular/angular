var di_1 = require('angular2/src/core/di');
var forms_1 = require('angular2/src/common/forms');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
var xhr_1 = require('angular2/src/compiler/xhr');
var xhr_impl_1 = require('angular2/src/web_workers/worker/xhr_impl');
var app_root_url_1 = require('angular2/src/compiler/app_root_url');
var renderer_1 = require('./renderer');
var api_1 = require('angular2/src/core/render/api');
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var application_ref_1 = require('angular2/src/core/application_ref');
var serializer_1 = require("angular2/src/web_workers/shared/serializer");
var api_2 = require("angular2/src/web_workers/shared/api");
var render_proto_view_ref_store_1 = require('angular2/src/web_workers/shared/render_proto_view_ref_store');
var render_view_with_fragments_store_1 = require('angular2/src/web_workers/shared/render_view_with_fragments_store');
var async_2 = require('angular2/src/facade/async');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var event_dispatcher_1 = require('angular2/src/web_workers/worker/event_dispatcher');
var compiler_1 = require('angular2/src/compiler/compiler');
/**
 * Initialize the Angular 'platform' on the page in a manner suitable for applications
 * running in a web worker. Applications running on a web worker do not have direct
 * access to DOM APIs.
 *
 * See {@link PlatformRef} for details on the Angular platform.
 *
 *##Without specified providers
 *
 * If no providers are specified, `platform`'s behavior depends on whether an existing
 * platform exists:
 *
 * If no platform exists, a new one will be created with the default {@link platformProviders}.
 *
 * If a platform already exists, it will be returned (regardless of what providers it
 * was created with). This is a convenience feature, allowing for multiple applications
 * to be loaded into the same platform without awareness of each other.
 *
 *##With specified providers
 *
 * It is also possible to specify providers to be made in the new platform. These providers
 * will be shared between all applications on the page. For example, an abstraction for
 * the browser cookie jar should be bound at the platform level, because there is only one
 * cookie jar regardless of how many applications on the age will be accessing it.
 *
 * If providers are specified directly, `platform` will create the Angular platform with
 * them if a platform did not exist already. If it did exist, however, an error will be
 * thrown.
 *
 *##For Web Worker Appplications
 *
 * This version of `platform` initializes Angular for use with applications
 * that do not directly touch the DOM, such as applications which run in a
 * web worker context. Applications that need direct access to the DOM should
 * use `platform` from `core/application_common` instead.
 */
function platform(bindings) {
    return application_ref_1.platformCommon(bindings);
}
exports.platform = platform;
var PrintLogger = (function () {
    function PrintLogger() {
        this.log = lang_1.print;
        this.logError = lang_1.print;
        this.logGroup = lang_1.print;
    }
    PrintLogger.prototype.logGroupEnd = function () { };
    return PrintLogger;
})();
function webWorkerProviders(appComponentType, bus, initData) {
    return [
        compiler_1.compilerProviders(),
        serializer_1.Serializer,
        di_1.provide(message_bus_1.MessageBus, { useValue: bus }),
        di_1.provide(client_message_broker_1.ClientMessageBrokerFactory, { useClass: client_message_broker_1.ClientMessageBrokerFactory_ }),
        di_1.provide(service_message_broker_1.ServiceMessageBrokerFactory, { useClass: service_message_broker_1.ServiceMessageBrokerFactory_ }),
        renderer_1.WebWorkerRenderer,
        di_1.provide(api_1.Renderer, { useExisting: renderer_1.WebWorkerRenderer }),
        di_1.provide(api_2.ON_WEB_WORKER, { useValue: true }),
        render_view_with_fragments_store_1.RenderViewWithFragmentsStore,
        render_proto_view_ref_store_1.RenderProtoViewRefStore,
        di_1.provide(exceptions_1.ExceptionHandler, { useFactory: function () { return new exceptions_1.ExceptionHandler(new PrintLogger()); }, deps: [] }),
        xhr_impl_1.WebWorkerXHRImpl,
        di_1.provide(xhr_1.XHR, { useExisting: xhr_impl_1.WebWorkerXHRImpl }),
        di_1.provide(app_root_url_1.AppRootUrl, { useValue: new app_root_url_1.AppRootUrl(initData['rootUrl']) }),
        event_dispatcher_1.WebWorkerEventDispatcher,
        forms_1.FORM_PROVIDERS
    ];
}
function bootstrapWebWorkerCommon(appComponentType, bus, appProviders) {
    if (appProviders === void 0) { appProviders = null; }
    var bootstrapProcess = async_1.PromiseWrapper.completer();
    var appPromise = platform().asyncApplication(function (zone) {
        // TODO(rado): prepopulate template cache, so applications with only
        // index.html and main.js are possible.
        //
        bus.attachToZone(zone);
        bus.initChannel(messaging_api_1.SETUP_CHANNEL, false);
        var subscription;
        var emitter = bus.from(messaging_api_1.SETUP_CHANNEL);
        subscription = async_2.ObservableWrapper.subscribe(emitter, function (message) {
            var bindings = [application_ref_1.applicationCommonProviders(), webWorkerProviders(appComponentType, bus, message)];
            if (lang_1.isPresent(appProviders)) {
                bindings.push(appProviders);
            }
            bootstrapProcess.resolve(bindings);
            async_2.ObservableWrapper.dispose(subscription);
        });
        async_2.ObservableWrapper.callNext(bus.to(messaging_api_1.SETUP_CHANNEL), "ready");
        return bootstrapProcess.promise;
    });
    return async_1.PromiseWrapper.then(appPromise, function (app) { return app.bootstrap(appComponentType); });
}
exports.bootstrapWebWorkerCommon = bootstrapWebWorkerCommon;
//# sourceMappingURL=application_common.js.map