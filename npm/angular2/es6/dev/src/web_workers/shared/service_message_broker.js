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
export let ServiceMessageBrokerFactory_ = class ServiceMessageBrokerFactory_ extends ServiceMessageBrokerFactory {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZV9tZXNzYWdlX2Jyb2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLFdBQVcsRUFBRSxHQUFHLEVBQWEsTUFBTSxnQ0FBZ0M7T0FDcEUsRUFBQyxVQUFVLEVBQUMsTUFBTSw0Q0FBNEM7T0FDOUQsRUFBQyxTQUFTLEVBQVEsZUFBZSxFQUFDLE1BQU0sMEJBQTBCO09BQ2xFLEVBQUMsVUFBVSxFQUFDLE1BQU0sNkNBQTZDO09BQy9ELEVBQWUsY0FBYyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO0FBRXpGO0FBS0EsQ0FBQztBQUdELHFGQUFrRCwyQkFBMkI7SUFJM0UsWUFBb0IsV0FBdUIsRUFBRSxXQUF1QjtRQUNsRSxPQUFPLENBQUM7UUFEVSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUV6QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0lBRUQsbUJBQW1CLENBQUMsT0FBZSxFQUFFLFNBQVMsR0FBWSxJQUFJO1FBQzVELElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRCxNQUFNLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEYsQ0FBQztBQUNILENBQUM7QUFkRDtJQUFDLFVBQVUsRUFBRTs7Z0NBQUE7QUFnQmI7QUFHQSxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCwyQ0FBMkMsb0JBQW9CO0lBSTdELFlBQVksVUFB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LENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0IsQ0FBQztBQUNILENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtTZXJpYWxpemVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyXCI7XG5pbXBvcnQge2lzUHJlc2VudCwgVHlwZSwgRnVuY3Rpb25XcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzXCI7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgUHJvbWlzZVdyYXBwZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeSB7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgZ2l2ZW4gY2hhbm5lbCBhbmQgYXR0YWNoZXMgYSBuZXcge0BsaW5rIFNlcnZpY2VNZXNzYWdlQnJva2VyfSB0byBpdC5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU/OiBib29sZWFuKTogU2VydmljZU1lc3NhZ2VCcm9rZXI7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnlfIGV4dGVuZHMgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbWVzc2FnZUJ1czogTWVzc2FnZUJ1cywgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NlcmlhbGl6ZXIgPSBfc2VyaWFsaXplcjtcbiAgfVxuXG4gIGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU6IGJvb2xlYW4gPSB0cnVlKTogU2VydmljZU1lc3NhZ2VCcm9rZXIge1xuICAgIHRoaXMuX21lc3NhZ2VCdXMuaW5pdENoYW5uZWwoY2hhbm5lbCwgcnVuSW5ab25lKTtcbiAgICByZXR1cm4gbmV3IFNlcnZpY2VNZXNzYWdlQnJva2VyXyh0aGlzLl9tZXNzYWdlQnVzLCB0aGlzLl9zZXJpYWxpemVyLCBjaGFubmVsKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VydmljZU1lc3NhZ2VCcm9rZXIge1xuICBhYnN0cmFjdCByZWdpc3Rlck1ldGhvZChtZXRob2ROYW1lOiBzdHJpbmcsIHNpZ25hdHVyZTogVHlwZVtdLCBtZXRob2Q6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlPzogVHlwZSk6IHZvaWQ7XG59XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBVSUNvbXBvbmVudHMgdGhhdCBhbGxvd3MgY29tcG9uZW50cyB0byByZWdpc3RlciBtZXRob2RzLlxuICogSWYgYSByZWdpc3RlcmVkIG1ldGhvZCBtZXNzYWdlIGlzIHJlY2VpdmVkIGZyb20gdGhlIGJyb2tlciBvbiB0aGUgd29ya2VyLFxuICogdGhlIFVJTWVzc2FnZUJyb2tlciBkZXNlcmlhbGl6ZXMgaXRzIGFyZ3VtZW50cyBhbmQgY2FsbHMgdGhlIHJlZ2lzdGVyZWQgbWV0aG9kLlxuICogSWYgdGhhdCBtZXRob2QgcmV0dXJucyBhIHByb21pc2UsIHRoZSBVSU1lc3NhZ2VCcm9rZXIgcmV0dXJucyB0aGUgcmVzdWx0IHRvIHRoZSB3b3JrZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZXJ2aWNlTWVzc2FnZUJyb2tlcl8gZXh0ZW5kcyBTZXJ2aWNlTWVzc2FnZUJyb2tlciB7XG4gIHByaXZhdGUgX3Npbms6IEV2ZW50RW1pdHRlcjxhbnk+O1xuICBwcml2YXRlIF9tZXRob2RzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4gPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZUJ1czogTWVzc2FnZUJ1cywgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplciwgcHVibGljIGNoYW5uZWwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NpbmsgPSBtZXNzYWdlQnVzLnRvKGNoYW5uZWwpO1xuICAgIHZhciBzb3VyY2UgPSBtZXNzYWdlQnVzLmZyb20oY2hhbm5lbCk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHNvdXJjZSwgKG1lc3NhZ2UpID0+IHRoaXMuX2hhbmRsZU1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgcmVnaXN0ZXJNZXRob2QobWV0aG9kTmFtZTogc3RyaW5nLCBzaWduYXR1cmU6IFR5cGVbXSwgbWV0aG9kOiAoLi4uXzogYW55W10pID0+IFByb21pc2U8YW55Pnwgdm9pZCxcbiAgICAgICAgICAgICAgICAgcmV0dXJuVHlwZT86IFR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLl9tZXRob2RzLnNldChtZXRob2ROYW1lLCAobWVzc2FnZTogUmVjZWl2ZWRNZXNzYWdlKSA9PiB7XG4gICAgICB2YXIgc2VyaWFsaXplZEFyZ3MgPSBtZXNzYWdlLmFyZ3M7XG4gICAgICBsZXQgbnVtQXJncyA9IHNpZ25hdHVyZSA9PT0gbnVsbCA/IDAgOiBzaWduYXR1cmUubGVuZ3RoO1xuICAgICAgdmFyIGRlc2VyaWFsaXplZEFyZ3M6IGFueVtdID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKG51bUFyZ3MpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1BcmdzOyBpKyspIHtcbiAgICAgICAgdmFyIHNlcmlhbGl6ZWRBcmcgPSBzZXJpYWxpemVkQXJnc1tpXTtcbiAgICAgICAgZGVzZXJpYWxpemVkQXJnc1tpXSA9IHRoaXMuX3NlcmlhbGl6ZXIuZGVzZXJpYWxpemUoc2VyaWFsaXplZEFyZywgc2lnbmF0dXJlW2ldKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2UgPSBGdW5jdGlvbldyYXBwZXIuYXBwbHkobWV0aG9kLCBkZXNlcmlhbGl6ZWRBcmdzKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocmV0dXJuVHlwZSkgJiYgaXNQcmVzZW50KHByb21pc2UpKSB7XG4gICAgICAgIHRoaXMuX3dyYXBXZWJXb3JrZXJQcm9taXNlKG1lc3NhZ2UuaWQsIHByb21pc2UsIHJldHVyblR5cGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFuZGxlTWVzc2FnZShtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgUmVjZWl2ZWRNZXNzYWdlKG1hcCk7XG4gICAgaWYgKHRoaXMuX21ldGhvZHMuaGFzKG1lc3NhZ2UubWV0aG9kKSkge1xuICAgICAgdGhpcy5fbWV0aG9kcy5nZXQobWVzc2FnZS5tZXRob2QpKG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3dyYXBXZWJXb3JrZXJQcm9taXNlKGlkOiBzdHJpbmcsIHByb21pc2U6IFByb21pc2U8YW55PiwgdHlwZTogVHlwZSk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnRoZW4ocHJvbWlzZSwgKHJlc3VsdDogYW55KSA9PiB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdChcbiAgICAgICAgICB0aGlzLl9zaW5rLFxuICAgICAgICAgIHsndHlwZSc6ICdyZXN1bHQnLCAndmFsdWUnOiB0aGlzLl9zZXJpYWxpemVyLnNlcmlhbGl6ZShyZXN1bHQsIHR5cGUpLCAnaWQnOiBpZH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWNlaXZlZE1lc3NhZ2Uge1xuICBtZXRob2Q6IHN0cmluZztcbiAgYXJnczogYW55W107XG4gIGlkOiBzdHJpbmc7XG4gIHR5cGU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMubWV0aG9kID0gZGF0YVsnbWV0aG9kJ107XG4gICAgdGhpcy5hcmdzID0gZGF0YVsnYXJncyddO1xuICAgIHRoaXMuaWQgPSBkYXRhWydpZCddO1xuICAgIHRoaXMudHlwZSA9IGRhdGFbJ3R5cGUnXTtcbiAgfVxufVxuIl19