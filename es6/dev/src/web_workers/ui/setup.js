var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { SETUP_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { AnchorBasedAppRootUrl } from 'angular2/src/compiler/anchor_based_app_root_url';
import { StringWrapper } from 'angular2/src/facade/lang';
import { Injectable } from 'angular2/src/core/di';
export let WebWorkerSetup = class {
    constructor(_bus, anchorBasedAppRootUrl) {
        this._bus = _bus;
        this.rootUrl = anchorBasedAppRootUrl.value;
    }
    start() {
        this._bus.initChannel(SETUP_CHANNEL, false);
        var sink = this._bus.to(SETUP_CHANNEL);
        var source = this._bus.from(SETUP_CHANNEL);
        ObservableWrapper.subscribe(source, (message) => {
            if (StringWrapper.equals(message, "ready")) {
                ObservableWrapper.callEmit(sink, { "rootUrl": this.rootUrl });
            }
        });
    }
};
WebWorkerSetup = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [MessageBus, AnchorBasedAppRootUrl])
], WebWorkerSetup);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvc2V0dXAudHMiXSwibmFtZXMiOlsiV2ViV29ya2VyU2V0dXAiLCJXZWJXb3JrZXJTZXR1cC5jb25zdHJ1Y3RvciIsIldlYldvcmtlclNldHVwLnN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLCtDQUErQztPQUNwRSxFQUFlLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ2xFLEVBQUMsVUFBVSxFQUFDLE1BQU0sNkNBQTZDO09BQy9ELEVBQUMscUJBQXFCLEVBQUMsTUFBTSxpREFBaUQ7T0FDOUUsRUFBQyxhQUFhLEVBQUMsTUFBTSwwQkFBMEI7T0FDL0MsRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFFL0M7SUFJRUEsWUFBb0JBLElBQWdCQSxFQUFFQSxxQkFBNENBO1FBQTlEQyxTQUFJQSxHQUFKQSxJQUFJQSxDQUFZQTtRQUNsQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EscUJBQXFCQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFREQsS0FBS0E7UUFDSEUsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ3ZDQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUUzQ0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxPQUFlQTtZQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxpQkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEVBQUNBLFNBQVNBLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BLEVBQUNBLENBQUNBLENBQUNBO1lBQzlEQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtBQUNIRixDQUFDQTtBQW5CRDtJQUFDLFVBQVUsRUFBRTs7bUJBbUJaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NFVFVQX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmltcG9ydCB7QW5jaG9yQmFzZWRBcHBSb290VXJsfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvYW5jaG9yX2Jhc2VkX2FwcF9yb290X3VybCc7XG5pbXBvcnQge1N0cmluZ1dyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclNldHVwIHtcbiAgcm9vdFVybDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2J1czogTWVzc2FnZUJ1cywgYW5jaG9yQmFzZWRBcHBSb290VXJsOiBBbmNob3JCYXNlZEFwcFJvb3RVcmwpIHtcbiAgICB0aGlzLnJvb3RVcmwgPSBhbmNob3JCYXNlZEFwcFJvb3RVcmwudmFsdWU7XG4gIH1cblxuICBzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLl9idXMuaW5pdENoYW5uZWwoU0VUVVBfQ0hBTk5FTCwgZmFsc2UpO1xuICAgIHZhciBzaW5rID0gdGhpcy5fYnVzLnRvKFNFVFVQX0NIQU5ORUwpO1xuICAgIHZhciBzb3VyY2UgPSB0aGlzLl9idXMuZnJvbShTRVRVUF9DSEFOTkVMKTtcblxuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShzb3VyY2UsIChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhtZXNzYWdlLCBcInJlYWR5XCIpKSB7XG4gICAgICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHNpbmssIHtcInJvb3RVcmxcIjogdGhpcy5yb290VXJsfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==