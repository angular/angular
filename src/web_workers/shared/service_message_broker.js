'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var serializer_1 = require("angular2/src/web_workers/shared/serializer");
var lang_1 = require("angular2/src/facade/lang");
var message_bus_1 = require("angular2/src/web_workers/shared/message_bus");
var async_1 = require('angular2/src/facade/async');
var ServiceMessageBrokerFactory = (function () {
    function ServiceMessageBrokerFactory() {
    }
    return ServiceMessageBrokerFactory;
})();
exports.ServiceMessageBrokerFactory = ServiceMessageBrokerFactory;
var ServiceMessageBrokerFactory_ = (function (_super) {
    __extends(ServiceMessageBrokerFactory_, _super);
    function ServiceMessageBrokerFactory_(_messageBus, _serializer) {
        _super.call(this);
        this._messageBus = _messageBus;
        this._serializer = _serializer;
    }
    ServiceMessageBrokerFactory_.prototype.createMessageBroker = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        this._messageBus.initChannel(channel, runInZone);
        return new ServiceMessageBroker_(this._messageBus, this._serializer, channel);
    };
    ServiceMessageBrokerFactory_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [message_bus_1.MessageBus, serializer_1.Serializer])
    ], ServiceMessageBrokerFactory_);
    return ServiceMessageBrokerFactory_;
})(ServiceMessageBrokerFactory);
exports.ServiceMessageBrokerFactory_ = ServiceMessageBrokerFactory_;
var ServiceMessageBroker = (function () {
    function ServiceMessageBroker() {
    }
    return ServiceMessageBroker;
})();
exports.ServiceMessageBroker = ServiceMessageBroker;
/**
 * Helper class for UIComponents that allows components to register methods.
 * If a registered method message is received from the broker on the worker,
 * the UIMessageBroker deserializes its arguments and calls the registered method.
 * If that method returns a promise, the UIMessageBroker returns the result to the worker.
 */
var ServiceMessageBroker_ = (function (_super) {
    __extends(ServiceMessageBroker_, _super);
    function ServiceMessageBroker_(messageBus, _serializer, channel) {
        var _this = this;
        _super.call(this);
        this._serializer = _serializer;
        this.channel = channel;
        this._methods = new collection_1.Map();
        this._sink = messageBus.to(channel);
        var source = messageBus.from(channel);
        async_1.ObservableWrapper.subscribe(source, function (message) { return _this._handleMessage(message); });
    }
    ServiceMessageBroker_.prototype.registerMethod = function (methodName, signature, method, returnType) {
        var _this = this;
        this._methods.set(methodName, function (message) {
            var serializedArgs = message.args;
            var deserializedArgs = collection_1.ListWrapper.createFixedSize(signature.length);
            for (var i = 0; i < signature.length; i++) {
                var serializedArg = serializedArgs[i];
                deserializedArgs[i] = _this._serializer.deserialize(serializedArg, signature[i]);
            }
            var promise = lang_1.FunctionWrapper.apply(method, deserializedArgs);
            if (lang_1.isPresent(returnType) && lang_1.isPresent(promise)) {
                _this._wrapWebWorkerPromise(message.id, promise, returnType);
            }
        });
    };
    ServiceMessageBroker_.prototype._handleMessage = function (map) {
        var message = new ReceivedMessage(map);
        if (this._methods.has(message.method)) {
            this._methods.get(message.method)(message);
        }
    };
    ServiceMessageBroker_.prototype._wrapWebWorkerPromise = function (id, promise, type) {
        var _this = this;
        async_1.PromiseWrapper.then(promise, function (result) {
            async_1.ObservableWrapper.callNext(_this._sink, { 'type': 'result', 'value': _this._serializer.serialize(result, type), 'id': id });
        });
    };
    return ServiceMessageBroker_;
})(ServiceMessageBroker);
exports.ServiceMessageBroker_ = ServiceMessageBroker_;
var ReceivedMessage = (function () {
    function ReceivedMessage(data) {
        this.method = data['method'];
        this.args = data['args'];
        this.id = data['id'];
        this.type = data['type'];
    }
    return ReceivedMessage;
})();
exports.ReceivedMessage = ReceivedMessage;
//# sourceMappingURL=service_message_broker.js.map