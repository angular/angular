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
            async_1.ObservableWrapper.callEmit(_this._sink, { 'type': 'result', 'value': _this._serializer.serialize(result, type), 'id': id });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZV9tZXNzYWdlX2Jyb2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlci50cyJdLCJuYW1lcyI6WyJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnkiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnkuY29uc3RydWN0b3IiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jb25zdHJ1Y3RvciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeV8uY3JlYXRlTWVzc2FnZUJyb2tlciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyIiwiU2VydmljZU1lc3NhZ2VCcm9rZXIuY29uc3RydWN0b3IiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8iLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8uY29uc3RydWN0b3IiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8ucmVnaXN0ZXJNZXRob2QiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8uX2hhbmRsZU1lc3NhZ2UiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8uX3dyYXBXZWJXb3JrZXJQcm9taXNlIiwiUmVjZWl2ZWRNZXNzYWdlIiwiUmVjZWl2ZWRNZXNzYWdlLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUsMkJBQXlCLDRDQUE0QyxDQUFDLENBQUE7QUFDdEUscUJBQStDLDBCQUEwQixDQUFDLENBQUE7QUFDMUUsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUsc0JBQXVFLDJCQUEyQixDQUFDLENBQUE7QUFFbkc7SUFBQUE7SUFLQUMsQ0FBQ0E7SUFBREQsa0NBQUNBO0FBQURBLENBQUNBLEFBTEQsSUFLQztB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LENBQUNBO1FBQ3ZGQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNISiw0QkFBQ0E7QUFBREEsQ0FBQ0EsQUF6Q0QsRUFBMkMsb0JBQW9CLEVBeUM5RDtBQXpDWSw2QkFBcUIsd0JBeUNqQyxDQUFBO0FBRUQ7SUFNRUsseUJBQVlBLElBQTBCQTtRQUNwQ0MsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDM0JBLENBQUNBO0lBQ0hELHNCQUFDQTtBQUFEQSxDQUFDQSxBQVpELElBWUM7QUFaWSx1QkFBZSxrQkFZM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtTZXJpYWxpemVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyXCI7XG5pbXBvcnQge2lzUHJlc2VudCwgVHlwZSwgRnVuY3Rpb25XcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzXCI7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgUHJvbWlzZSwgUHJvbWlzZVdyYXBwZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeSB7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgZ2l2ZW4gY2hhbm5lbCBhbmQgYXR0YWNoZXMgYSBuZXcge0BsaW5rIFNlcnZpY2VNZXNzYWdlQnJva2VyfSB0byBpdC5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU/OiBib29sZWFuKTogU2VydmljZU1lc3NhZ2VCcm9rZXI7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfIGV4dGVuZHMgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbWVzc2FnZUJ1czogTWVzc2FnZUJ1cywgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NlcmlhbGl6ZXIgPSBfc2VyaWFsaXplcjtcbiAgfVxuXG4gIGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU6IGJvb2xlYW4gPSB0cnVlKTogU2VydmljZU1lc3NhZ2VCcm9rZXIge1xuICAgIHRoaXMuX21lc3NhZ2VCdXMuaW5pdENoYW5uZWwoY2hhbm5lbCwgcnVuSW5ab25lKTtcbiAgICByZXR1cm4gbmV3IFNlcnZpY2VNZXNzYWdlQnJva2VyXyh0aGlzLl9tZXNzYWdlQnVzLCB0aGlzLl9zZXJpYWxpemVyLCBjaGFubmVsKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VydmljZU1lc3NhZ2VCcm9rZXIge1xuICBhYnN0cmFjdCByZWdpc3Rlck1ldGhvZChtZXRob2ROYW1lOiBzdHJpbmcsIHNpZ25hdHVyZTogVHlwZVtdLCBtZXRob2Q6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlPzogVHlwZSk6IHZvaWQ7XG59XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBVSUNvbXBvbmVudHMgdGhhdCBhbGxvd3MgY29tcG9uZW50cyB0byByZWdpc3RlciBtZXRob2RzLlxuICogSWYgYSByZWdpc3RlcmVkIG1ldGhvZCBtZXNzYWdlIGlzIHJlY2VpdmVkIGZyb20gdGhlIGJyb2tlciBvbiB0aGUgd29ya2VyLFxuICogdGhlIFVJTWVzc2FnZUJyb2tlciBkZXNlcmlhbGl6ZXMgaXRzIGFyZ3VtZW50cyBhbmQgY2FsbHMgdGhlIHJlZ2lzdGVyZWQgbWV0aG9kLlxuICogSWYgdGhhdCBtZXRob2QgcmV0dXJucyBhIHByb21pc2UsIHRoZSBVSU1lc3NhZ2VCcm9rZXIgcmV0dXJucyB0aGUgcmVzdWx0IHRvIHRoZSB3b3JrZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlcl8gZXh0ZW5kcyBTZXJ2aWNlTWVzc2FnZUJyb2tlciB7XG4gIHByaXZhdGUgX3Npbms6IEV2ZW50RW1pdHRlcjxhbnk+O1xuICBwcml2YXRlIF9tZXRob2RzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4gPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZUJ1czogTWVzc2FnZUJ1cywgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplciwgcHVibGljIGNoYW5uZWwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NpbmsgPSBtZXNzYWdlQnVzLnRvKGNoYW5uZWwpO1xuICAgIHZhciBzb3VyY2UgPSBtZXNzYWdlQnVzLmZyb20oY2hhbm5lbCk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHNvdXJjZSwgKG1lc3NhZ2UpID0+IHRoaXMuX2hhbmRsZU1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgcmVnaXN0ZXJNZXRob2QobWV0aG9kTmFtZTogc3RyaW5nLCBzaWduYXR1cmU6IFR5cGVbXSwgbWV0aG9kOiBGdW5jdGlvbiwgcmV0dXJuVHlwZT86IFR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLl9tZXRob2RzLnNldChtZXRob2ROYW1lLCAobWVzc2FnZTogUmVjZWl2ZWRNZXNzYWdlKSA9PiB7XG4gICAgICB2YXIgc2VyaWFsaXplZEFyZ3MgPSBtZXNzYWdlLmFyZ3M7XG4gICAgICB2YXIgZGVzZXJpYWxpemVkQXJnczogYW55W10gPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUoc2lnbmF0dXJlLmxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hdHVyZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc2VyaWFsaXplZEFyZyA9IHNlcmlhbGl6ZWRBcmdzW2ldO1xuICAgICAgICBkZXNlcmlhbGl6ZWRBcmdzW2ldID0gdGhpcy5fc2VyaWFsaXplci5kZXNlcmlhbGl6ZShzZXJpYWxpemVkQXJnLCBzaWduYXR1cmVbaV0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IEZ1bmN0aW9uV3JhcHBlci5hcHBseShtZXRob2QsIGRlc2VyaWFsaXplZEFyZ3MpO1xuICAgICAgaWYgKGlzUHJlc2VudChyZXR1cm5UeXBlKSAmJiBpc1ByZXNlbnQocHJvbWlzZSkpIHtcbiAgICAgICAgdGhpcy5fd3JhcFdlYldvcmtlclByb21pc2UobWVzc2FnZS5pZCwgcHJvbWlzZSwgcmV0dXJuVHlwZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVNZXNzYWdlKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0pOiB2b2lkIHtcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBSZWNlaXZlZE1lc3NhZ2UobWFwKTtcbiAgICBpZiAodGhpcy5fbWV0aG9kcy5oYXMobWVzc2FnZS5tZXRob2QpKSB7XG4gICAgICB0aGlzLl9tZXRob2RzLmdldChtZXNzYWdlLm1ldGhvZCkobWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfd3JhcFdlYldvcmtlclByb21pc2UoaWQ6IHN0cmluZywgcHJvbWlzZTogUHJvbWlzZTxhbnk+LCB0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIudGhlbihwcm9taXNlLCAocmVzdWx0OiBhbnkpID0+IHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KFxuICAgICAgICAgIHRoaXMuX3NpbmssXG4gICAgICAgICAgeyd0eXBlJzogJ3Jlc3VsdCcsICd2YWx1ZSc6IHRoaXMuX3NlcmlhbGl6ZXIuc2VyaWFsaXplKHJlc3VsdCwgdHlwZSksICdpZCc6IGlkfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlY2VpdmVkTWVzc2FnZSB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICBhcmdzOiBhbnlbXTtcbiAgaWQ6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5tZXRob2QgPSBkYXRhWydtZXRob2QnXTtcbiAgICB0aGlzLmFyZ3MgPSBkYXRhWydhcmdzJ107XG4gICAgdGhpcy5pZCA9IGRhdGFbJ2lkJ107XG4gICAgdGhpcy50eXBlID0gZGF0YVsndHlwZSddO1xuICB9XG59XG4iXX0=