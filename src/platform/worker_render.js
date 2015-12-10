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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS93b3JrZXJfcmVuZGVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlckluc3RhbmNlIiwiV2ViV29ya2VySW5zdGFuY2UuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJJbnN0YW5jZS5pbml0IiwiaW5pdFdlYldvcmtlckFwcGxpY2F0aW9uIiwic3Bhd25XZWJXb3JrZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBSU8sa0RBQWtELENBQUMsQ0FBQTtBQUMxRCw0QkFBeUIsNkNBQTZDLENBQUMsQ0FBQTtBQUN2RSxxQkFBOEIsZUFBZSxDQUFDLENBQUE7QUFDOUMsbUJBQTZDLHNCQUFzQixDQUFDLENBQUE7QUFJcEUscUNBS08sNENBQTRDLENBQUMsQ0FBQTtBQUNwRCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRDs7O0dBR0c7QUFDSDtJQUFBQTtJQVVBQyxDQUFDQTtJQUxDRCxnQkFBZ0JBO0lBQ1RBLGdDQUFJQSxHQUFYQSxVQUFZQSxNQUFjQSxFQUFFQSxHQUFlQTtRQUN6Q0UsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ2pCQSxDQUFDQTtJQVRIRjtRQUFDQSxlQUFVQSxFQUFFQTs7MEJBVVpBO0lBQURBLHdCQUFDQTtBQUFEQSxDQUFDQSxBQVZELElBVUM7QUFUWSx5QkFBaUIsb0JBUzdCLENBQUE7QUFFRDs7R0FFRztBQUNVLHlCQUFpQixHQUEyQyxpQkFBVSxDQUFDO0lBQ2xGLCtDQUF3QjtJQUN4QixpQkFBaUI7SUFDakIsSUFBSSxhQUFRLENBQUMsc0JBQWUsRUFDZjtRQUNFLFVBQVUsRUFBRSxVQUFDLFFBQVEsSUFBSyxPQUFBLGNBQU0sT0FBQSx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsRUFBbEMsQ0FBa0MsRUFBeEMsQ0FBd0M7UUFDbEUsS0FBSyxFQUFFLElBQUk7UUFDWCxJQUFJLEVBQUUsQ0FBQyxhQUFRLENBQUM7S0FDakIsQ0FBQztJQUNmLElBQUksYUFBUSxDQUFDLHdCQUFVLEVBQUUsRUFBQyxVQUFVLEVBQUUsVUFBQyxRQUFRLElBQUssT0FBQSxRQUFRLENBQUMsR0FBRyxFQUFaLENBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDLENBQUM7Q0FDOUYsQ0FBQyxDQUFDO0FBRUgsa0NBQWtDLFFBQWtCO0lBQ2xERyxJQUFJQSxTQUFpQkEsQ0FBQ0E7SUFDdEJBLElBQUlBLENBQUNBO1FBQ0hBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLG9DQUFhQSxDQUFDQSxDQUFDQTtJQUMxQ0EsQ0FBRUE7SUFBQUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDWEEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQ25CQSxzRkFBc0ZBLENBQUNBLENBQUNBO0lBQzlGQSxDQUFDQTtJQUVEQSxJQUFJQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO0lBQy9DQSxjQUFjQSxDQUFDQSxTQUFTQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUVwQ0Esc0RBQStCQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtBQUM1Q0EsQ0FBQ0E7QUFFRDs7R0FFRztBQUNILHdCQUF3QixHQUFXLEVBQUUsUUFBMkI7SUFDOURDLElBQUlBLFNBQVNBLEdBQVdBLElBQUlBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3hDQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxxQ0FBa0JBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQzdDQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSx1Q0FBb0JBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQ2pEQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxpQ0FBY0EsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFFM0NBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0FBQ2hDQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFBvc3RNZXNzYWdlQnVzLFxuICBQb3N0TWVzc2FnZUJ1c1NpbmssXG4gIFBvc3RNZXNzYWdlQnVzU291cmNlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvcG9zdF9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtBUFBfSU5JVElBTElaRVJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbmplY3RvciwgSW5qZWN0YWJsZSwgUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7V2ViV29ya2VyU2V0dXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9zZXR1cCc7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkvcmVuZGVyZXInO1xuaW1wb3J0IHtNZXNzYWdlQmFzZWRYSFJJbXBsfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwnO1xuaW1wb3J0IHtcbiAgV09SS0VSX1JFTkRFUl9BUFBfQ09NTU9OLFxuICBXT1JLRVJfUkVOREVSX01FU1NBR0lOR19QUk9WSURFUlMsXG4gIFdPUktFUl9TQ1JJUFQsXG4gIGluaXRpYWxpemVHZW5lcmljV29ya2VyUmVuZGVyZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL3dvcmtlcl9yZW5kZXJfY29tbW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBXcmFwcGVyIGNsYXNzIHRoYXQgZXhwb3NlcyB0aGUgV29ya2VyXG4gKiBhbmQgdW5kZXJseWluZyB7QGxpbmsgTWVzc2FnZUJ1c30gZm9yIGxvd2VyIGxldmVsIG1lc3NhZ2UgcGFzc2luZy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlckluc3RhbmNlIHtcbiAgcHVibGljIHdvcmtlcjogV29ya2VyO1xuICBwdWJsaWMgYnVzOiBNZXNzYWdlQnVzO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIGluaXQod29ya2VyOiBXb3JrZXIsIGJ1czogTWVzc2FnZUJ1cykge1xuICAgIHRoaXMud29ya2VyID0gd29ya2VyO1xuICAgIHRoaXMuYnVzID0gYnVzO1xuICB9XG59XG5cbi8qKlxuICogQW4gYXJyYXkgb2YgcHJvdmlkZXJzIHRoYXQgc2hvdWxkIGJlIHBhc3NlZCBpbnRvIGBhcHBsaWNhdGlvbigpYCB3aGVuIGluaXRpYWxpemluZyBhIG5ldyBXb3JrZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBXT1JLRVJfUkVOREVSX0FQUDogQXJyYXk8YW55IC8qVHlwZSB8IFByb3ZpZGVyIHwgYW55W10qLz4gPSBDT05TVF9FWFBSKFtcbiAgV09SS0VSX1JFTkRFUl9BUFBfQ09NTU9OLFxuICBXZWJXb3JrZXJJbnN0YW5jZSxcbiAgbmV3IFByb3ZpZGVyKEFQUF9JTklUSUFMSVpFUixcbiAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogKGluamVjdG9yKSA9PiAoKSA9PiBpbml0V2ViV29ya2VyQXBwbGljYXRpb24oaW5qZWN0b3IpLFxuICAgICAgICAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgZGVwczogW0luamVjdG9yXVxuICAgICAgICAgICAgICAgfSksXG4gIG5ldyBQcm92aWRlcihNZXNzYWdlQnVzLCB7dXNlRmFjdG9yeTogKGluc3RhbmNlKSA9PiBpbnN0YW5jZS5idXMsIGRlcHM6IFtXZWJXb3JrZXJJbnN0YW5jZV19KVxuXSk7XG5cbmZ1bmN0aW9uIGluaXRXZWJXb3JrZXJBcHBsaWNhdGlvbihpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgdmFyIHNjcmlwdFVyaTogc3RyaW5nO1xuICB0cnkge1xuICAgIHNjcmlwdFVyaSA9IGluamVjdG9yLmdldChXT1JLRVJfU0NSSVBUKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICBcIllvdSBtdXN0IHByb3ZpZGUgeW91ciBXZWJXb3JrZXIncyBpbml0aWFsaXphdGlvbiBzY3JpcHQgd2l0aCB0aGUgV09SS0VSX1NDUklQVCB0b2tlblwiKTtcbiAgfVxuXG4gIGxldCBpbnN0YW5jZSA9IGluamVjdG9yLmdldChXZWJXb3JrZXJJbnN0YW5jZSk7XG4gIHNwYXduV2ViV29ya2VyKHNjcmlwdFVyaSwgaW5zdGFuY2UpO1xuXG4gIGluaXRpYWxpemVHZW5lcmljV29ya2VyUmVuZGVyZXIoaW5qZWN0b3IpO1xufVxuXG4vKipcbiAqIFNwYXducyBhIG5ldyBjbGFzcyBhbmQgaW5pdGlhbGl6ZXMgdGhlIFdlYldvcmtlckluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIHNwYXduV2ViV29ya2VyKHVyaTogc3RyaW5nLCBpbnN0YW5jZTogV2ViV29ya2VySW5zdGFuY2UpOiB2b2lkIHtcbiAgdmFyIHdlYldvcmtlcjogV29ya2VyID0gbmV3IFdvcmtlcih1cmkpO1xuICB2YXIgc2luayA9IG5ldyBQb3N0TWVzc2FnZUJ1c1Npbmsod2ViV29ya2VyKTtcbiAgdmFyIHNvdXJjZSA9IG5ldyBQb3N0TWVzc2FnZUJ1c1NvdXJjZSh3ZWJXb3JrZXIpO1xuICB2YXIgYnVzID0gbmV3IFBvc3RNZXNzYWdlQnVzKHNpbmssIHNvdXJjZSk7XG5cbiAgaW5zdGFuY2UuaW5pdCh3ZWJXb3JrZXIsIGJ1cyk7XG59XG4iXX0=