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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlckluc3RhbmNlIiwiV2ViV29ya2VySW5zdGFuY2UuaW5pdCIsImluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbiIsInNwYXduV2ViV29ya2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUNMLGNBQWMsRUFDZCxrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ3JCLE1BQU0sa0RBQWtEO09BQ2xELEVBQUMsVUFBVSxFQUFDLE1BQU0sNkNBQTZDO09BQy9ELEVBQUMsZUFBZSxFQUFDLE1BQU0sZUFBZTtPQUN0QyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sc0JBQXNCO09BSTVELEVBQ0wsd0JBQXdCLEVBRXhCLGFBQWEsRUFDYiwrQkFBK0IsRUFDaEMsTUFBTSw0Q0FBNEM7T0FDNUMsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7QUFFbkQ7OztHQUdHO0FBQ0g7SUFLRUEsZ0JBQWdCQTtJQUNUQSxJQUFJQSxDQUFDQSxNQUFjQSxFQUFFQSxHQUFlQTtRQUN6Q0MsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ2pCQSxDQUFDQTtBQUNIRCxDQUFDQTtBQVZEO0lBQUMsVUFBVSxFQUFFOztzQkFVWjtBQUVEOztHQUVHO0FBQ0gsYUFBYSxpQkFBaUIsR0FBMkMsVUFBVSxDQUFDO0lBQ2xGLHdCQUF3QjtJQUN4QixpQkFBaUI7SUFDakIsSUFBSSxRQUFRLENBQUMsZUFBZSxFQUNmO1FBQ0UsVUFBVSxFQUFFLENBQUMsUUFBUSxLQUFLLE1BQU0sd0JBQXdCLENBQUMsUUFBUSxDQUFDO1FBQ2xFLEtBQUssRUFBRSxJQUFJO1FBQ1gsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDO0tBQ2pCLENBQUM7SUFDZixJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDLENBQUM7Q0FDOUYsQ0FBQyxDQUFDO0FBRUgsa0NBQWtDLFFBQWtCO0lBQ2xERSxJQUFJQSxTQUFpQkEsQ0FBQ0E7SUFDdEJBLElBQUlBLENBQUNBO1FBQ0hBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO0lBQzFDQSxDQUFFQTtJQUFBQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNYQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUNuQkEsc0ZBQXNGQSxDQUFDQSxDQUFDQTtJQUM5RkEsQ0FBQ0E7SUFFREEsSUFBSUEsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtJQUMvQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFFcENBLCtCQUErQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7QUFDNUNBLENBQUNBO0FBRUQ7O0dBRUc7QUFDSCx3QkFBd0IsR0FBVyxFQUFFLFFBQTJCO0lBQzlEQyxJQUFJQSxTQUFTQSxHQUFXQSxJQUFJQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsa0JBQWtCQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUM3Q0EsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsb0JBQW9CQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNqREEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsY0FBY0EsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFFM0NBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0FBQ2hDQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFBvc3RNZXNzYWdlQnVzLFxuICBQb3N0TWVzc2FnZUJ1c1NpbmssXG4gIFBvc3RNZXNzYWdlQnVzU291cmNlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvcG9zdF9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtBUFBfSU5JVElBTElaRVJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbmplY3RvciwgSW5qZWN0YWJsZSwgUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7V2ViV29ya2VyU2V0dXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9zZXR1cCc7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvcmVuZGVyZXInO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRYSFJJbXBsfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwnO1xuaW1wb3J0IHtcbiAgV09SS0VSX1JFTkRFUl9BUFBfQ09NTU9OLFxuICBXT1JLRVJfUkVOREVSX01FU1NBR0lOR19QUk9WSURFUlMsXG4gIFdPUktFUl9TQ1JJUFQsXG4gIGluaXRpYWxpemVHZW5lcmljV29ya2VyUmVuZGVyZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL3dvcmtlcl9yZW5kZXJfY29tbW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBXcmFwcGVyIGNsYXNzIHRoYXQgZXhwb3NlcyB0aGUgV29ya2VyXG4gKiBhbmQgdW5kZXJseWluZyB7QGxpbmsgTWVzc2FnZUJ1c30gZm9yIGxvd2VyIGxldmVsIG1lc3NhZ2UgcGFzc2luZy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlckluc3RhbmNlIHtcbiAgcHVibGljIHdvcmtlcjogV29ya2VyO1xuICBwdWJsaWMgYnVzOiBNZXNzYWdlQnVzO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIGluaXQod29ya2VyOiBXb3JrZXIsIGJ1czogTWVzc2FnZUJ1cykge1xuICAgIHRoaXMud29ya2VyID0gd29ya2VyO1xuICAgIHRoaXMuYnVzID0gYnVzO1xuICB9XG59XG5cbi8qKlxuICogQW4gYXJyYXkgb2YgcHJvdmlkZXJzIHRoYXQgc2hvdWxkIGJlIHBhc3NlZCBpbnRvIGBhcHBsaWNhdGlvbigpYCB3aGVuIGluaXRpYWxpemluZyBhIG5ldyBXb3JrZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBXT1JLRVJfUkVOREVSX0FQUDogQXJyYXk8YW55IC8qVHlwZSB8IFByb3ZpZGVyIHwgYW55W10qLz4gPSBDT05TVF9FWFBSKFtcbiAgV09SS0VSX1JFTkRFUl9BUFBfQ09NTU9OLFxuICBXZWJXb3JrZXJJbnN0YW5jZSxcbiAgbmV3IFByb3ZpZGVyKEFQUF9JTklUSUFMSVpFUixcbiAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogKGluamVjdG9yKSA9PiAoKSA9PiBpbml0V2ViV29ya2VyQXBwbGljYXRpb24oaW5qZWN0b3IpLFxuICAgICAgICAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgZGVwczogW0luamVjdG9yXVxuICAgICAgICAgICAgICAgfSksXG4gIG5ldyBQcm92aWRlcihNZXNzYWdlQnVzLCB7dXNlRmFjdG9yeTogKGluc3RhbmNlKSA9PiBpbnN0YW5jZS5idXMsIGRlcHM6IFtXZWJXb3JrZXJJbnN0YW5jZV19KVxuXSk7XG5cbmZ1bmN0aW9uIGluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbihpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgdmFyIHNjcmlwdFVyaTogc3RyaW5nO1xuICB0cnkge1xuICAgIHNjcmlwdFVyaSA9IGluamVjdG9yLmdldChXT1JLRVJfU0NSSVBUKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICBcIllvdSBtdXN0IHByb3ZpZGUgeW91ciBXZWJXb3JrZXIncyBpbml0aWFsaXphdGlvbiBzY3JpcHQgd2l0aCB0aGUgV09SS0VSX1NDUklQVCB0b2tlblwiKTtcbiAgfVxuXG4gIGxldCBpbnN0YW5jZSA9IGluamVjdG9yLmdldChXZWJXb3JrZXJJbnN0YW5jZSk7XG4gIHNwYXduV2ViV29ya2VyKHNjcmlwdFVyaSwgaW5zdGFuY2UpO1xuXG4gIGluaXRpYWxpemVHZW5lcmljV29ya2VyUmVuZGVyZXIoaW5qZWN0b3IpO1xufVxuXG4vKipcbiAqIFNwYXducyBhIG5ldyBjbGFzcyBhbmQgaW5pdGlhbGl6ZXMgdGhlIFdlYldvcmtlckluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIHNwYXduV2ViV29ya2VyKHVyaTogc3RyaW5nLCBpbnN0YW5jZTogV2ViV29ya2VySW5zdGFuY2UpOiB2b2lkIHtcbiAgdmFyIHdlYldvcmtlcjogV29ya2VyID0gbmV3IFdvcmtlcih1cmkpO1xuICB2YXIgc2luayA9IG5ldyBQb3N0TWVzc2FnZUJ1c1Npbmsod2ViV29ya2VyKTtcbiAgdmFyIHNvdXJjZSA9IG5ldyBQb3N0TWVzc2FnZUJ1c1NvdXJjZSh3ZWJXb3JrZXIpO1xuICB2YXIgYnVzID0gbmV3IFBvc3RNZXNzYWdlQnVzKHNpbmssIHNvdXJjZSk7XG5cbiAgaW5zdGFuY2UuaW5pdCh3ZWJXb3JrZXIsIGJ1cyk7XG59XG4iXX0=