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
import { PRIMITIVE } from 'angular2/src/web_workers/shared/serializer';
import { XHR_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { XHR } from 'angular2/src/compiler/xhr';
import { ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
import { bind } from './bind';
export let MessageBasedXHRImpl = class {
    constructor(_brokerFactory, _xhr) {
        this._brokerFactory = _brokerFactory;
        this._xhr = _xhr;
    }
    start() {
        var broker = this._brokerFactory.createMessageBroker(XHR_CHANNEL);
        broker.registerMethod("get", [PRIMITIVE], bind(this._xhr.get, this._xhr), PRIMITIVE);
    }
};
MessageBasedXHRImpl = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ServiceMessageBrokerFactory, XHR])
], MessageBasedXHRImpl);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwudHMiXSwibmFtZXMiOlsiTWVzc2FnZUJhc2VkWEhSSW1wbCIsIk1lc3NhZ2VCYXNlZFhIUkltcGwuY29uc3RydWN0b3IiLCJNZXNzYWdlQmFzZWRYSFJJbXBsLnN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsU0FBUyxFQUFDLE1BQU0sNENBQTRDO09BQzdELEVBQUMsV0FBVyxFQUFDLE1BQU0sK0NBQStDO09BQ2xFLEVBQUMsR0FBRyxFQUFDLE1BQU0sMkJBQTJCO09BQ3RDLEVBQUMsMkJBQTJCLEVBQUMsTUFBTSx3REFBd0Q7T0FDM0YsRUFBQyxJQUFJLEVBQUMsTUFBTSxRQUFRO0FBRTNCO0lBRUVBLFlBQW9CQSxjQUEyQ0EsRUFBVUEsSUFBU0E7UUFBOURDLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUE2QkE7UUFBVUEsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBS0E7SUFBR0EsQ0FBQ0E7SUFFdEZELEtBQUtBO1FBQ0hFLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLFNBQVNBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO0lBQ3ZGQSxDQUFDQTtBQUNIRixDQUFDQTtBQVJEO0lBQUMsVUFBVSxFQUFFOzt3QkFRWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1BSSU1JVElWRX0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7WEhSX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5pbXBvcnQge1hIUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3hocic7XG5pbXBvcnQge1NlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJ2aWNlX21lc3NhZ2VfYnJva2VyJztcbmltcG9ydCB7YmluZH0gZnJvbSAnLi9iaW5kJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VCYXNlZFhIUkltcGwge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9icm9rZXJGYWN0b3J5OiBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnksIHByaXZhdGUgX3hocjogWEhSKSB7fVxuXG4gIHN0YXJ0KCk6IHZvaWQge1xuICAgIHZhciBicm9rZXIgPSB0aGlzLl9icm9rZXJGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VCcm9rZXIoWEhSX0NIQU5ORUwpO1xuICAgIGJyb2tlci5yZWdpc3Rlck1ldGhvZChcImdldFwiLCBbUFJJTUlUSVZFXSwgYmluZCh0aGlzLl94aHIuZ2V0LCB0aGlzLl94aHIpLCBQUklNSVRJVkUpO1xuICB9XG59XG4iXX0=