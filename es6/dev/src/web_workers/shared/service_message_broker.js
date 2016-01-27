var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
            let numArgs = signature === null ? 0 : signature.length;
            var deserializedArgs = ListWrapper.createFixedSize(numArgs);
            for (var i = 0; i < numArgs; i++) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZV9tZXNzYWdlX2Jyb2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlci50cyJdLCJuYW1lcyI6WyJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnkiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jb25zdHJ1Y3RvciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeV8uY3JlYXRlTWVzc2FnZUJyb2tlciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLmNvbnN0cnVjdG9yIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLnJlZ2lzdGVyTWV0aG9kIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLl9oYW5kbGVNZXNzYWdlIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLl93cmFwV2ViV29ya2VyUHJvbWlzZSIsIlJlY2VpdmVkTWVzc2FnZSIsIlJlY2VpdmVkTWVzc2FnZS5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxXQUFXLEVBQUUsR0FBRyxFQUFhLE1BQU0sZ0NBQWdDO09BQ3BFLEVBQUMsVUFBVSxFQUFDLE1BQU0sNENBQTRDO09BQzlELEVBQUMsU0FBUyxFQUFRLGVBQWUsRUFBQyxNQUFNLDBCQUEwQjtPQUNsRSxFQUFDLFVBQVUsRUFBQyxNQUFNLDZDQUE2QztPQUMvRCxFQUF3QixjQUFjLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFFbEc7QUFLQUEsQ0FBQ0E7QUFFRCx3REFDa0QsMkJBQTJCO0lBSTNFQyxZQUFvQkEsV0FBdUJBLEVBQUVBLFdBQXVCQTtRQUNsRUMsT0FBT0EsQ0FBQ0E7UUFE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LElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQzNCQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXAsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCB7aXNQcmVzZW50LCBUeXBlLCBGdW5jdGlvbldyYXBwZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSBcImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXNcIjtcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBQcm9taXNlLCBQcm9taXNlV3JhcHBlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5IHtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBnaXZlbiBjaGFubmVsIGFuZCBhdHRhY2hlcyBhIG5ldyB7QGxpbmsgU2VydmljZU1lc3NhZ2VCcm9rZXJ9IHRvIGl0LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlTWVzc2FnZUJyb2tlcihjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZT86IGJvb2xlYW4pOiBTZXJ2aWNlTWVzc2FnZUJyb2tlcjtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeV8gZXh0ZW5kcyBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3Rvcnkge1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfc2VyaWFsaXplcjogU2VyaWFsaXplcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tZXNzYWdlQnVzOiBNZXNzYWdlQnVzLCBfc2VyaWFsaXplcjogU2VyaWFsaXplcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2VyaWFsaXplciA9IF9zZXJpYWxpemVyO1xuICB9XG5cbiAgY3JlYXRlTWVzc2FnZUJyb2tlcihjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZTogYm9vbGVhbiA9IHRydWUpOiBTZXJ2aWNlTWVzc2FnZUJyb2tlciB7XG4gICAgdGhpcy5fbWVzc2FnZUJ1cy5pbml0Q2hhbm5lbChjaGFubmVsLCBydW5JblpvbmUpO1xuICAgIHJldHVybiBuZXcgU2VydmljZU1lc3NhZ2VCcm9rZXJfKHRoaXMuX21lc3NhZ2VCdXMsIHRoaXMuX3NlcmlhbGl6ZXIsIGNoYW5uZWwpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlciB7XG4gIGFic3RyYWN0IHJlZ2lzdGVyTWV0aG9kKG1ldGhvZE5hbWU6IHN0cmluZywgc2lnbmF0dXJlOiBUeXBlW10sIG1ldGhvZDogRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblR5cGU/OiBUeXBlKTogdm9pZDtcbn1cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIFVJQ29tcG9uZW50cyB0aGF0IGFsbG93cyBjb21wb25lbnRzIHRvIHJlZ2lzdGVyIG1ldGhvZHMuXG4gKiBJZiBhIHJlZ2lzdGVyZWQgbWV0aG9kIG1lc3NhZ2UgaXMgcmVjZWl2ZWQgZnJvbSB0aGUgYnJva2VyIG9uIHRoZSB3b3JrZXIsXG4gKiB0aGUgVUlNZXNzYWdlQnJva2VyIGRlc2VyaWFsaXplcyBpdHMgYXJndW1lbnRzIGFuZCBjYWxscyB0aGUgcmVnaXN0ZXJlZCBtZXRob2QuXG4gKiBJZiB0aGF0IG1ldGhvZCByZXR1cm5zIGEgcHJvbWlzZSwgdGhlIFVJTWVzc2FnZUJyb2tlciByZXR1cm5zIHRoZSByZXN1bHQgdG8gdGhlIHdvcmtlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlcnZpY2VNZXNzYWdlQnJva2VyXyBleHRlbmRzIFNlcnZpY2VNZXNzYWdlQnJva2VyIHtcbiAgcHJpdmF0ZSBfc2luazogRXZlbnRFbWl0dGVyPGFueT47XG4gIHByaXZhdGUgX21ldGhvZHM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiA9IG5ldyBNYXA8c3RyaW5nLCBGdW5jdGlvbj4oKTtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlQnVzOiBNZXNzYWdlQnVzLCBwcml2YXRlIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyLCBwdWJsaWMgY2hhbm5lbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2luayA9IG1lc3NhZ2VCdXMudG8oY2hhbm5lbCk7XG4gICAgdmFyIHNvdXJjZSA9IG1lc3NhZ2VCdXMuZnJvbShjaGFubmVsKTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoc291cmNlLCAobWVzc2FnZSkgPT4gdGhpcy5faGFuZGxlTWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cblxuICByZWdpc3Rlck1ldGhvZChtZXRob2ROYW1lOiBzdHJpbmcsIHNpZ25hdHVyZTogVHlwZVtdLCBtZXRob2Q6ICguLi5fOiBhbnlbXSkgPT4gUHJvbWlzZTxhbnk+fCB2b2lkLFxuICAgICAgICAgICAgICAgICByZXR1cm5UeXBlPzogVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuX21ldGhvZHMuc2V0KG1ldGhvZE5hbWUsIChtZXNzYWdlOiBSZWNlaXZlZE1lc3NhZ2UpID0+IHtcbiAgICAgIHZhciBzZXJpYWxpemVkQXJncyA9IG1lc3NhZ2UuYXJncztcbiAgICAgIGxldCBudW1BcmdzID0gc2lnbmF0dXJlID09PSBudWxsID8gMCA6IHNpZ25hdHVyZS5sZW5ndGg7XG4gICAgICB2YXIgZGVzZXJpYWxpemVkQXJnczogYW55W10gPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobnVtQXJncyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUFyZ3M7IGkrKykge1xuICAgICAgICB2YXIgc2VyaWFsaXplZEFyZyA9IHNlcmlhbGl6ZWRBcmdzW2ldO1xuICAgICAgICBkZXNlcmlhbGl6ZWRBcmdzW2ldID0gdGhpcy5fc2VyaWFsaXplci5kZXNlcmlhbGl6ZShzZXJpYWxpemVkQXJnLCBzaWduYXR1cmVbaV0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IEZ1bmN0aW9uV3JhcHBlci5hcHBseShtZXRob2QsIGRlc2VyaWFsaXplZEFyZ3MpO1xuICAgICAgaWYgKGlzUHJlc2VudChyZXR1cm5UeXBlKSAmJiBpc1ByZXNlbnQocHJvbWlzZSkpIHtcbiAgICAgICAgdGhpcy5fd3JhcFdlYldvcmtlclByb21pc2UobWVzc2FnZS5pZCwgcHJvbWlzZSwgcmV0dXJuVHlwZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVNZXNzYWdlKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0pOiB2b2lkIHtcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBSZWNlaXZlZE1lc3NhZ2UobWFwKTtcbiAgICBpZiAodGhpcy5fbWV0aG9kcy5oYXMobWVzc2FnZS5tZXRob2QpKSB7XG4gICAgICB0aGlzLl9tZXRob2RzLmdldChtZXNzYWdlLm1ldGhvZCkobWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfd3JhcFdlYldvcmtlclByb21pc2UoaWQ6IHN0cmluZywgcHJvbWlzZTogUHJvbWlzZTxhbnk+LCB0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIudGhlbihwcm9taXNlLCAocmVzdWx0OiBhbnkpID0+IHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KFxuICAgICAgICAgIHRoaXMuX3NpbmssXG4gICAgICAgICAgeyd0eXBlJzogJ3Jlc3VsdCcsICd2YWx1ZSc6IHRoaXMuX3NlcmlhbGl6ZXIuc2VyaWFsaXplKHJlc3VsdCwgdHlwZSksICdpZCc6IGlkfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlY2VpdmVkTWVzc2FnZSB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICBhcmdzOiBhbnlbXTtcbiAgaWQ6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5tZXRob2QgPSBkYXRhWydtZXRob2QnXTtcbiAgICB0aGlzLmFyZ3MgPSBkYXRhWydhcmdzJ107XG4gICAgdGhpcy5pZCA9IGRhdGFbJ2lkJ107XG4gICAgdGhpcy50eXBlID0gZGF0YVsndHlwZSddO1xuICB9XG59XG4iXX0=