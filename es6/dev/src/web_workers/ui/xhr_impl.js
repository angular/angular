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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwudHMiXSwibmFtZXMiOlsiTWVzc2FnZUJhc2VkWEhSSW1wbCIsIk1lc3NhZ2VCYXNlZFhIUkltcGwuY29uc3RydWN0b3IiLCJNZXNzYWdlQmFzZWRYSFJJbXBsLnN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLFNBQVMsRUFBQyxNQUFNLDRDQUE0QztPQUM3RCxFQUFDLFdBQVcsRUFBQyxNQUFNLCtDQUErQztPQUNsRSxFQUFDLEdBQUcsRUFBQyxNQUFNLDJCQUEyQjtPQUN0QyxFQUFDLDJCQUEyQixFQUFDLE1BQU0sd0RBQXdEO09BQzNGLEVBQUMsSUFBSSxFQUFDLE1BQU0sUUFBUTtBQUUzQjtJQUVFQSxZQUFvQkEsY0FBMkNBLEVBQVVBLElBQVNBO1FBQTlEQyxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBNkJBO1FBQVVBLFNBQUlBLEdBQUpBLElBQUlBLENBQUtBO0lBQUdBLENBQUNBO0lBRXRGRCxLQUFLQTtRQUNIRSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxtQkFBbUJBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQ2xFQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUN2RkEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFSRDtJQUFDLFVBQVUsRUFBRTs7d0JBUVo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtQUklNSVRJVkV9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5pbXBvcnQge1hIUl9DSEFOTkVMfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2luZ19hcGknO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuaW1wb3J0IHtTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlcic7XG5pbXBvcnQge2JpbmR9IGZyb20gJy4vYmluZCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNZXNzYWdlQmFzZWRYSFJJbXBsIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfYnJva2VyRmFjdG9yeTogU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5LCBwcml2YXRlIF94aHI6IFhIUikge31cblxuICBzdGFydCgpOiB2b2lkIHtcbiAgICB2YXIgYnJva2VyID0gdGhpcy5fYnJva2VyRmFjdG9yeS5jcmVhdGVNZXNzYWdlQnJva2VyKFhIUl9DSEFOTkVMKTtcbiAgICBicm9rZXIucmVnaXN0ZXJNZXRob2QoXCJnZXRcIiwgW1BSSU1JVElWRV0sIGJpbmQodGhpcy5feGhyLmdldCwgdGhpcy5feGhyKSwgUFJJTUlUSVZFKTtcbiAgfVxufVxuIl19