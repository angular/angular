'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvc2V0dXAudHMiXSwibmFtZXMiOlsiV2ViV29ya2VyU2V0dXAiLCJXZWJXb3JrZXJTZXR1cC5jb25zdHJ1Y3RvciIsIldlYldvcmtlclNldHVwLnN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLDhCQUE0QiwrQ0FBK0MsQ0FBQyxDQUFBO0FBQzVFLHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBQzFFLDRCQUF5Qiw2Q0FBNkMsQ0FBQyxDQUFBO0FBQ3ZFLDBDQUFvQyxpREFBaUQsQ0FBQyxDQUFBO0FBQ3RGLHFCQUE0QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3ZELG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBRWhEO0lBSUVBLHdCQUFvQkEsSUFBZ0JBLEVBQUVBLHFCQUE0Q0E7UUFBOURDLFNBQUlBLEdBQUpBLElBQUlBLENBQVlBO1FBQ2xDQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxxQkFBcUJBLENBQUNBLEtBQUtBLENBQUNBO0lBQzdDQSxDQUFDQTtJQUVERCw4QkFBS0EsR0FBTEE7UUFBQUUsaUJBVUNBO1FBVENBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLDZCQUFhQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUM1Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsNkJBQWFBLENBQUNBLENBQUNBO1FBQ3ZDQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSw2QkFBYUEsQ0FBQ0EsQ0FBQ0E7UUFFM0NBLHlCQUFpQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsVUFBQ0EsT0FBZUE7WUFDbERBLEVBQUVBLENBQUNBLENBQUNBLG9CQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDM0NBLHlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBQ0EsU0FBU0EsRUFBRUEsS0FBSUEsQ0FBQ0EsT0FBT0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOURBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBbEJIRjtRQUFDQSxlQUFVQSxFQUFFQTs7dUJBbUJaQTtJQUFEQSxxQkFBQ0E7QUFBREEsQ0FBQ0EsQUFuQkQsSUFtQkM7QUFsQlksc0JBQWMsaUJBa0IxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTRVRVUF9DSEFOTkVMfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2luZ19hcGknO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge0FuY2hvckJhc2VkQXBwUm9vdFVybH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2FuY2hvcl9iYXNlZF9hcHBfcm9vdF91cmwnO1xuaW1wb3J0IHtTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJTZXR1cCB7XG4gIHJvb3RVcmw6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9idXM6IE1lc3NhZ2VCdXMsIGFuY2hvckJhc2VkQXBwUm9vdFVybDogQW5jaG9yQmFzZWRBcHBSb290VXJsKSB7XG4gICAgdGhpcy5yb290VXJsID0gYW5jaG9yQmFzZWRBcHBSb290VXJsLnZhbHVlO1xuICB9XG5cbiAgc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5fYnVzLmluaXRDaGFubmVsKFNFVFVQX0NIQU5ORUwsIGZhbHNlKTtcbiAgICB2YXIgc2luayA9IHRoaXMuX2J1cy50byhTRVRVUF9DSEFOTkVMKTtcbiAgICB2YXIgc291cmNlID0gdGhpcy5fYnVzLmZyb20oU0VUVVBfQ0hBTk5FTCk7XG5cbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoc291cmNlLCAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMobWVzc2FnZSwgXCJyZWFkeVwiKSkge1xuICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdChzaW5rLCB7XCJyb290VXJsXCI6IHRoaXMucm9vdFVybH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=