'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var async_1 = require('angular2/src/facade/async');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var anchor_based_app_root_url_1 = require('angular2/src/compiler/anchor_based_app_root_url');
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var WebWorkerSetup = (function () {
    function WebWorkerSetup(_bus, anchorBasedAppRootUrl) {
        this._bus = _bus;
        this.rootUrl = anchorBasedAppRootUrl.value;
    }
    WebWorkerSetup.prototype.start = function () {
        var _this = this;
        this._bus.initChannel(messaging_api_1.SETUP_CHANNEL, false);
        var sink = this._bus.to(messaging_api_1.SETUP_CHANNEL);
        var source = this._bus.from(messaging_api_1.SETUP_CHANNEL);
        async_1.ObservableWrapper.subscribe(source, function (message) {
            if (lang_1.StringWrapper.equals(message, "ready")) {
                async_1.ObservableWrapper.callEmit(sink, { "rootUrl": _this.rootUrl });
            }
        });
    };
    WebWorkerSetup = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [message_bus_1.MessageBus, anchor_based_app_root_url_1.AnchorBasedAppRootUrl])
    ], WebWorkerSetup);
    return WebWorkerSetup;
})();
exports.WebWorkerSetup = WebWorkerSetup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvc2V0dXAudHMiXSwibmFtZXMiOlsiV2ViV29ya2VyU2V0dXAiLCJXZWJXb3JrZXJTZXR1cC5jb25zdHJ1Y3RvciIsIldlYldvcmtlclNldHVwLnN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSw4QkFBNEIsK0NBQStDLENBQUMsQ0FBQTtBQUM1RSxzQkFBOEMsMkJBQTJCLENBQUMsQ0FBQTtBQUMxRSw0QkFBeUIsNkNBQTZDLENBQUMsQ0FBQTtBQUN2RSwwQ0FBb0MsaURBQWlELENBQUMsQ0FBQTtBQUN0RixxQkFBNEIsMEJBQTBCLENBQUMsQ0FBQTtBQUN2RCxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRDtJQUlFQSx3QkFBb0JBLElBQWdCQSxFQUFFQSxxQkFBNENBO1FBQTlEQyxTQUFJQSxHQUFKQSxJQUFJQSxDQUFZQTtRQUNsQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EscUJBQXFCQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFREQsOEJBQUtBLEdBQUxBO1FBQUFFLGlCQVVDQTtRQVRDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSw2QkFBYUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLDZCQUFhQSxDQUFDQSxDQUFDQTtRQUN2Q0EsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsNkJBQWFBLENBQUNBLENBQUNBO1FBRTNDQSx5QkFBaUJBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLFVBQUNBLE9BQWVBO1lBQ2xEQSxFQUFFQSxDQUFDQSxDQUFDQSxvQkFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSx5QkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEVBQUNBLFNBQVNBLEVBQUVBLEtBQUlBLENBQUNBLE9BQU9BLEVBQUNBLENBQUNBLENBQUNBO1lBQzlEQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQWxCSEY7UUFBQ0EsZUFBVUEsRUFBRUE7O3VCQW1CWkE7SUFBREEscUJBQUNBO0FBQURBLENBQUNBLEFBbkJELElBbUJDO0FBbEJZLHNCQUFjLGlCQWtCMUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U0VUVVBfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtBbmNob3JCYXNlZEFwcFJvb3RVcmx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9hbmNob3JfYmFzZWRfYXBwX3Jvb3RfdXJsJztcbmltcG9ydCB7U3RyaW5nV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyU2V0dXAge1xuICByb290VXJsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfYnVzOiBNZXNzYWdlQnVzLCBhbmNob3JCYXNlZEFwcFJvb3RVcmw6IEFuY2hvckJhc2VkQXBwUm9vdFVybCkge1xuICAgIHRoaXMucm9vdFVybCA9IGFuY2hvckJhc2VkQXBwUm9vdFVybC52YWx1ZTtcbiAgfVxuXG4gIHN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMuX2J1cy5pbml0Q2hhbm5lbChTRVRVUF9DSEFOTkVMLCBmYWxzZSk7XG4gICAgdmFyIHNpbmsgPSB0aGlzLl9idXMudG8oU0VUVVBfQ0hBTk5FTCk7XG4gICAgdmFyIHNvdXJjZSA9IHRoaXMuX2J1cy5mcm9tKFNFVFVQX0NIQU5ORUwpO1xuXG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHNvdXJjZSwgKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKG1lc3NhZ2UsIFwicmVhZHlcIikpIHtcbiAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQoc2luaywge1wicm9vdFVybFwiOiB0aGlzLnJvb3RVcmx9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19