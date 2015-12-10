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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvc2V0dXAudHMiXSwibmFtZXMiOlsiV2ViV29ya2VyU2V0dXAiLCJXZWJXb3JrZXJTZXR1cC5jb25zdHJ1Y3RvciIsIldlYldvcmtlclNldHVwLnN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sK0NBQStDO09BQ3BFLEVBQWUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FDbEUsRUFBQyxVQUFVLEVBQUMsTUFBTSw2Q0FBNkM7T0FDL0QsRUFBQyxxQkFBcUIsRUFBQyxNQUFNLGlEQUFpRDtPQUM5RSxFQUFDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUMvQyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtBQUUvQztJQUlFQSxZQUFvQkEsSUFBZ0JBLEVBQUVBLHFCQUE0Q0E7UUFBOURDLFNBQUlBLEdBQUpBLElBQUlBLENBQVlBO1FBQ2xDQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxxQkFBcUJBLENBQUNBLEtBQUtBLENBQUNBO0lBQzdDQSxDQUFDQTtJQUVERCxLQUFLQTtRQUNIRSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxhQUFhQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUM1Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBRTNDQSxpQkFBaUJBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLE9BQWVBO1lBQ2xEQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDM0NBLGlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOURBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0FBQ0hGLENBQUNBO0FBbkJEO0lBQUMsVUFBVSxFQUFFOzttQkFtQlo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U0VUVVBfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtBbmNob3JCYXNlZEFwcFJvb3RVcmx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9hbmNob3JfYmFzZWRfYXBwX3Jvb3RfdXJsJztcbmltcG9ydCB7U3RyaW5nV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyU2V0dXAge1xuICByb290VXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfYnVzOiBNZXNzYWdlQnVzLCBhbmNob3JCYXNlZEFwcFJvb3RVcmw6IEFuY2hvckJhc2VkQXBwUm9vdFVybCkge1xuICAgIHRoaXMucm9vdFVybCA9IGFuY2hvckJhc2VkQXBwUm9vdFVybC52YWx1ZTtcbiAgfVxuXG4gIHN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMuX2J1cy5pbml0Q2hhbm5lbChTRVRVUF9DSEFOTkVMLCBmYWxzZSk7XG4gICAgdmFyIHNpbmsgPSB0aGlzLl9idXMudG8oU0VUVVBfQ0hBTk5FTCk7XG4gICAgdmFyIHNvdXJjZSA9IHRoaXMuX2J1cy5mcm9tKFNFVFVQX0NIQU5ORUwpO1xuXG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHNvdXJjZSwgKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKG1lc3NhZ2UsIFwicmVhZHlcIikpIHtcbiAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQoc2luaywge1wicm9vdFVybFwiOiB0aGlzLnJvb3RVcmx9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19