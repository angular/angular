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
import { Injectable } from 'angular2/src/core/di';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
import { Serializer } from "angular2/src/web_workers/shared/serializer";
import { isPresent, FunctionWrapper } from "angular2/src/facade/lang";
import { MessageBus } from "angular2/src/web_workers/shared/message_bus";
import { PromiseWrapper, ObservableWrapper } from 'angular2/src/facade/async';
export class ServiceMessageBrokerFactory {
}
export let ServiceMessageBrokerFactory_ = class extends ServiceMessageBrokerFactory {
    constructor(_messageBus, _serializer) {
        super();
        this._messageBus = _messageBus;
        this._serializer = _serializer;
    }
    createMessageBroker(channel, runInZone = true) {
        this._messageBus.initChannel(channel, runInZone);
        return new ServiceMessageBroker_(this._messageBus, this._serializer, channel);
    }
};
ServiceMessageBrokerFactory_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [MessageBus, Serializer])
], ServiceMessageBrokerFactory_);
export class ServiceMessageBroker {
}
/**
 * Helper class for UIComponents that allows components to register methods.
 * If a registered method message is received from the broker on the worker,
 * the UIMessageBroker deserializes its arguments and calls the registered method.
 * If that method returns a promise, the UIMessageBroker returns the result to the worker.
 */
export class ServiceMessageBroker_ extends ServiceMessageBroker {
    constructor(messageBus, _serializer, channel) {
        super();
        this._serializer = _serializer;
        this.channel = channel;
        this._methods = new Map();
        this._sink = messageBus.to(channel);
        var source = messageBus.from(channel);
        ObservableWrapper.subscribe(source, (message) => this._handleMessage(message));
    }
    registerMethod(methodName, signature, method, returnType) {
        this._methods.set(methodName, (message) => {
            var serializedArgs = message.args;
            var deserializedArgs = ListWrapper.createFixedSize(signature.length);
            for (var i = 0; i < signature.length; i++) {
                var serializedArg = serializedArgs[i];
                deserializedArgs[i] = this._serializer.deserialize(serializedArg, signature[i]);
            }
            var promise = FunctionWrapper.apply(method, deserializedArgs);
            if (isPresent(returnType) && isPresent(promise)) {
                this._wrapWebWorkerPromise(message.id, promise, returnType);
            }
        });
    }
    _handleMessage(map) {
        var message = new ReceivedMessage(map);
        if (this._methods.has(message.method)) {
            this._methods.get(message.method)(message);
        }
    }
    _wrapWebWorkerPromise(id, promise, type) {
        PromiseWrapper.then(promise, (result) => {
            ObservableWrapper.callEmit(this._sink, { 'type': 'result', 'value': this._serializer.serialize(result, type), 'id': id });
        });
    }
}
export class ReceivedMessage {
    constructor(data) {
        this.method = data['method'];
        this.args = data['args'];
        this.id = data['id'];
        this.type = data['type'];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZV9tZXNzYWdlX2Jyb2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlci50cyJdLCJuYW1lcyI6WyJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnkiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jb25zdHJ1Y3RvciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeV8uY3JlYXRlTWVzc2FnZUJyb2tlciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLmNvbnN0cnVjdG9yIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLnJlZ2lzdGVyTWV0aG9kIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLl9oYW5kbGVNZXNzYWdlIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLl93cmFwV2ViV29ya2VyUHJvbWlzZSIsIlJlY2VpdmVkTWVzc2FnZSIsIlJlY2VpdmVkTWVzc2FnZS5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLFdBQVcsRUFBRSxHQUFHLEVBQWEsTUFBTSxnQ0FBZ0M7T0FDcEUsRUFBQyxVQUFVLEVBQUMsTUFBTSw0Q0FBNEM7T0FDOUQsRUFBQyxTQUFTLEVBQVEsZUFBZSxFQUFDLE1BQU0sMEJBQTBCO09BQ2xFLEVBQUMsVUFBVSxFQUFDLE1BQU0sNkNBQTZDO09BQy9ELEVBQXdCLGNBQWMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtBQUVsRztBQUtBQSxDQUFDQTtBQUVELHdEQUNrRCwyQkFBMkI7SUFJM0VDLFlBQW9CQSxXQUF1QkEsRUFBRUEsV0FBdUJBO1FBQ2xFQyxPQUFPQSxDQUFDQTtR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Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXAsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCB7aXNQcmVzZW50LCBUeXBlLCBGdW5jdGlvbldyYXBwZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSBcImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXNcIjtcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBQcm9taXNlLCBQcm9taXNlV3JhcHBlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5IHtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBnaXZlbiBjaGFubmVsIGFuZCBhdHRhY2hlcyBhIG5ldyB7QGxpbmsgU2VydmljZU1lc3NhZ2VCcm9rZXJ9IHRvIGl0LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlTWVzc2FnZUJyb2tlcihjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZT86IGJvb2xlYW4pOiBTZXJ2aWNlTWVzc2FnZUJyb2tlcjtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeV8gZXh0ZW5kcyBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3Rvcnkge1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfc2VyaWFsaXplcjogU2VyaWFsaXplcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tZXNzYWdlQnVzOiBNZXNzYWdlQnVzLCBfc2VyaWFsaXplcjogU2VyaWFsaXplcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2VyaWFsaXplciA9IF9zZXJpYWxpemVyO1xuICB9XG5cbiAgY3JlYXRlTWVzc2FnZUJyb2tlcihjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZTogYm9vbGVhbiA9IHRydWUpOiBTZXJ2aWNlTWVzc2FnZUJyb2tlciB7XG4gICAgdGhpcy5fbWVzc2FnZUJ1cy5pbml0Q2hhbm5lbChjaGFubmVsLCBydW5JblpvbmUpO1xuICAgIHJldHVybiBuZXcgU2VydmljZU1lc3NhZ2VCcm9rZXJfKHRoaXMuX21lc3NhZ2VCdXMsIHRoaXMuX3NlcmlhbGl6ZXIsIGNoYW5uZWwpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlciB7XG4gIGFic3RyYWN0IHJlZ2lzdGVyTWV0aG9kKG1ldGhvZE5hbWU6IHN0cmluZywgc2lnbmF0dXJlOiBUeXBlW10sIG1ldGhvZDogRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblR5cGU/OiBUeXBlKTogdm9pZDtcbn1cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIFVJQ29tcG9uZW50cyB0aGF0IGFsbG93cyBjb21wb25lbnRzIHRvIHJlZ2lzdGVyIG1ldGhvZHMuXG4gKiBJZiBhIHJlZ2lzdGVyZWQgbWV0aG9kIG1lc3NhZ2UgaXMgcmVjZWl2ZWQgZnJvbSB0aGUgYnJva2VyIG9uIHRoZSB3b3JrZXIsXG4gKiB0aGUgVUlNZXNzYWdlQnJva2VyIGRlc2VyaWFsaXplcyBpdHMgYXJndW1lbnRzIGFuZCBjYWxscyB0aGUgcmVnaXN0ZXJlZCBtZXRob2QuXG4gKiBJZiB0aGF0IG1ldGhvZCByZXR1cm5zIGEgcHJvbWlzZSwgdGhlIFVJTWVzc2FnZUJyb2tlciByZXR1cm5zIHRoZSByZXN1bHQgdG8gdGhlIHdvcmtlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlcnZpY2VNZXNzYWdlQnJva2VyXyBleHRlbmRzIFNlcnZpY2VNZXNzYWdlQnJva2VyIHtcbiAgcHJpdmF0ZSBfc2luazogRXZlbnRFbWl0dGVyPGFueT47XG4gIHByaXZhdGUgX21ldGhvZHM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiA9IG5ldyBNYXA8c3RyaW5nLCBGdW5jdGlvbj4oKTtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlQnVzOiBNZXNzYWdlQnVzLCBwcml2YXRlIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyLCBwdWJsaWMgY2hhbm5lbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2luayA9IG1lc3NhZ2VCdXMudG8oY2hhbm5lbCk7XG4gICAgdmFyIHNvdXJjZSA9IG1lc3NhZ2VCdXMuZnJvbShjaGFubmVsKTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoc291cmNlLCAobWVzc2FnZSkgPT4gdGhpcy5faGFuZGxlTWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cblxuICByZWdpc3Rlck1ldGhvZChtZXRob2ROYW1lOiBzdHJpbmcsIHNpZ25hdHVyZTogVHlwZVtdLCBtZXRob2Q6IEZ1bmN0aW9uLCByZXR1cm5UeXBlPzogVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuX21ldGhvZHMuc2V0KG1ldGhvZE5hbWUsIChtZXNzYWdlOiBSZWNlaXZlZE1lc3NhZ2UpID0+IHtcbiAgICAgIHZhciBzZXJpYWxpemVkQXJncyA9IG1lc3NhZ2UuYXJncztcbiAgICAgIHZhciBkZXNlcmlhbGl6ZWRBcmdzOiBhbnlbXSA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShzaWduYXR1cmUubGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnbmF0dXJlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzZXJpYWxpemVkQXJnID0gc2VyaWFsaXplZEFyZ3NbaV07XG4gICAgICAgIGRlc2VyaWFsaXplZEFyZ3NbaV0gPSB0aGlzLl9zZXJpYWxpemVyLmRlc2VyaWFsaXplKHNlcmlhbGl6ZWRBcmcsIHNpZ25hdHVyZVtpXSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9taXNlID0gRnVuY3Rpb25XcmFwcGVyLmFwcGx5KG1ldGhvZCwgZGVzZXJpYWxpemVkQXJncyk7XG4gICAgICBpZiAoaXNQcmVzZW50KHJldHVyblR5cGUpICYmIGlzUHJlc2VudChwcm9taXNlKSkge1xuICAgICAgICB0aGlzLl93cmFwV2ViV29ya2VyUHJvbWlzZShtZXNzYWdlLmlkLCBwcm9taXNlLCByZXR1cm5UeXBlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZU1lc3NhZ2UobWFwOiB7W2tleTogc3RyaW5nXTogYW55fSk6IHZvaWQge1xuICAgIHZhciBtZXNzYWdlID0gbmV3IFJlY2VpdmVkTWVzc2FnZShtYXApO1xuICAgIGlmICh0aGlzLl9tZXRob2RzLmhhcyhtZXNzYWdlLm1ldGhvZCkpIHtcbiAgICAgIHRoaXMuX21ldGhvZHMuZ2V0KG1lc3NhZ2UubWV0aG9kKShtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF93cmFwV2ViV29ya2VyUHJvbWlzZShpZDogc3RyaW5nLCBwcm9taXNlOiBQcm9taXNlPGFueT4sIHR5cGU6IFR5cGUpOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci50aGVuKHByb21pc2UsIChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQoXG4gICAgICAgICAgdGhpcy5fc2luayxcbiAgICAgICAgICB7J3R5cGUnOiAncmVzdWx0JywgJ3ZhbHVlJzogdGhpcy5fc2VyaWFsaXplci5zZXJpYWxpemUocmVzdWx0LCB0eXBlKSwgJ2lkJzogaWR9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVjZWl2ZWRNZXNzYWdlIHtcbiAgbWV0aG9kOiBzdHJpbmc7XG4gIGFyZ3M6IGFueVtdO1xuICBpZDogc3RyaW5nO1xuICB0eXBlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLm1ldGhvZCA9IGRhdGFbJ21ldGhvZCddO1xuICAgIHRoaXMuYXJncyA9IGRhdGFbJ2FyZ3MnXTtcbiAgICB0aGlzLmlkID0gZGF0YVsnaWQnXTtcbiAgICB0aGlzLnR5cGUgPSBkYXRhWyd0eXBlJ107XG4gIH1cbn1cbiJdfQ==