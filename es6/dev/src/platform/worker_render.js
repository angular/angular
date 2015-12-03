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
import { PostMessageBus, PostMessageBusSink, PostMessageBusSource } from 'angular2/src/web_workers/shared/post_message_bus';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { APP_INITIALIZER } from 'angular2/core';
import { Injector, Injectable, Provider } from 'angular2/src/core/di';
import { WORKER_RENDER_APP_COMMON, WORKER_SCRIPT, initializeGenericWorkerRenderer } from 'angular2/src/platform/worker_render_common';
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
export const WORKER_RENDER_APP = CONST_EXPR([
    WORKER_RENDER_APP_COMMON,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlckluc3RhbmNlIiwiV2ViV29ya2VySW5zdGFuY2UuaW5pdCIsImluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbiIsInNwYXduV2ViV29ya2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQ0wsY0FBYyxFQUNkLGtCQUFrQixFQUNsQixvQkFBb0IsRUFDckIsTUFBTSxrREFBa0Q7T0FDbEQsRUFBQyxVQUFVLEVBQUMsTUFBTSw2Q0FBNkM7T0FDL0QsRUFBQyxlQUFlLEVBQUMsTUFBTSxlQUFlO09BQ3RDLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0I7T0FJNUQsRUFDTCx3QkFBd0IsRUFFeEIsYUFBYSxFQUNiLCtCQUErQixFQUNoQyxNQUFNLDRDQUE0QztPQUM1QyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtBQUVuRDs7O0dBR0c7QUFDSDtJQUtFQSxnQkFBZ0JBO0lBQ1RBLElBQUlBLENBQUNBLE1BQWNBLEVBQUVBLEdBQWVBO1FBQ3pDQyxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDakJBLENBQUNBO0FBQ0hELENBQUNBO0FBVkQ7SUFBQyxVQUFVLEVBQUU7O3NCQVVaO0FBRUQ7O0dBRUc7QUFDSCxhQUFhLGlCQUFpQixHQUEyQyxVQUFVLENBQUM7SUFDbEYsd0JBQXdCO0lBQ3hCLGlCQUFpQjtJQUNqQixJQUFJLFFBQVEsQ0FBQyxlQUFlLEVBQ2Y7UUFDRSxVQUFVLEVBQUUsQ0FBQyxRQUFRLEtBQUssTUFBTSx3QkFBd0IsQ0FBQyxRQUFRLENBQUM7UUFDbEUsS0FBSyxFQUFFLElBQUk7UUFDWCxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUM7S0FDakIsQ0FBQztJQUNmLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUMsQ0FBQztDQUM5RixDQUFDLENBQUM7QUFFSCxrQ0FBa0MsUUFBa0I7SUFDbERFLElBQUlBLFNBQWlCQSxDQUFDQTtJQUN0QkEsSUFBSUEsQ0FBQ0E7UUFDSEEsU0FBU0EsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7SUFDMUNBLENBQUVBO0lBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ1hBLE1BQU1BLElBQUlBLGFBQWFBLENBQ25CQSxzRkFBc0ZBLENBQUNBLENBQUNBO0lBQzlGQSxDQUFDQTtJQUVEQSxJQUFJQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO0lBQy9DQSxjQUFjQSxDQUFDQSxTQUFTQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUVwQ0EsK0JBQStCQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtBQUM1Q0EsQ0FBQ0E7QUFFRDs7R0FFRztBQUNILHdCQUF3QixHQUFXLEVBQUUsUUFBMkI7SUFDOURDLElBQUlBLFNBQVNBLEdBQVdBLElBQUlBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3hDQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxrQkFBa0JBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQzdDQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxvQkFBb0JBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQ2pEQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxjQUFjQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUUzQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDaENBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUG9zdE1lc3NhZ2VCdXMsXG4gIFBvc3RNZXNzYWdlQnVzU2luayxcbiAgUG9zdE1lc3NhZ2VCdXNTb3VyY2Vcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9wb3N0X21lc3NhZ2VfYnVzJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge0FQUF9JTklUSUFMSVpFUn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0luamVjdG9yLCBJbmplY3RhYmxlLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtXZWJXb3JrZXJTZXR1cH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3NldHVwJztcbmltcG9ydCB7TWVzc2FnZUJhc2VkUmVuZGVyZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9yZW5kZXJlcic7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFhIUkltcGx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS94aHJfaW1wbCc7XG5pbXBvcnQge1xuICBXT1JLRVJfUkVOREVSX0FQUF9DT01NT04sXG4gIFdPUktFUl9SRU5ERVJfTUVTU0FHSU5HX1BST1ZJREVSUyxcbiAgV09SS0VSX1NDUklQVCxcbiAgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX3JlbmRlcl9jb21tb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFdyYXBwZXIgY2xhc3MgdGhhdCBleHBvc2VzIHRoZSBXb3JrZXJcbiAqIGFuZCB1bmRlcmx5aW5nIHtAbGluayBNZXNzYWdlQnVzfSBmb3IgbG93ZXIgbGV2ZWwgbWVzc2FnZSBwYXNzaW5nLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VySW5zdGFuY2Uge1xuICBwdWJsaWMgd29ya2VyOiBXb3JrZXI7XG4gIHB1YmxpYyBidXM6IE1lc3NhZ2VCdXM7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgaW5pdCh3b3JrZXI6IFdvcmtlciwgYnVzOiBNZXNzYWdlQnVzKSB7XG4gICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgdGhpcy5idXMgPSBidXM7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBhcnJheSBvZiBwcm92aWRlcnMgdGhhdCBzaG91bGQgYmUgcGFzc2VkIGludG8gYGFwcGxpY2F0aW9uKClgIHdoZW4gaW5pdGlhbGl6aW5nIGEgbmV3IFdvcmtlci5cbiAqL1xuZXhwb3J0IGNvbnN0IFdPUktFUl9SRU5ERVJfQVBQOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9IENPTlNUX0VYUFIoW1xuICBXT1JLRVJfUkVOREVSX0FQUF9DT01NT04sXG4gIFdlYldvcmtlckluc3RhbmNlLFxuICBuZXcgUHJvdmlkZXIoQVBQX0lOSVRJQUxJWkVSLFxuICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICB1c2VGYWN0b3J5OiAoaW5qZWN0b3IpID0+ICgpID0+IGluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbihpbmplY3RvciksXG4gICAgICAgICAgICAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgICAgICAgICAgICBkZXBzOiBbSW5qZWN0b3JdXG4gICAgICAgICAgICAgICB9KSxcbiAgbmV3IFByb3ZpZGVyKE1lc3NhZ2VCdXMsIHt1c2VGYWN0b3J5OiAoaW5zdGFuY2UpID0+IGluc3RhbmNlLmJ1cywgZGVwczogW1dlYldvcmtlckluc3RhbmNlXX0pXG5dKTtcblxuZnVuY3Rpb24gaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uKGluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICB2YXIgc2NyaXB0VXJpOiBzdHJpbmc7XG4gIHRyeSB7XG4gICAgc2NyaXB0VXJpID0gaW5qZWN0b3IuZ2V0KFdPUktFUl9TQ1JJUFQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgIFwiWW91IG11c3QgcHJvdmlkZSB5b3VyIFdlYldvcmtlcidzIGluaXRpYWxpemF0aW9uIHNjcmlwdCB3aXRoIHRoZSBXT1JLRVJfU0NSSVBUIHRva2VuXCIpO1xuICB9XG5cbiAgbGV0IGluc3RhbmNlID0gaW5qZWN0b3IuZ2V0KFdlYldvcmtlckluc3RhbmNlKTtcbiAgc3Bhd25XZWJXb3JrZXIoc2NyaXB0VXJpLCBpbnN0YW5jZSk7XG5cbiAgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlcihpbmplY3Rvcik7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgbmV3IGNsYXNzIGFuZCBpbml0aWFsaXplcyB0aGUgV2ViV29ya2VySW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gc3Bhd25XZWJXb3JrZXIodXJpOiBzdHJpbmcsIGluc3RhbmNlOiBXZWJXb3JrZXJJbnN0YW5jZSk6IHZvaWQge1xuICB2YXIgd2ViV29ya2VyOiBXb3JrZXIgPSBuZXcgV29ya2VyKHVyaSk7XG4gIHZhciBzaW5rID0gbmV3IFBvc3RNZXNzYWdlQnVzU2luayh3ZWJXb3JrZXIpO1xuICB2YXIgc291cmNlID0gbmV3IFBvc3RNZXNzYWdlQnVzU291cmNlKHdlYldvcmtlcik7XG4gIHZhciBidXMgPSBuZXcgUG9zdE1lc3NhZ2VCdXMoc2luaywgc291cmNlKTtcblxuICBpbnN0YW5jZS5pbml0KHdlYldvcmtlciwgYnVzKTtcbn1cbiJdfQ==