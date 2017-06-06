'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
}());
exports.WebWorkerInstance = WebWorkerInstance;
/**
 * An array of providers that should be passed into `application()` when initializing a new Worker.
 */
exports.WORKER_RENDER_APPLICATION = [
    worker_render_common_1.WORKER_RENDER_APPLICATION_COMMON, WebWorkerInstance,
    /*@ts2dart_Provider*/ {
        provide: core_1.APP_INITIALIZER,
        useFactory: (function (injector) { return function () { return initWebWorkerApplication(injector); }; }),
        multi: true,
        deps: [di_1.Injector]
    },
    /*@ts2dart_Provider*/ {
        provide: message_bus_1.MessageBus,
        useFactory: function (instance) { return instance.bus; },
        deps: [WebWorkerInstance]
    }
];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxpQ0FJTyxrREFBa0QsQ0FBQyxDQUFBO0FBQzFELDRCQUF5Qiw2Q0FBNkMsQ0FBQyxDQUFBO0FBQ3ZFLHFCQUE4QixlQUFlLENBQUMsQ0FBQTtBQUM5QyxtQkFBNkMsc0JBQXNCLENBQUMsQ0FBQTtBQUdwRSxxQ0FLTyw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ3BELDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdEOzs7R0FHRztBQUVIO0lBQUE7SUFTQSxDQUFDO0lBTEMsZ0JBQWdCO0lBQ1QsZ0NBQUksR0FBWCxVQUFZLE1BQWMsRUFBRSxHQUFlO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLENBQUM7SUFUSDtRQUFDLGVBQVUsRUFBRTs7eUJBQUE7SUFVYix3QkFBQztBQUFELENBQUMsQUFURCxJQVNDO0FBVFkseUJBQWlCLG9CQVM3QixDQUFBO0FBRUQ7O0dBRUc7QUFDVSxpQ0FBeUIsR0FBNkQ7SUFDakcsdURBQWdDLEVBQUUsaUJBQWlCO0lBQ25ELHFCQUFxQixDQUFDO1FBQ3BCLE9BQU8sRUFBRSxzQkFBZTtRQUN4QixVQUFVLEVBQUUsQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLGNBQU0sT0FBQSx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsRUFBbEMsQ0FBa0MsRUFBeEMsQ0FBd0MsQ0FBQztRQUNsRSxLQUFLLEVBQUUsSUFBSTtRQUNYLElBQUksRUFBRSxDQUFDLGFBQVEsQ0FBQztLQUNqQjtJQUNELHFCQUFxQixDQUFDO1FBQ3BCLE9BQU8sRUFBRSx3QkFBVTtRQUNuQixVQUFVLEVBQUUsVUFBQyxRQUFRLElBQUssT0FBQSxRQUFRLENBQUMsR0FBRyxFQUFaLENBQVk7UUFDdEMsSUFBSSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDMUI7Q0FDRixDQUFDO0FBRUYsa0NBQWtDLFFBQWtCO0lBQ2xELElBQUksU0FBaUIsQ0FBQztJQUN0QixJQUFJLENBQUM7UUFDSCxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBYSxDQUFDLENBQUM7SUFDMUMsQ0FBRTtJQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxNQUFNLElBQUksMEJBQWEsQ0FDbkIsc0ZBQXNGLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRUQsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQy9DLGNBQWMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFcEMsc0RBQStCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsd0JBQXdCLEdBQVcsRUFBRSxRQUEyQjtJQUM5RCxJQUFJLFNBQVMsR0FBVyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLHFDQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdDLElBQUksTUFBTSxHQUFHLElBQUksdUNBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakQsSUFBSSxHQUFHLEdBQUcsSUFBSSxpQ0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUUzQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUG9zdE1lc3NhZ2VCdXMsXG4gIFBvc3RNZXNzYWdlQnVzU2luayxcbiAgUG9zdE1lc3NhZ2VCdXNTb3VyY2Vcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9wb3N0X21lc3NhZ2VfYnVzJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge0FQUF9JTklUSUFMSVpFUn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0luamVjdG9yLCBJbmplY3RhYmxlLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3JlbmRlcmVyJztcbmltcG9ydCB7TWVzc2FnZUJhc2VkWEhSSW1wbH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3hocl9pbXBsJztcbmltcG9ydCB7XG4gIFdPUktFUl9SRU5ERVJfQVBQTElDQVRJT05fQ09NTU9OLFxuICBXT1JLRVJfUkVOREVSX01FU1NBR0lOR19QUk9WSURFUlMsXG4gIFdPUktFUl9TQ1JJUFQsXG4gIGluaXRpYWxpemVHZW5lcmljV29ya2VyUmVuZGVyZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL3dvcmtlcl9yZW5kZXJfY29tbW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuLyoqXG4gKiBXcmFwcGVyIGNsYXNzIHRoYXQgZXhwb3NlcyB0aGUgV29ya2VyXG4gKiBhbmQgdW5kZXJseWluZyB7QGxpbmsgTWVzc2FnZUJ1c30gZm9yIGxvd2VyIGxldmVsIG1lc3NhZ2UgcGFzc2luZy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlckluc3RhbmNlIHtcbiAgcHVibGljIHdvcmtlcjogV29ya2VyO1xuICBwdWJsaWMgYnVzOiBNZXNzYWdlQnVzO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIGluaXQod29ya2VyOiBXb3JrZXIsIGJ1czogTWVzc2FnZUJ1cykge1xuICAgIHRoaXMud29ya2VyID0gd29ya2VyO1xuICAgIHRoaXMuYnVzID0gYnVzO1xuICB9XG59XG5cbi8qKlxuICogQW4gYXJyYXkgb2YgcHJvdmlkZXJzIHRoYXQgc2hvdWxkIGJlIHBhc3NlZCBpbnRvIGBhcHBsaWNhdGlvbigpYCB3aGVuIGluaXRpYWxpemluZyBhIG5ldyBXb3JrZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBXT1JLRVJfUkVOREVSX0FQUExJQ0FUSU9OOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9IC8qQHRzMmRhcnRfY29uc3QqL1tcbiAgV09SS0VSX1JFTkRFUl9BUFBMSUNBVElPTl9DT01NT04sIFdlYldvcmtlckluc3RhbmNlLFxuICAvKkB0czJkYXJ0X1Byb3ZpZGVyKi8ge1xuICAgIHByb3ZpZGU6IEFQUF9JTklUSUFMSVpFUixcbiAgICB1c2VGYWN0b3J5OiAoaW5qZWN0b3IgPT4gKCkgPT4gaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uKGluamVjdG9yKSksXG4gICAgbXVsdGk6IHRydWUsXG4gICAgZGVwczogW0luamVjdG9yXVxuICB9LFxuICAvKkB0czJkYXJ0X1Byb3ZpZGVyKi8ge1xuICAgIHByb3ZpZGU6IE1lc3NhZ2VCdXMsXG4gICAgdXNlRmFjdG9yeTogKGluc3RhbmNlKSA9PiBpbnN0YW5jZS5idXMsXG4gICAgZGVwczogW1dlYldvcmtlckluc3RhbmNlXVxuICB9XG5dO1xuXG5mdW5jdGlvbiBpbml0V2ViV29ya2VyQXBwbGljYXRpb24oaW5qZWN0b3I6IEluamVjdG9yKTogdm9pZCB7XG4gIHZhciBzY3JpcHRVcmk6IHN0cmluZztcbiAgdHJ5IHtcbiAgICBzY3JpcHRVcmkgPSBpbmplY3Rvci5nZXQoV09SS0VSX1NDUklQVCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgXCJZb3UgbXVzdCBwcm92aWRlIHlvdXIgV2ViV29ya2VyJ3MgaW5pdGlhbGl6YXRpb24gc2NyaXB0IHdpdGggdGhlIFdPUktFUl9TQ1JJUFQgdG9rZW5cIik7XG4gIH1cblxuICBsZXQgaW5zdGFuY2UgPSBpbmplY3Rvci5nZXQoV2ViV29ya2VySW5zdGFuY2UpO1xuICBzcGF3bldlYldvcmtlcihzY3JpcHRVcmksIGluc3RhbmNlKTtcblxuICBpbml0aWFsaXplR2VuZXJpY1dvcmtlclJlbmRlcmVyKGluamVjdG9yKTtcbn1cblxuLyoqXG4gKiBTcGF3bnMgYSBuZXcgY2xhc3MgYW5kIGluaXRpYWxpemVzIHRoZSBXZWJXb3JrZXJJbnN0YW5jZVxuICovXG5mdW5jdGlvbiBzcGF3bldlYldvcmtlcih1cmk6IHN0cmluZywgaW5zdGFuY2U6IFdlYldvcmtlckluc3RhbmNlKTogdm9pZCB7XG4gIHZhciB3ZWJXb3JrZXI6IFdvcmtlciA9IG5ldyBXb3JrZXIodXJpKTtcbiAgdmFyIHNpbmsgPSBuZXcgUG9zdE1lc3NhZ2VCdXNTaW5rKHdlYldvcmtlcik7XG4gIHZhciBzb3VyY2UgPSBuZXcgUG9zdE1lc3NhZ2VCdXNTb3VyY2Uod2ViV29ya2VyKTtcbiAgdmFyIGJ1cyA9IG5ldyBQb3N0TWVzc2FnZUJ1cyhzaW5rLCBzb3VyY2UpO1xuXG4gIGluc3RhbmNlLmluaXQod2ViV29ya2VyLCBidXMpO1xufVxuIl19