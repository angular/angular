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
var di_1 = require('angular2/src/core/di');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var xhr_1 = require('angular2/src/compiler/xhr');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
var bind_1 = require('./bind');
var MessageBasedXHRImpl = (function () {
    function MessageBasedXHRImpl(_brokerFactory, _xhr) {
        this._brokerFactory = _brokerFactory;
        this._xhr = _xhr;
    }
    MessageBasedXHRImpl.prototype.start = function () {
        var broker = this._brokerFactory.createMessageBroker(messaging_api_1.XHR_CHANNEL);
        broker.registerMethod("get", [serializer_1.PRIMITIVE], bind_1.bind(this._xhr.get, this._xhr), serializer_1.PRIMITIVE);
    };
    MessageBasedXHRImpl = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [service_message_broker_1.ServiceMessageBrokerFactory, xhr_1.XHR])
    ], MessageBasedXHRImpl);
    return MessageBasedXHRImpl;
})();
exports.MessageBasedXHRImpl = MessageBasedXHRImpl;
//# sourceMappingURL=xhr_impl.js.map