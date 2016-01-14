var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PostMessageBus, PostMessageBusSink, PostMessageBusSource } from 'angular2/src/web_workers/shared/post_message_bus';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { APP_INITIALIZER } from 'angular2/core';
import { Injector, Injectable, Provider } from 'angular2/src/core/di';
import { WORKER_RENDER_APPLICATION_COMMON, WORKER_SCRIPT, initializeGenericWorkerRenderer } from 'angular2/src/platform/worker_render_common';
import { BaseException } from 'angular2/src/facade/exceptions';
import { CONST_EXPR } from 'angular2/src/facade/lang';
/**
 * Wrapper class that exposes the Worker
 * and underlying {@link MessageBus} for lower level message passing.
 */
export let WebWorkerInstance = class {
    /** @internal */
    init(worker, bus) {
        this.worker = worker;
        this.bus = bus;
    }
};
WebWorkerInstance = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], WebWorkerInstance);
/**
 * An array of providers that should be passed into `application()` when initializing a new Worker.
 */
export const WORKER_RENDER_APPLICATION = CONST_EXPR([
    WORKER_RENDER_APPLICATION_COMMON,
    WebWorkerInstance,
    new Provider(APP_INITIALIZER, {
        useFactory: (injector) => () => initWebWorkerApplication(injector),
        multi: true,
        deps: [Injector]
    }),
    new Provider(MessageBus, { useFactory: (instance) => instance.bus, deps: [WebWorkerInstance] })
]);
function initWebWorkerApplication(injector) {
    var scriptUri;
    try {
        scriptUri = injector.get(WORKER_SCRIPT);
    }
    catch (e) {
        throw new BaseException("You must provide your WebWorker's initialization script with the WORKER_SCRIPT token");
    }
    let instance = injector.get(WebWorkerInstance);
    spawnWebWorker(scriptUri, instance);
    initializeGenericWorkerRenderer(injector);
}
/**
 * Spawns a new class and initializes the WebWorkerInstance
 */
function spawnWebWorker(uri, instance) {
    var webWorker = new Worker(uri);
    var sink = new PostMessageBusSink(webWorker);
    var source = new PostMessageBusSource(webWorker);
    var bus = new PostMessageBus(sink, source);
    instance.init(webWorker, bus);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlckluc3RhbmNlIiwiV2ViV29ya2VySW5zdGFuY2UuaW5pdCIsImluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbiIsInNwYXduV2ViV29ya2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUNMLGNBQWMsRUFDZCxrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ3JCLE1BQU0sa0RBQWtEO09BQ2xELEVBQUMsVUFBVSxFQUFDLE1BQU0sNkNBQTZDO09BQy9ELEVBQUMsZUFBZSxFQUFDLE1BQU0sZUFBZTtPQUN0QyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sc0JBQXNCO09BRzVELEVBQ0wsZ0NBQWdDLEVBRWhDLGFBQWEsRUFDYiwrQkFBK0IsRUFDaEMsTUFBTSw0Q0FBNEM7T0FDNUMsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7QUFFbkQ7OztHQUdHO0FBQ0g7SUFLRUEsZ0JBQWdCQTtJQUNUQSxJQUFJQSxDQUFDQSxNQUFjQSxFQUFFQSxHQUFlQTtRQUN6Q0MsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ2pCQSxDQUFDQTtBQUNIRCxDQUFDQTtBQVZEO0lBQUMsVUFBVSxFQUFFOztzQkFVWjtBQUVEOztHQUVHO0FBQ0gsYUFBYSx5QkFBeUIsR0FBMkMsVUFBVSxDQUFDO0lBQzFGLGdDQUFnQztJQUNoQyxpQkFBaUI7SUFDakIsSUFBSSxRQUFRLENBQUMsZUFBZSxFQUNmO1FBQ0UsVUFBVSxFQUFFLENBQUMsUUFBUSxLQUFLLE1BQU0sd0JBQXdCLENBQUMsUUFBUSxDQUFDO1FBQ2xFLEtBQUssRUFBRSxJQUFJO1FBQ1gsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDO0tBQ2pCLENBQUM7SUFDZixJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDLENBQUM7Q0FDOUYsQ0FBQyxDQUFDO0FBRUgsa0NBQWtDLFFBQWtCO0lBQ2xERSxJQUFJQSxTQUFpQkEsQ0FBQ0E7SUFDdEJBLElBQUlBLENBQUNBO1FBQ0hBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO0lBQzFDQSxDQUFFQTtJQUFBQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNYQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUNuQkEsc0ZBQXNGQSxDQUFDQSxDQUFDQTtJQUM5RkEsQ0FBQ0E7SUFFREEsSUFBSUEsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtJQUMvQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFFcENBLCtCQUErQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7QUFDNUNBLENBQUNBO0FBRUQ7O0dBRUc7QUFDSCx3QkFBd0IsR0FBVyxFQUFFLFFBQTJCO0lBQzlEQyxJQUFJQSxTQUFTQSxHQUFXQSxJQUFJQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsa0JBQWtCQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUM3Q0EsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsb0JBQW9CQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNqREEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsY0FBY0EsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFFM0NBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0FBQ2hDQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFBvc3RNZXNzYWdlQnVzLFxuICBQb3N0TWVzc2FnZUJ1c1NpbmssXG4gIFBvc3RNZXNzYWdlQnVzU291cmNlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvcG9zdF9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtBUFBfSU5JVElBTElaRVJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbmplY3RvciwgSW5qZWN0YWJsZSwgUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7TWVzc2FnZUJhc2VkUmVuZGVyZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9yZW5kZXJlcic7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFhIUkltcGx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS94aHJfaW1wbCc7XG5pbXBvcnQge1xuICBXT1JLRVJfUkVOREVSX0FQUExJQ0FUSU9OX0NPTU1PTixcbiAgV09SS0VSX1JFTkRFUl9NRVNTQUdJTkdfUFJPVklERVJTLFxuICBXT1JLRVJfU0NSSVBULFxuICBpbml0aWFsaXplR2VuZXJpY1dvcmtlclJlbmRlcmVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyX2NvbW1vbic7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogV3JhcHBlciBjbGFzcyB0aGF0IGV4cG9zZXMgdGhlIFdvcmtlclxuICogYW5kIHVuZGVybHlpbmcge0BsaW5rIE1lc3NhZ2VCdXN9IGZvciBsb3dlciBsZXZlbCBtZXNzYWdlIHBhc3NpbmcuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJJbnN0YW5jZSB7XG4gIHB1YmxpYyB3b3JrZXI6IFdvcmtlcjtcbiAgcHVibGljIGJ1czogTWVzc2FnZUJ1cztcblxuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBpbml0KHdvcmtlcjogV29ya2VyLCBidXM6IE1lc3NhZ2VCdXMpIHtcbiAgICB0aGlzLndvcmtlciA9IHdvcmtlcjtcbiAgICB0aGlzLmJ1cyA9IGJ1cztcbiAgfVxufVxuXG4vKipcbiAqIEFuIGFycmF5IG9mIHByb3ZpZGVycyB0aGF0IHNob3VsZCBiZSBwYXNzZWQgaW50byBgYXBwbGljYXRpb24oKWAgd2hlbiBpbml0aWFsaXppbmcgYSBuZXcgV29ya2VyLlxuICovXG5leHBvcnQgY29uc3QgV09SS0VSX1JFTkRFUl9BUFBMSUNBVElPTjogQXJyYXk8YW55IC8qVHlwZSB8IFByb3ZpZGVyIHwgYW55W10qLz4gPSBDT05TVF9FWFBSKFtcbiAgV09SS0VSX1JFTkRFUl9BUFBMSUNBVElPTl9DT01NT04sXG4gIFdlYldvcmtlckluc3RhbmNlLFxuICBuZXcgUHJvdmlkZXIoQVBQX0lOSVRJQUxJWkVSLFxuICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICB1c2VGYWN0b3J5OiAoaW5qZWN0b3IpID0+ICgpID0+IGluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbihpbmplY3RvciksXG4gICAgICAgICAgICAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgICAgICAgICAgICBkZXBzOiBbSW5qZWN0b3JdXG4gICAgICAgICAgICAgICB9KSxcbiAgbmV3IFByb3ZpZGVyKE1lc3NhZ2VCdXMsIHt1c2VGYWN0b3J5OiAoaW5zdGFuY2UpID0+IGluc3RhbmNlLmJ1cywgZGVwczogW1dlYldvcmtlckluc3RhbmNlXX0pXG5dKTtcblxuZnVuY3Rpb24gaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uKGluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICB2YXIgc2NyaXB0VXJpOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgc2NyaXB0VXJpID0gaW5qZWN0b3IuZ2V0KFdPUktFUl9TQ1JJUFQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgIFwiWW91IG11c3QgcHJvdmlkZSB5b3VyIFdlYldvcmtlcidzIGluaXRpYWxpemF0aW9uIHNjcmlwdCB3aXRoIHRoZSBXT1JLRVJfU0NSSVBUIHRva2VuXCIpO1xuICB9XG5cbiAgbGV0IGluc3RhbmNlID0gaW5qZWN0b3IuZ2V0KFdlYldvcmtlckluc3RhbmNlKTtcbiAgc3Bhd25XZWJXb3JrZXIoc2NyaXB0VXJpLCBpbnN0YW5jZSk7XG5cbiAgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlcihpbmplY3Rvcik7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgbmV3IGNsYXNzIGFuZCBpbml0aWFsaXplcyB0aGUgV2ViV29ya2VySW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gc3Bhd25XZWJXb3JrZXIodXJpOiBzdHJpbmcsIGluc3RhbmNlOiBXZWJXb3JrZXJJbnN0YW5jZSk6IHZvaWQge1xuICB2YXIgd2ViV29ya2VyOiBXb3JrZXIgPSBuZXcgV29ya2VyKHVyaSk7XG4gIHZhciBzaW5rID0gbmV3IFBvc3RNZXNzYWdlQnVzU2luayh3ZWJXb3JrZXIpO1xuICB2YXIgc291cmNlID0gbmV3IFBvc3RNZXNzYWdlQnVzU291cmNlKHdlYldvcmtlcik7XG4gIHZhciBidXMgPSBuZXcgUG9zdE1lc3NhZ2VCdXMoc2luaywgc291cmNlKTtcblxuICBpbnN0YW5jZS5pbml0KHdlYldvcmtlciwgYnVzKTtcbn1cbiJdfQ==