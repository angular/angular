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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZV9tZXNzYWdlX2Jyb2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlci50cyJdLCJuYW1lcyI6WyJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnkiLCJTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jb25zdHJ1Y3RvciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeV8uY3JlYXRlTWVzc2FnZUJyb2tlciIsIlNlcnZpY2VNZXNzYWdlQnJva2VyIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLmNvbnN0cnVjdG9yIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLnJlZ2lzdGVyTWV0aG9kIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLl9oYW5kbGVNZXNzYWdlIiwiU2VydmljZU1lc3NhZ2VCcm9rZXJfLl93cmFwV2ViV29ya2VyUHJvbWlzZSIsIlJlY2VpdmVkTWVzc2FnZSIsIlJlY2VpdmVkTWVzc2FnZS5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxXQUFXLEVBQUUsR0FBRyxFQUFhLE1BQU0sZ0NBQWdDO09BQ3BFLEVBQUMsVUFBVSxFQUFDLE1BQU0sNENBQTRDO09BQzlELEVBQUMsU0FBUyxFQUFRLGVBQWUsRUFBQyxNQUFNLDBCQUEwQjtPQUNsRSxFQUFDLFVBQVUsRUFBQyxNQUFNLDZDQUE2QztPQUMvRCxFQUF3QixjQUFjLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFFbEc7QUFLQUEsQ0FBQ0E7QUFFRCx3REFDa0QsMkJBQTJCO0lBSTNFQyxZQUFvQkEsV0FBdUJBLEVBQUVBLFdBQXVCQTtRQUNsRUMsT0FBT0EsQ0FBQ0E7UUFE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InNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtTZXJpYWxpemVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyXCI7XG5pbXBvcnQge2lzUHJlc2VudCwgVHlwZSwgRnVuY3Rpb25XcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzXCI7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgUHJvbWlzZSwgUHJvbWlzZVdyYXBwZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeSB7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgZ2l2ZW4gY2hhbm5lbCBhbmQgYXR0YWNoZXMgYSBuZXcge0BsaW5rIFNlcnZpY2VNZXNzYWdlQnJva2VyfSB0byBpdC5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU/OiBib29sZWFuKTogU2VydmljZU1lc3NhZ2VCcm9rZXI7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfIGV4dGVuZHMgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbWVzc2FnZUJ1czogTWVzc2FnZUJ1cywgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NlcmlhbGl6ZXIgPSBfc2VyaWFsaXplcjtcbiAgfVxuXG4gIGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU6IGJvb2xlYW4gPSB0cnVlKTogU2VydmljZU1lc3NhZ2VCcm9rZXIge1xuICAgIHRoaXMuX21lc3NhZ2VCdXMuaW5pdENoYW5uZWwoY2hhbm5lbCwgcnVuSW5ab25lKTtcbiAgICByZXR1cm4gbmV3IFNlcnZpY2VNZXNzYWdlQnJva2VyXyh0aGlzLl9tZXNzYWdlQnVzLCB0aGlzLl9zZXJpYWxpemVyLCBjaGFubmVsKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VydmljZU1lc3NhZ2VCcm9rZXIge1xuICBhYnN0cmFjdCByZWdpc3Rlck1ldGhvZChtZXRob2ROYW1lOiBzdHJpbmcsIHNpZ25hdHVyZTogVHlwZVtdLCBtZXRob2Q6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlPzogVHlwZSk6IHZvaWQ7XG59XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBVSUNvbXBvbmVudHMgdGhhdCBhbGxvd3MgY29tcG9uZW50cyB0byByZWdpc3RlciBtZXRob2RzLlxuICogSWYgYSByZWdpc3RlcmVkIG1ldGhvZCBtZXNzYWdlIGlzIHJlY2VpdmVkIGZyb20gdGhlIGJyb2tlciBvbiB0aGUgd29ya2VyLFxuICogdGhlIFVJTWVzc2FnZUJyb2tlciBkZXNlcmlhbGl6ZXMgaXRzIGFyZ3VtZW50cyBhbmQgY2FsbHMgdGhlIHJlZ2lzdGVyZWQgbWV0aG9kLlxuICogSWYgdGhhdCBtZXRob2QgcmV0dXJucyBhIHByb21pc2UsIHRoZSBVSU1lc3NhZ2VCcm9rZXIgcmV0dXJucyB0aGUgcmVzdWx0IHRvIHRoZSB3b3JrZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlcl8gZXh0ZW5kcyBTZXJ2aWNlTWVzc2FnZUJyb2tlciB7XG4gIHByaXZhdGUgX3Npbms6IEV2ZW50RW1pdHRlcjxhbnk+O1xuICBwcml2YXRlIF9tZXRob2RzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4gPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZUJ1czogTWVzc2FnZUJ1cywgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplciwgcHVibGljIGNoYW5uZWwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NpbmsgPSBtZXNzYWdlQnVzLnRvKGNoYW5uZWwpO1xuICAgIHZhciBzb3VyY2UgPSBtZXNzYWdlQnVzLmZyb20oY2hhbm5lbCk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHNvdXJjZSwgKG1lc3NhZ2UpID0+IHRoaXMuX2hhbmRsZU1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgcmVnaXN0ZXJNZXRob2QobWV0aG9kTmFtZTogc3RyaW5nLCBzaWduYXR1cmU6IFR5cGVbXSwgbWV0aG9kOiBGdW5jdGlvbiwgcmV0dXJuVHlwZT86IFR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLl9tZXRob2RzLnNldChtZXRob2ROYW1lLCAobWVzc2FnZTogUmVjZWl2ZWRNZXNzYWdlKSA9PiB7XG4gICAgICB2YXIgc2VyaWFsaXplZEFyZ3MgPSBtZXNzYWdlLmFyZ3M7XG4gICAgICB2YXIgZGVzZXJpYWxpemVkQXJnczogYW55W10gPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUoc2lnbmF0dXJlLmxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hdHVyZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc2VyaWFsaXplZEFyZyA9IHNlcmlhbGl6ZWRBcmdzW2ldO1xuICAgICAgICBkZXNlcmlhbGl6ZWRBcmdzW2ldID0gdGhpcy5fc2VyaWFsaXplci5kZXNlcmlhbGl6ZShzZXJpYWxpemVkQXJnLCBzaWduYXR1cmVbaV0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IEZ1bmN0aW9uV3JhcHBlci5hcHBseShtZXRob2QsIGRlc2VyaWFsaXplZEFyZ3MpO1xuICAgICAgaWYgKGlzUHJlc2VudChyZXR1cm5UeXBlKSAmJiBpc1ByZXNlbnQocHJvbWlzZSkpIHtcbiAgICAgICAgdGhpcy5fd3JhcFdlYldvcmtlclByb21pc2UobWVzc2FnZS5pZCwgcHJvbWlzZSwgcmV0dXJuVHlwZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVNZXNzYWdlKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0pOiB2b2lkIHtcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBSZWNlaXZlZE1lc3NhZ2UobWFwKTtcbiAgICBpZiAodGhpcy5fbWV0aG9kcy5oYXMobWVzc2FnZS5tZXRob2QpKSB7XG4gICAgICB0aGlzLl9tZXRob2RzLmdldChtZXNzYWdlLm1ldGhvZCkobWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfd3JhcFdlYldvcmtlclByb21pc2UoaWQ6IHN0cmluZywgcHJvbWlzZTogUHJvbWlzZTxhbnk+LCB0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIudGhlbihwcm9taXNlLCAocmVzdWx0OiBhbnkpID0+IHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KFxuICAgICAgICAgIHRoaXMuX3NpbmssXG4gICAgICAgICAgeyd0eXBlJzogJ3Jlc3VsdCcsICd2YWx1ZSc6IHRoaXMuX3NlcmlhbGl6ZXIuc2VyaWFsaXplKHJlc3VsdCwgdHlwZSksICdpZCc6IGlkfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlY2VpdmVkTWVzc2FnZSB7XG4gIG1ldGhvZDogc3RyaW5nO1xuICBhcmdzOiBhbnlbXTtcbiAgaWQ6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5tZXRob2QgPSBkYXRhWydtZXRob2QnXTtcbiAgICB0aGlzLmFyZ3MgPSBkYXRhWydhcmdzJ107XG4gICAgdGhpcy5pZCA9IGRhdGFbJ2lkJ107XG4gICAgdGhpcy50eXBlID0gZGF0YVsndHlwZSddO1xuICB9XG59XG4iXX0=