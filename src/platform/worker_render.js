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
exports.WORKER_RENDER_APPLICATION = lang_1.CONST_EXPR([
    worker_render_common_1.WORKER_RENDER_APPLICATION_COMMON,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlckluc3RhbmNlIiwiV2ViV29ya2VySW5zdGFuY2UuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJJbnN0YW5jZS5pbml0IiwiaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uIiwic3Bhd25XZWJXb3JrZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLGlDQUlPLGtEQUFrRCxDQUFDLENBQUE7QUFDMUQsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUscUJBQThCLGVBQWUsQ0FBQyxDQUFBO0FBQzlDLG1CQUE2QyxzQkFBc0IsQ0FBQyxDQUFBO0FBR3BFLHFDQUtPLDRDQUE0QyxDQUFDLENBQUE7QUFDcEQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFFcEQ7OztHQUdHO0FBQ0g7SUFBQUE7SUFVQUMsQ0FBQ0E7SUFMQ0QsZ0JBQWdCQTtJQUNUQSxnQ0FBSUEsR0FBWEEsVUFBWUEsTUFBY0EsRUFBRUEsR0FBZUE7UUFDekNFLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUNqQkEsQ0FBQ0E7SUFUSEY7UUFBQ0EsZUFBVUEsRUFBRUE7OzBCQVVaQTtJQUFEQSx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFWRCxJQVVDO0FBVFkseUJBQWlCLG9CQVM3QixDQUFBO0FBRUQ7O0dBRUc7QUFDVSxpQ0FBeUIsR0FBMkMsaUJBQVUsQ0FBQztJQUMxRix1REFBZ0M7SUFDaEMsaUJBQWlCO0lBQ2pCLElBQUksYUFBUSxDQUFDLHNCQUFlLEVBQ2Y7UUFDRSxVQUFVLEVBQUUsVUFBQyxRQUFRLElBQUssT0FBQSxjQUFNLE9BQUEsd0JBQXdCLENBQUMsUUFBUSxDQUFDLEVBQWxDLENBQWtDLEVBQXhDLENBQXdDO1FBQ2xFLEtBQUssRUFBRSxJQUFJO1FBQ1gsSUFBSSxFQUFFLENBQUMsYUFBUSxDQUFDO0tBQ2pCLENBQUM7SUFDZixJQUFJLGFBQVEsQ0FBQyx3QkFBVSxFQUFFLEVBQUMsVUFBVSxFQUFFLFVBQUMsUUFBUSxJQUFLLE9BQUEsUUFBUSxDQUFDLEdBQUcsRUFBWixDQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBQyxDQUFDO0NBQzlGLENBQUMsQ0FBQztBQUVILGtDQUFrQyxRQUFrQjtJQUNsREcsSUFBSUEsU0FBaUJBLENBQUNBO0lBQ3RCQSxJQUFJQSxDQUFDQTtRQUNIQSxTQUFTQSxHQUFHQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxvQ0FBYUEsQ0FBQ0EsQ0FBQ0E7SUFDMUNBLENBQUVBO0lBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ1hBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsc0ZBQXNGQSxDQUFDQSxDQUFDQTtJQUM5RkEsQ0FBQ0E7SUFFREEsSUFBSUEsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtJQUMvQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFFcENBLHNEQUErQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7QUFDNUNBLENBQUNBO0FBRUQ7O0dBRUc7QUFDSCx3QkFBd0IsR0FBVyxFQUFFLFFBQTJCO0lBQzlEQyxJQUFJQSxTQUFTQSxHQUFXQSxJQUFJQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEscUNBQWtCQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUM3Q0EsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsdUNBQW9CQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNqREEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsaUNBQWNBLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO0lBRTNDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUNoQ0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBQb3N0TWVzc2FnZUJ1cyxcbiAgUG9zdE1lc3NhZ2VCdXNTaW5rLFxuICBQb3N0TWVzc2FnZUJ1c1NvdXJjZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3Bvc3RfbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmltcG9ydCB7QVBQX0lOSVRJQUxJWkVSfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW5qZWN0b3IsIEluamVjdGFibGUsIFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvcmVuZGVyZXInO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRYSFJJbXBsfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwnO1xuaW1wb3J0IHtcbiAgV09SS0VSX1JFTkRFUl9BUFBMSUNBVElPTl9DT01NT04sXG4gIFdPUktFUl9SRU5ERVJfTUVTU0FHSU5HX1BST1ZJREVSUyxcbiAgV09SS0VSX1NDUklQVCxcbiAgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX3JlbmRlcl9jb21tb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFdyYXBwZXIgY2xhc3MgdGhhdCBleHBvc2VzIHRoZSBXb3JrZXJcbiAqIGFuZCB1bmRlcmx5aW5nIHtAbGluayBNZXNzYWdlQnVzfSBmb3IgbG93ZXIgbGV2ZWwgbWVzc2FnZSBwYXNzaW5nLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VySW5zdGFuY2Uge1xuICBwdWJsaWMgd29ya2VyOiBXb3JrZXI7XG4gIHB1YmxpYyBidXM6IE1lc3NhZ2VCdXM7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgaW5pdCh3b3JrZXI6IFdvcmtlciwgYnVzOiBNZXNzYWdlQnVzKSB7XG4gICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgdGhpcy5idXMgPSBidXM7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBhcnJheSBvZiBwcm92aWRlcnMgdGhhdCBzaG91bGQgYmUgcGFzc2VkIGludG8gYGFwcGxpY2F0aW9uKClgIHdoZW4gaW5pdGlhbGl6aW5nIGEgbmV3IFdvcmtlci5cbiAqL1xuZXhwb3J0IGNvbnN0IFdPUktFUl9SRU5ERVJfQVBQTElDQVRJT046IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+ID0gQ09OU1RfRVhQUihbXG4gIFdPUktFUl9SRU5ERVJfQVBQTElDQVRJT05fQ09NTU9OLFxuICBXZWJXb3JrZXJJbnN0YW5jZSxcbiAgbmV3IFByb3ZpZGVyKEFQUF9JTklUSUFMSVpFUixcbiAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogKGluamVjdG9yKSA9PiAoKSA9PiBpbml0V2ViV29ya2VyQXBwbGljYXRpb24oaW5qZWN0b3IpLFxuICAgICAgICAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgZGVwczogW0luamVjdG9yXVxuICAgICAgICAgICAgICAgfSksXG4gIG5ldyBQcm92aWRlcihNZXNzYWdlQnVzLCB7dXNlRmFjdG9yeTogKGluc3RhbmNlKSA9PiBpbnN0YW5jZS5idXMsIGRlcHM6IFtXZWJXb3JrZXJJbnN0YW5jZV19KVxuXSk7XG5cbmZ1bmN0aW9uIGluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbihpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgdmFyIHNjcmlwdFVyaTogc3RyaW5nO1xuICB0cnkge1xuICAgIHNjcmlwdFVyaSA9IGluamVjdG9yLmdldChXT1JLRVJfU0NSSVBUKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICBcIllvdSBtdXN0IHByb3ZpZGUgeW91ciBXZWJXb3JrZXIncyBpbml0aWFsaXphdGlvbiBzY3JpcHQgd2l0aCB0aGUgV09SS0VSX1NDUklQVCB0b2tlblwiKTtcbiAgfVxuXG4gIGxldCBpbnN0YW5jZSA9IGluamVjdG9yLmdldChXZWJXb3JrZXJJbnN0YW5jZSk7XG4gIHNwYXduV2ViV29ya2VyKHNjcmlwdFVyaSwgaW5zdGFuY2UpO1xuXG4gIGluaXRpYWxpemVHZW5lcmljV29ya2VyUmVuZGVyZXIoaW5qZWN0b3IpO1xufVxuXG4vKipcbiAqIFNwYXducyBhIG5ldyBjbGFzcyBhbmQgaW5pdGlhbGl6ZXMgdGhlIFdlYldvcmtlckluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIHNwYXduV2ViV29ya2VyKHVyaTogc3RyaW5nLCBpbnN0YW5jZTogV2ViV29ya2VySW5zdGFuY2UpOiB2b2lkIHtcbiAgdmFyIHdlYldvcmtlcjogV29ya2VyID0gbmV3IFdvcmtlcih1cmkpO1xuICB2YXIgc2luayA9IG5ldyBQb3N0TWVzc2FnZUJ1c1Npbmsod2ViV29ya2VyKTtcbiAgdmFyIHNvdXJjZSA9IG5ldyBQb3N0TWVzc2FnZUJ1c1NvdXJjZSh3ZWJXb3JrZXIpO1xuICB2YXIgYnVzID0gbmV3IFBvc3RNZXNzYWdlQnVzKHNpbmssIHNvdXJjZSk7XG5cbiAgaW5zdGFuY2UuaW5pdCh3ZWJXb3JrZXIsIGJ1cyk7XG59XG4iXX0=