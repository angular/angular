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
import { Injector, Injectable } from 'angular2/src/core/di';
import { WORKER_RENDER_APPLICATION_COMMON, WORKER_SCRIPT, initializeGenericWorkerRenderer } from 'angular2/src/platform/worker_render_common';
import { BaseException } from 'angular2/src/facade/exceptions';
/**
 * Wrapper class that exposes the Worker
 * and underlying {@link MessageBus} for lower level message passing.
 */
export let WebWorkerInstance = class WebWorkerInstance {
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
export const WORKER_RENDER_APPLICATION = [
    WORKER_RENDER_APPLICATION_COMMON, WebWorkerInstance,
    /*@ts2dart_Provider*/ {
        provide: APP_INITIALIZER,
        useFactory: (injector => () => initWebWorkerApplication(injector)),
        multi: true,
        deps: [Injector]
    },
    /*@ts2dart_Provider*/ {
        provide: MessageBus,
        useFactory: (instance) => instance.bus,
        deps: [WebWorkerInstance]
    }
];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQ0wsY0FBYyxFQUNkLGtCQUFrQixFQUNsQixvQkFBb0IsRUFDckIsTUFBTSxrREFBa0Q7T0FDbEQsRUFBQyxVQUFVLEVBQUMsTUFBTSw2Q0FBNkM7T0FDL0QsRUFBQyxlQUFlLEVBQUMsTUFBTSxlQUFlO09BQ3RDLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBVyxNQUFNLHNCQUFzQjtPQUc1RCxFQUNMLGdDQUFnQyxFQUVoQyxhQUFhLEVBQ2IsK0JBQStCLEVBQ2hDLE1BQU0sNENBQTRDO09BQzVDLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO0FBRTVEOzs7R0FHRztBQUVIO0lBSUUsZ0JBQWdCO0lBQ1QsSUFBSSxDQUFDLE1BQWMsRUFBRSxHQUFlO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLENBQUM7QUFDSCxDQUFDO0FBVkQ7SUFBQyxVQUFVLEVBQUU7O3FCQUFBO0FBWWI7O0dBRUc7QUFDSCxPQUFPLE1BQU0seUJBQXlCLEdBQTZEO0lBQ2pHLGdDQUFnQyxFQUFFLGlCQUFpQjtJQUNuRCxxQkFBcUIsQ0FBQztRQUNwQixPQUFPLEVBQUUsZUFBZTtRQUN4QixVQUFVLEVBQUUsQ0FBQyxRQUFRLElBQUksTUFBTSx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRSxLQUFLLEVBQUUsSUFBSTtRQUNYLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQztLQUNqQjtJQUNELHFCQUFxQixDQUFDO1FBQ3BCLE9BQU8sRUFBRSxVQUFVO1FBQ25CLFVBQVUsRUFBRSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsR0FBRztRQUN0QyxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztLQUMxQjtDQUNGLENBQUM7QUFFRixrQ0FBa0MsUUFBa0I7SUFDbEQsSUFBSSxTQUFpQixDQUFDO0lBQ3RCLElBQUksQ0FBQztRQUNILFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFDLENBQUU7SUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsTUFBTSxJQUFJLGFBQWEsQ0FDbkIsc0ZBQXNGLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRUQsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQy9DLGNBQWMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFcEMsK0JBQStCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsd0JBQXdCLEdBQVcsRUFBRSxRQUEyQjtJQUM5RCxJQUFJLFNBQVMsR0FBVyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdDLElBQUksTUFBTSxHQUFHLElBQUksb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakQsSUFBSSxHQUFHLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTNDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBQb3N0TWVzc2FnZUJ1cyxcbiAgUG9zdE1lc3NhZ2VCdXNTaW5rLFxuICBQb3N0TWVzc2FnZUJ1c1NvdXJjZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3Bvc3RfbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmltcG9ydCB7QVBQX0lOSVRJQUxJWkVSfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW5qZWN0b3IsIEluamVjdGFibGUsIFByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvcmVuZGVyZXInO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRYSFJJbXBsfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwnO1xuaW1wb3J0IHtcbiAgV09SS0VSX1JFTkRFUl9BUFBMSUNBVElPTl9DT01NT04sXG4gIFdPUktFUl9SRU5ERVJfTUVTU0FHSU5HX1BST1ZJREVSUyxcbiAgV09SS0VSX1NDUklQVCxcbiAgaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX3JlbmRlcl9jb21tb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG4vKipcbiAqIFdyYXBwZXIgY2xhc3MgdGhhdCBleHBvc2VzIHRoZSBXb3JrZXJcbiAqIGFuZCB1bmRlcmx5aW5nIHtAbGluayBNZXNzYWdlQnVzfSBmb3IgbG93ZXIgbGV2ZWwgbWVzc2FnZSBwYXNzaW5nLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VySW5zdGFuY2Uge1xuICBwdWJsaWMgd29ya2VyOiBXb3JrZXI7XG4gIHB1YmxpYyBidXM6IE1lc3NhZ2VCdXM7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgaW5pdCh3b3JrZXI6IFdvcmtlciwgYnVzOiBNZXNzYWdlQnVzKSB7XG4gICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgdGhpcy5idXMgPSBidXM7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBhcnJheSBvZiBwcm92aWRlcnMgdGhhdCBzaG91bGQgYmUgcGFzc2VkIGludG8gYGFwcGxpY2F0aW9uKClgIHdoZW4gaW5pdGlhbGl6aW5nIGEgbmV3IFdvcmtlci5cbiAqL1xuZXhwb3J0IGNvbnN0IFdPUktFUl9SRU5ERVJfQVBQTElDQVRJT046IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+ID0gLypAdHMyZGFydF9jb25zdCovW1xuICBXT1JLRVJfUkVOREVSX0FQUExJQ0FUSU9OX0NPTU1PTiwgV2ViV29ya2VySW5zdGFuY2UsXG4gIC8qQHRzMmRhcnRfUHJvdmlkZXIqLyB7XG4gICAgcHJvdmlkZTogQVBQX0lOSVRJQUxJWkVSLFxuICAgIHVzZUZhY3Rvcnk6IChpbmplY3RvciA9PiAoKSA9PiBpbml0V2ViV29ya2VyQXBwbGljYXRpb24oaW5qZWN0b3IpKSxcbiAgICBtdWx0aTogdHJ1ZSxcbiAgICBkZXBzOiBbSW5qZWN0b3JdXG4gIH0sXG4gIC8qQHRzMmRhcnRfUHJvdmlkZXIqLyB7XG4gICAgcHJvdmlkZTogTWVzc2FnZUJ1cyxcbiAgICB1c2VGYWN0b3J5OiAoaW5zdGFuY2UpID0+IGluc3RhbmNlLmJ1cyxcbiAgICBkZXBzOiBbV2ViV29ya2VySW5zdGFuY2VdXG4gIH1cbl07XG5cbmZ1bmN0aW9uIGluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbihpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgdmFyIHNjcmlwdFVyaTogc3RyaW5nO1xuICB0cnkge1xuICAgIHNjcmlwdFVyaSA9IGluamVjdG9yLmdldChXT1JLRVJfU0NSSVBUKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICBcIllvdSBtdXN0IHByb3ZpZGUgeW91ciBXZWJXb3JrZXIncyBpbml0aWFsaXphdGlvbiBzY3JpcHQgd2l0aCB0aGUgV09SS0VSX1NDUklQVCB0b2tlblwiKTtcbiAgfVxuXG4gIGxldCBpbnN0YW5jZSA9IGluamVjdG9yLmdldChXZWJXb3JrZXJJbnN0YW5jZSk7XG4gIHNwYXduV2ViV29ya2VyKHNjcmlwdFVyaSwgaW5zdGFuY2UpO1xuXG4gIGluaXRpYWxpemVHZW5lcmljV29ya2VyUmVuZGVyZXIoaW5qZWN0b3IpO1xufVxuXG4vKipcbiAqIFNwYXducyBhIG5ldyBjbGFzcyBhbmQgaW5pdGlhbGl6ZXMgdGhlIFdlYldvcmtlckluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIHNwYXduV2ViV29ya2VyKHVyaTogc3RyaW5nLCBpbnN0YW5jZTogV2ViV29ya2VySW5zdGFuY2UpOiB2b2lkIHtcbiAgdmFyIHdlYldvcmtlcjogV29ya2VyID0gbmV3IFdvcmtlcih1cmkpO1xuICB2YXIgc2luayA9IG5ldyBQb3N0TWVzc2FnZUJ1c1Npbmsod2ViV29ya2VyKTtcbiAgdmFyIHNvdXJjZSA9IG5ldyBQb3N0TWVzc2FnZUJ1c1NvdXJjZSh3ZWJXb3JrZXIpO1xuICB2YXIgYnVzID0gbmV3IFBvc3RNZXNzYWdlQnVzKHNpbmssIHNvdXJjZSk7XG5cbiAgaW5zdGFuY2UuaW5pdCh3ZWJXb3JrZXIsIGJ1cyk7XG59XG4iXX0=