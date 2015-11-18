/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_bindings_1 = require("./di_bindings");
var application_ref_1 = require('angular2/src/core/application_ref');
var di_1 = require('angular2/src/core/di');
var browser_adapter_1 = require('angular2/src/platform/browser/browser_adapter');
var wtf_init_1 = require('angular2/src/core/profile/wtf_init');
var setup_1 = require('angular2/src/web_workers/ui/setup');
var renderer_1 = require('angular2/src/web_workers/ui/renderer');
var xhr_impl_1 = require('angular2/src/web_workers/ui/xhr_impl');
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
/**
 * Creates a zone, sets up the DI providers
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
function bootstrapUICommon(bus) {
    browser_adapter_1.BrowserDomAdapter.makeCurrent();
    var zone = application_ref_1.createNgZone();
    wtf_init_1.wtfInit();
    bus.attachToZone(zone);
    return zone.run(function () {
        var injector = di_bindings_1.createInjector(zone, bus);
        injector.get(renderer_1.MessageBasedRenderer).start();
        injector.get(xhr_impl_1.MessageBasedXHRImpl).start();
        injector.get(setup_1.WebWorkerSetup).start();
        return injector.get(WebWorkerApplication);
    });
}
exports.bootstrapUICommon = bootstrapUICommon;
var WebWorkerApplication = (function () {
    function WebWorkerApplication(_clientMessageBrokerFactory, _serviceMessageBrokerFactory) {
        this._clientMessageBrokerFactory = _clientMessageBrokerFactory;
        this._serviceMessageBrokerFactory = _serviceMessageBrokerFactory;
    }
    WebWorkerApplication.prototype.createClientMessageBroker = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        return this._clientMessageBrokerFactory.createMessageBroker(channel, runInZone);
    };
    WebWorkerApplication.prototype.createServiceMessageBroker = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        return this._serviceMessageBrokerFactory.createMessageBroker(channel, runInZone);
    };
    WebWorkerApplication = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [client_message_broker_1.ClientMessageBrokerFactory, service_message_broker_1.ServiceMessageBrokerFactory])
    ], WebWorkerApplication);
    return WebWorkerApplication;
})();
exports.WebWorkerApplication = WebWorkerApplication;
//# sourceMappingURL=impl.js.map