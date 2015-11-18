'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var async_1 = require('angular2/src/facade/async');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var anchor_based_app_root_url_1 = require('angular2/src/compiler/anchor_based_app_root_url');
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var WebWorkerSetup = (function () {
    function WebWorkerSetup(_bus, anchorBasedAppRootUrl) {
        this._bus = _bus;
        this.rootUrl = anchorBasedAppRootUrl.value;
    }
    WebWorkerSetup.prototype.start = function () {
        var _this = this;
        this._bus.initChannel(messaging_api_1.SETUP_CHANNEL, false);
        var sink = this._bus.to(messaging_api_1.SETUP_CHANNEL);
        var source = this._bus.from(messaging_api_1.SETUP_CHANNEL);
        async_1.ObservableWrapper.subscribe(source, function (message) {
            if (lang_1.StringWrapper.equals(message, "ready")) {
                async_1.ObservableWrapper.callNext(sink, { "rootUrl": _this.rootUrl });
            }
        });
    };
    WebWorkerSetup = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [message_bus_1.MessageBus, anchor_based_app_root_url_1.AnchorBasedAppRootUrl])
    ], WebWorkerSetup);
    return WebWorkerSetup;
})();
exports.WebWorkerSetup = WebWorkerSetup;
//# sourceMappingURL=setup.js.map