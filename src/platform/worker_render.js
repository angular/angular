'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var post_message_bus_1 = require('angular2/src/web_workers/shared/post_message_bus');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var core_1 = require('angular2/core');
var di_1 = require('angular2/src/core/di');
var worker_render_common_1 = require('angular2/src/platform/worker_render_common');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
/**
 * Wrapper class that exposes the Worker
 * and underlying {@link MessageBus} for lower level message passing.
 */
var WebWorkerInstance = (function () {
    function WebWorkerInstance() {
    }
    /** @internal */
    WebWorkerInstance.prototype.init = function (worker, bus) {
        this.worker = worker;
        this.bus = bus;
    };
    WebWorkerInstance = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], WebWorkerInstance);
    return WebWorkerInstance;
})();
exports.WebWorkerInstance = WebWorkerInstance;
/**
 * An array of providers that should be passed into `application()` when initializing a new Worker.
 */
exports.WORKER_RENDER_APP = lang_1.CONST_EXPR([
    worker_render_common_1.WORKER_RENDER_APP_COMMON,
    WebWorkerInstance,
    new di_1.Provider(core_1.APP_INITIALIZER, {
        useFactory: function (injector) { return function () { return initWebWorkerApplication(injector); }; },
        multi: true,
        deps: [di_1.Injector]
    }),
    new di_1.Provider(message_bus_1.MessageBus, { useFactory: function (instance) { return instance.bus; }, deps: [WebWorkerInstance] })
]);
function initWebWorkerApplication(injector) {
    var scriptUri;
    try {
        scriptUri = injector.get(worker_render_common_1.WORKER_SCRIPT);
    }
    catch (e) {
        throw new exceptions_1.BaseException("You must provide your WebWorker's initialization script with the WORKER_SCRIPT token");
    }
    var instance = injector.get(WebWorkerInstance);
    spawnWebWorker(scriptUri, instance);
    worker_render_common_1.initializeGenericWorkerRenderer(injector);
}
/**
 * Spawns a new class and initializes the WebWorkerInstance
 */
function spawnWebWorker(uri, instance) {
    var webWorker = new Worker(uri);
    var sink = new post_message_bus_1.PostMessageBusSink(webWorker);
    var source = new post_message_bus_1.PostMessageBusSource(webWorker);
    var bus = new post_message_bus_1.PostMessageBus(sink, source);
    instance.init(webWorker, bus);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlckluc3RhbmNlIiwiV2ViV29ya2VySW5zdGFuY2UuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJJbnN0YW5jZS5pbml0IiwiaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uIiwic3Bhd25XZWJXb3JrZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLGlDQUlPLGtEQUFrRCxDQUFDLENBQUE7QUFDMUQsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUscUJBQThCLGVBQWUsQ0FBQyxDQUFBO0FBQzlDLG1CQUE2QyxzQkFBc0IsQ0FBQyxDQUFBO0FBSXBFLHFDQUtPLDRDQUE0QyxDQUFDLENBQUE7QUFDcEQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFFcEQ7OztHQUdHO0FBQ0g7SUFBQUE7SUFVQUMsQ0FBQ0E7SUFMQ0QsZ0JBQWdCQTtJQUNUQSxnQ0FBSUEsR0FBWEEsVUFBWUEsTUFBY0EsRUFBRUEsR0FBZUE7UUFDekNFLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUNqQkEsQ0FBQ0E7SUFUSEY7UUFBQ0EsZUFBVUEsRUFBRUE7OzBCQVVaQTtJQUFEQSx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFWRCxJQVVDO0FBVFkseUJBQWlCLG9CQVM3QixDQUFBO0FBRUQ7O0dBRUc7QUFDVSx5QkFBaUIsR0FBMkMsaUJBQVUsQ0FBQztJQUNsRiwrQ0FBd0I7SUFDeEIsaUJBQWlCO0lBQ2pCLElBQUksYUFBUSxDQUFDLHNCQUFlLEVBQ2Y7UUFDRSxVQUFVLEVBQUUsVUFBQyxRQUFRLElBQUssT0FBQSxjQUFNLE9BQUEsd0JBQXdCLENBQUMsUUFBUSxDQUFDLEVBQWxDLENBQWtDLEVBQXhDLENBQXdDO1FBQ2xFLEtBQUssRUFBRSxJQUFJO1FBQ1gsSUFBSSxFQUFFLENBQUMsYUFBUSxDQUFDO0tBQ2pCLENBQUM7SUFDZixJQUFJLGFBQVEsQ0FBQyx3QkFBVSxFQUFFLEVBQUMsVUFBVSxFQUFFLFVBQUMsUUFBUSxJQUFLLE9BQUEsUUFBUSxDQUFDLEdBQUcsRUFBWixDQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBQyxDQUFDO0NBQzlGLENBQUMsQ0FBQztBQUVILGtDQUFrQyxRQUFrQjtJQUNsREcsSUFBSUEsU0FBaUJBLENBQUNBO0lBQ3RCQSxJQUFJQSxDQUFDQTtRQUNIQSxTQUFTQSxHQUFHQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxvQ0FBYUEsQ0FBQ0EsQ0FBQ0E7SUFDMUNBLENBQUVBO0lBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ1hBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsc0ZBQXNGQSxDQUFDQSxDQUFDQTtJQUM5RkEsQ0FBQ0E7SUFFREEsSUFBSUEsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtJQUMvQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFFcENBLHNEQUErQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7QUFDNUNBLENBQUNBO0FBRUQ7O0dBRUc7QUFDSCx3QkFBd0IsR0FBVyxFQUFFLFFBQTJCO0lBQzlEQyxJQUFJQSxTQUFTQSxHQUFXQSxJQUFJQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEscUNBQWtCQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUM3Q0EsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsdUNBQW9CQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNqREEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsaUNBQWNBLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO0lBRTNDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUNoQ0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBQb3N0TWVzc2FnZUJ1cyxcbiAgUG9zdE1lc3NhZ2VCdXNTaW5rLFxuICBQb3N0TWVzc2FnZUJ1c1NvdXJjZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3Bvc3RfbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmltcG9ydCB7QVBQX0lOSVRJQUxJWkVSfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW5qZWN0b3IsIEluamVjdGFibGUsIFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1dlYldvcmtlclNldHVwfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvc2V0dXAnO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3JlbmRlcmVyJztcbmltcG9ydCB7TWVzc2FnZUJhc2VkWEhSSW1wbH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3hocl9pbXBsJztcbmltcG9ydCB7XG4gIFdPUktFUl9SRU5ERVJfQVBQX0NPTU1PTixcbiAgV09SS0VSX1JFTkRFUl9NRVNTQUdJTkdfUFJPVklERVJTLFxuICBXT1JLRVJfU0NSSVBULFxuICBpbml0aWFsaXplR2VuZXJpY1dvcmtlclJlbmRlcmVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyX2NvbW1vbic7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogV3JhcHBlciBjbGFzcyB0aGF0IGV4cG9zZXMgdGhlIFdvcmtlclxuICogYW5kIHVuZGVybHlpbmcge0BsaW5rIE1lc3NhZ2VCdXN9IGZvciBsb3dlciBsZXZlbCBtZXNzYWdlIHBhc3NpbmcuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJJbnN0YW5jZSB7XG4gIHB1YmxpYyB3b3JrZXI6IFdvcmtlcjtcbiAgcHVibGljIGJ1czogTWVzc2FnZUJ1cztcblxuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBpbml0KHdvcmtlcjogV29ya2VyLCBidXM6IE1lc3NhZ2VCdXMpIHtcbiAgICB0aGlzLndvcmtlciA9IHdvcmtlcjtcbiAgICB0aGlzLmJ1cyA9IGJ1cztcbiAgfVxufVxuXG4vKipcbiAqIEFuIGFycmF5IG9mIHByb3ZpZGVycyB0aGF0IHNob3VsZCBiZSBwYXNzZWQgaW50byBgYXBwbGljYXRpb24oKWAgd2hlbiBpbml0aWFsaXppbmcgYSBuZXcgV29ya2VyLlxuICovXG5leHBvcnQgY29uc3QgV09SS0VSX1JFTkRFUl9BUFA6IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+ID0gQ09OU1RfRVhQUihbXG4gIFdPUktFUl9SRU5ERVJfQVBQX0NPTU1PTixcbiAgV2ViV29ya2VySW5zdGFuY2UsXG4gIG5ldyBQcm92aWRlcihBUFBfSU5JVElBTElaRVIsXG4gICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgIHVzZUZhY3Rvcnk6IChpbmplY3RvcikgPT4gKCkgPT4gaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uKGluamVjdG9yKSxcbiAgICAgICAgICAgICAgICAgbXVsdGk6IHRydWUsXG4gICAgICAgICAgICAgICAgIGRlcHM6IFtJbmplY3Rvcl1cbiAgICAgICAgICAgICAgIH0pLFxuICBuZXcgUHJvdmlkZXIoTWVzc2FnZUJ1cywge3VzZUZhY3Rvcnk6IChpbnN0YW5jZSkgPT4gaW5zdGFuY2UuYnVzLCBkZXBzOiBbV2ViV29ya2VySW5zdGFuY2VdfSlcbl0pO1xuXG5mdW5jdGlvbiBpbml0V2ViV29ya2VyQXBwbGljYXRpb24oaW5qZWN0b3I6IEluamVjdG9yKTogdm9pZCB7XG4gIHZhciBzY3JpcHRVcmk6IHN0cmluZztcbiAgdHJ5IHtcbiAgICBzY3JpcHRVcmkgPSBpbmplY3Rvci5nZXQoV09SS0VSX1NDUklQVCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgXCJZb3UgbXVzdCBwcm92aWRlIHlvdXIgV2ViV29ya2VyJ3MgaW5pdGlhbGl6YXRpb24gc2NyaXB0IHdpdGggdGhlIFdPUktFUl9TQ1JJUFQgdG9rZW5cIik7XG4gIH1cblxuICBsZXQgaW5zdGFuY2UgPSBpbmplY3Rvci5nZXQoV2ViV29ya2VySW5zdGFuY2UpO1xuICBzcGF3bldlYldvcmtlcihzY3JpcHRVcmksIGluc3RhbmNlKTtcblxuICBpbml0aWFsaXplR2VuZXJpY1dvcmtlclJlbmRlcmVyKGluamVjdG9yKTtcbn1cblxuLyoqXG4gKiBTcGF3bnMgYSBuZXcgY2xhc3MgYW5kIGluaXRpYWxpemVzIHRoZSBXZWJXb3JrZXJJbnN0YW5jZVxuICovXG5mdW5jdGlvbiBzcGF3bldlYldvcmtlcih1cmk6IHN0cmluZywgaW5zdGFuY2U6IFdlYldvcmtlckluc3RhbmNlKTogdm9pZCB7XG4gIHZhciB3ZWJXb3JrZXI6IFdvcmtlciA9IG5ldyBXb3JrZXIodXJpKTtcbiAgdmFyIHNpbmsgPSBuZXcgUG9zdE1lc3NhZ2VCdXNTaW5rKHdlYldvcmtlcik7XG4gIHZhciBzb3VyY2UgPSBuZXcgUG9zdE1lc3NhZ2VCdXNTb3VyY2Uod2ViV29ya2VyKTtcbiAgdmFyIGJ1cyA9IG5ldyBQb3N0TWVzc2FnZUJ1cyhzaW5rLCBzb3VyY2UpO1xuXG4gIGluc3RhbmNlLmluaXQod2ViV29ya2VyLCBidXMpO1xufVxuIl19