'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZV9tZXNzYWdlX2Jyb2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlci50cyJdLCJuYW1lcyI6WyJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnkiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnkuY29uc3RydWN0b3IiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jb25zdHJ1Y3RvciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeV8uY3JlYXRlTWVzc2FnZUJyb2tlciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyIiwiU2VydmljZU1lc3NhZ2VCcm9rZXIuY29uc3RydWN0b3IiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8iLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8uY29uc3RydWN0b3IiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8ucmVnaXN0ZXJNZXRob2QiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8uX2hhbmRsZU1lc3NhZ2UiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlcl8uX3dyYXBXZWJXb3JrZXJQcm9taXNlIiwiUmVjZWl2ZWRNZXNzYWdlIiwiUmVjZWl2ZWRNZXNzYWdlLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELDJCQUEyQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzVFLDJCQUF5Qiw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ3RFLHFCQUErQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzFFLDRCQUF5Qiw2Q0FBNkMsQ0FBQyxDQUFBO0FBQ3ZFLHNCQUF1RSwyQkFBMkIsQ0FBQyxDQUFBO0FBRW5HO0lBQUFBO0lBS0FDLENBQUNBO0lBQURELGtDQUFDQTtBQUFEQSxDQUFDQSxBQUxELElBS0M7QUFM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QUFDQTtRQUN2RkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFDSEosNEJBQUNBO0FBQURBLENBQUNBLEFBekNELEVBQTJDLG9CQUFvQixFQXlDOUQ7QUF6Q1ksNkJBQXFCLHdCQXlDakMsQ0FBQTtBQUVEO0lBTUVLLHlCQUFZQSxJQUEwQkE7UUFDcENDLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQzdCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQzNCQSxDQUFDQTtJQUNIRCxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFaRCxJQVlDO0FBWlksdUJBQWUsa0JBWTNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcCwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7U2VyaWFsaXplcn0gZnJvbSBcImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplclwiO1xuaW1wb3J0IHtpc1ByZXNlbnQsIFR5cGUsIEZ1bmN0aW9uV3JhcHBlcn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1c1wiO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIFByb21pc2UsIFByb21pc2VXcmFwcGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3Rvcnkge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGdpdmVuIGNoYW5uZWwgYW5kIGF0dGFjaGVzIGEgbmV3IHtAbGluayBTZXJ2aWNlTWVzc2FnZUJyb2tlcn0gdG8gaXQuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVNZXNzYWdlQnJva2VyKGNoYW5uZWw6IHN0cmluZywgcnVuSW5ab25lPzogYm9vbGVhbik6IFNlcnZpY2VNZXNzYWdlQnJva2VyO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5XyBleHRlbmRzIFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX21lc3NhZ2VCdXM6IE1lc3NhZ2VCdXMsIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zZXJpYWxpemVyID0gX3NlcmlhbGl6ZXI7XG4gIH1cblxuICBjcmVhdGVNZXNzYWdlQnJva2VyKGNoYW5uZWw6IHN0cmluZywgcnVuSW5ab25lOiBib29sZWFuID0gdHJ1ZSk6IFNlcnZpY2VNZXNzYWdlQnJva2VyIHtcbiAgICB0aGlzLl9tZXNzYWdlQnVzLmluaXRDaGFubmVsKGNoYW5uZWwsIHJ1bkluWm9uZSk7XG4gICAgcmV0dXJuIG5ldyBTZXJ2aWNlTWVzc2FnZUJyb2tlcl8odGhpcy5fbWVzc2FnZUJ1cywgdGhpcy5fc2VyaWFsaXplciwgY2hhbm5lbCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNlcnZpY2VNZXNzYWdlQnJva2VyIHtcbiAgYWJzdHJhY3QgcmVnaXN0ZXJNZXRob2QobWV0aG9kTmFtZTogc3RyaW5nLCBzaWduYXR1cmU6IFR5cGVbXSwgbWV0aG9kOiBGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuVHlwZT86IFR5cGUpOiB2b2lkO1xufVxuXG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3IgVUlDb21wb25lbnRzIHRoYXQgYWxsb3dzIGNvbXBvbmVudHMgdG8gcmVnaXN0ZXIgbWV0aG9kcy5cbiAqIElmIGEgcmVnaXN0ZXJlZCBtZXRob2QgbWVzc2FnZSBpcyByZWNlaXZlZCBmcm9tIHRoZSBicm9rZXIgb24gdGhlIHdvcmtlcixcbiAqIHRoZSBVSU1lc3NhZ2VCcm9rZXIgZGVzZXJpYWxpemVzIGl0cyBhcmd1bWVudHMgYW5kIGNhbGxzIHRoZSByZWdpc3RlcmVkIG1ldGhvZC5cbiAqIElmIHRoYXQgbWV0aG9kIHJldHVybnMgYSBwcm9taXNlLCB0aGUgVUlNZXNzYWdlQnJva2VyIHJldHVybnMgdGhlIHJlc3VsdCB0byB0aGUgd29ya2VyLlxuICovXG5leHBvcnQgY2xhc3MgU2VydmljZU1lc3NhZ2VCcm9rZXJfIGV4dGVuZHMgU2VydmljZU1lc3NhZ2VCcm9rZXIge1xuICBwcml2YXRlIF9zaW5rOiBFdmVudEVtaXR0ZXI8YW55PjtcbiAgcHJpdmF0ZSBfbWV0aG9kczogTWFwPHN0cmluZywgRnVuY3Rpb24+ID0gbmV3IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPigpO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2VCdXM6IE1lc3NhZ2VCdXMsIHByaXZhdGUgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIsIHB1YmxpYyBjaGFubmVsKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zaW5rID0gbWVzc2FnZUJ1cy50byhjaGFubmVsKTtcbiAgICB2YXIgc291cmNlID0gbWVzc2FnZUJ1cy5mcm9tKGNoYW5uZWwpO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShzb3VyY2UsIChtZXNzYWdlKSA9PiB0aGlzLl9oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHJlZ2lzdGVyTWV0aG9kKG1ldGhvZE5hbWU6IHN0cmluZywgc2lnbmF0dXJlOiBUeXBlW10sIG1ldGhvZDogRnVuY3Rpb24sIHJldHVyblR5cGU/OiBUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5fbWV0aG9kcy5zZXQobWV0aG9kTmFtZSwgKG1lc3NhZ2U6IFJlY2VpdmVkTWVzc2FnZSkgPT4ge1xuICAgICAgdmFyIHNlcmlhbGl6ZWRBcmdzID0gbWVzc2FnZS5hcmdzO1xuICAgICAgdmFyIGRlc2VyaWFsaXplZEFyZ3M6IGFueVtdID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKHNpZ25hdHVyZS5sZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWduYXR1cmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNlcmlhbGl6ZWRBcmcgPSBzZXJpYWxpemVkQXJnc1tpXTtcbiAgICAgICAgZGVzZXJpYWxpemVkQXJnc1tpXSA9IHRoaXMuX3NlcmlhbGl6ZXIuZGVzZXJpYWxpemUoc2VyaWFsaXplZEFyZywgc2lnbmF0dXJlW2ldKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2UgPSBGdW5jdGlvbldyYXBwZXIuYXBwbHkobWV0aG9kLCBkZXNlcmlhbGl6ZWRBcmdzKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocmV0dXJuVHlwZSkgJiYgaXNQcmVzZW50KHByb21pc2UpKSB7XG4gICAgICAgIHRoaXMuX3dyYXBXZWJXb3JrZXJQcm9taXNlKG1lc3NhZ2UuaWQsIHByb21pc2UsIHJldHVyblR5cGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFuZGxlTWVzc2FnZShtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgUmVjZWl2ZWRNZXNzYWdlKG1hcCk7XG4gICAgaWYgKHRoaXMuX21ldGhvZHMuaGFzKG1lc3NhZ2UubWV0aG9kKSkge1xuICAgICAgdGhpcy5fbWV0aG9kcy5nZXQobWVzc2FnZS5tZXRob2QpKG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3dyYXBXZWJXb3JrZXJQcm9taXNlKGlkOiBzdHJpbmcsIHByb21pc2U6IFByb21pc2U8YW55PiwgdHlwZTogVHlwZSk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnRoZW4ocHJvbWlzZSwgKHJlc3VsdDogYW55KSA9PiB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdChcbiAgICAgICAgICB0aGlzLl9zaW5rLFxuICAgICAgICAgIHsndHlwZSc6ICdyZXN1bHQnLCAndmFsdWUnOiB0aGlzLl9zZXJpYWxpemVyLnNlcmlhbGl6ZShyZXN1bHQsIHR5cGUpLCAnaWQnOiBpZH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWNlaXZlZE1lc3NhZ2Uge1xuICBtZXRob2Q6IHN0cmluZztcbiAgYXJnczogYW55W107XG4gIGlkOiBzdHJpbmc7XG4gIHR5cGU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMubWV0aG9kID0gZGF0YVsnbWV0aG9kJ107XG4gICAgdGhpcy5hcmdzID0gZGF0YVsnYXJncyddO1xuICAgIHRoaXMuaWQgPSBkYXRhWydpZCddO1xuICAgIHRoaXMudHlwZSA9IGRhdGFbJ3R5cGUnXTtcbiAgfVxufVxuIl19