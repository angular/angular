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
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var api_1 = require('angular2/src/core/render/api');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var async_1 = require('angular2/src/facade/async');
var event_deserializer_1 = require('./event_deserializer');
var WebWorkerEventDispatcher = (function () {
    function WebWorkerEventDispatcher(bus, _serializer) {
        var _this = this;
        this._serializer = _serializer;
        this._eventDispatchRegistry = new collection_1.Map();
        bus.initChannel(messaging_api_1.EVENT_CHANNEL);
        var source = bus.from(messaging_api_1.EVENT_CHANNEL);
        async_1.ObservableWrapper.subscribe(source, function (message) { return _this._dispatchEvent(new RenderEventData(message, _serializer)); });
    }
    WebWorkerEventDispatcher.prototype._dispatchEvent = function (eventData) {
        var dispatcher = this._eventDispatchRegistry.get(eventData.viewRef);
        eventData.locals['$event'] = event_deserializer_1.deserializeGenericEvent(eventData.locals['$event']);
        dispatcher.dispatchRenderEvent(eventData.elementIndex, eventData.eventName, eventData.locals);
    };
    WebWorkerEventDispatcher.prototype.registerEventDispatcher = function (viewRef, dispatcher) {
        this._eventDispatchRegistry.set(viewRef, dispatcher);
    };
    WebWorkerEventDispatcher = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [message_bus_1.MessageBus, serializer_1.Serializer])
    ], WebWorkerEventDispatcher);
    return WebWorkerEventDispatcher;
})();
exports.WebWorkerEventDispatcher = WebWorkerEventDispatcher;
var RenderEventData = (function () {
    function RenderEventData(message, serializer) {
        this.viewRef = serializer.deserialize(message['viewRef'], api_1.RenderViewRef);
        this.elementIndex = message['elementIndex'];
        this.eventName = message['eventName'];
        this.locals = collection_1.MapWrapper.createFromStringMap(message['locals']);
    }
    return RenderEventData;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy93b3JrZXIvZXZlbnRfZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6WyJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIuX2Rpc3BhdGNoRXZlbnQiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIucmVnaXN0ZXJFdmVudERpc3BhdGNoZXIiLCJSZW5kZXJFdmVudERhdGEiLCJSZW5kZXJFdmVudERhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsMkJBQThCLGdDQUFnQyxDQUFDLENBQUE7QUFDL0Qsb0JBQW1ELDhCQUE4QixDQUFDLENBQUE7QUFDbEYsMkJBQXlCLDRDQUE0QyxDQUFDLENBQUE7QUFDdEUsOEJBQTRCLCtDQUErQyxDQUFDLENBQUE7QUFDNUUsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUsbUNBQXNDLHNCQUFzQixDQUFDLENBQUE7QUFFN0Q7SUFLRUEsa0NBQVlBLEdBQWVBLEVBQVVBLFdBQXVCQTtRQUw5REMsaUJBc0JDQTtRQWpCc0NBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtRQUhwREEsMkJBQXNCQSxHQUMxQkEsSUFBSUEsZ0JBQUdBLEVBQXdDQSxDQUFDQTtRQUdsREEsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsNkJBQWFBLENBQUNBLENBQUNBO1FBQy9CQSxJQUFJQSxNQUFNQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSw2QkFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDckNBLHlCQUFpQkEsQ0FBQ0EsU0FBU0EsQ0FDdkJBLE1BQU1BLEVBQUVBLFVBQUNBLE9BQU9BLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLE9BQU9BLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBLEVBQTlEQSxDQUE4REEsQ0FBQ0EsQ0FBQ0E7SUFDM0ZBLENBQUNBO0lBR09ELGlEQUFjQSxHQUF0QkEsVUFBdUJBLFNBQTBCQTtRQUMvQ0UsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNwRUEsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsNENBQXVCQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRkEsVUFBVUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxFQUFFQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUNoR0EsQ0FBQ0E7SUFFREYsMERBQXVCQSxHQUF2QkEsVUFBd0JBLE9BQXNCQSxFQUFFQSxVQUFpQ0E7UUFDL0VHLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBckJISDtRQUFDQSxlQUFVQSxFQUFFQTs7aUNBc0JaQTtJQUFEQSwrQkFBQ0E7QUFBREEsQ0FBQ0EsQUF0QkQsSUFzQkM7QUFyQlksZ0NBQXdCLDJCQXFCcEMsQ0FBQTtBQUdEO0lBTUVJLHlCQUFZQSxPQUE2QkEsRUFBRUEsVUFBc0JBO1FBQy9EQyxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxVQUFVQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxtQkFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDekVBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLE9BQU9BLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO1FBQzVDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUN0Q0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsdUJBQVVBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbEVBLENBQUNBO0lBQ0hELHNCQUFDQTtBQUFEQSxDQUFDQSxBQVpELElBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7TWFwLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtSZW5kZXJWaWV3UmVmLCBSZW5kZXJFdmVudERpc3BhdGNoZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtTZXJpYWxpemVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtFVkVOVF9DSEFOTkVMfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2luZ19hcGknO1xuaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge2Rlc2VyaWFsaXplR2VuZXJpY0V2ZW50fSBmcm9tICcuL2V2ZW50X2Rlc2VyaWFsaXplcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIge1xuICBwcml2YXRlIF9ldmVudERpc3BhdGNoUmVnaXN0cnk6IE1hcDxSZW5kZXJWaWV3UmVmLCBSZW5kZXJFdmVudERpc3BhdGNoZXI+ID1cbiAgICAgIG5ldyBNYXA8UmVuZGVyVmlld1JlZiwgUmVuZGVyRXZlbnREaXNwYXRjaGVyPigpO1xuXG4gIGNvbnN0cnVjdG9yKGJ1czogTWVzc2FnZUJ1cywgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplcikge1xuICAgIGJ1cy5pbml0Q2hhbm5lbChFVkVOVF9DSEFOTkVMKTtcbiAgICB2YXIgc291cmNlID0gYnVzLmZyb20oRVZFTlRfQ0hBTk5FTCk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKFxuICAgICAgICBzb3VyY2UsIChtZXNzYWdlKSA9PiB0aGlzLl9kaXNwYXRjaEV2ZW50KG5ldyBSZW5kZXJFdmVudERhdGEobWVzc2FnZSwgX3NlcmlhbGl6ZXIpKSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2Rpc3BhdGNoRXZlbnQoZXZlbnREYXRhOiBSZW5kZXJFdmVudERhdGEpOiB2b2lkIHtcbiAgICB2YXIgZGlzcGF0Y2hlciA9IHRoaXMuX2V2ZW50RGlzcGF0Y2hSZWdpc3RyeS5nZXQoZXZlbnREYXRhLnZpZXdSZWYpO1xuICAgIGV2ZW50RGF0YS5sb2NhbHNbJyRldmVudCddID0gZGVzZXJpYWxpemVHZW5lcmljRXZlbnQoZXZlbnREYXRhLmxvY2Fsc1snJGV2ZW50J10pO1xuICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2hSZW5kZXJFdmVudChldmVudERhdGEuZWxlbWVudEluZGV4LCBldmVudERhdGEuZXZlbnROYW1lLCBldmVudERhdGEubG9jYWxzKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRXZlbnREaXNwYXRjaGVyKHZpZXdSZWY6IFJlbmRlclZpZXdSZWYsIGRpc3BhdGNoZXI6IFJlbmRlckV2ZW50RGlzcGF0Y2hlcik6IHZvaWQge1xuICAgIHRoaXMuX2V2ZW50RGlzcGF0Y2hSZWdpc3RyeS5zZXQodmlld1JlZiwgZGlzcGF0Y2hlcik7XG4gIH1cbn1cblxuXG5jbGFzcyBSZW5kZXJFdmVudERhdGEge1xuICB2aWV3UmVmOiBSZW5kZXJWaWV3UmVmO1xuICBlbGVtZW50SW5kZXg6IG51bWJlcjtcbiAgZXZlbnROYW1lOiBzdHJpbmc7XG4gIGxvY2FsczogTWFwPHN0cmluZywgYW55PjtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiB7W2tleTogc3RyaW5nXTogYW55fSwgc2VyaWFsaXplcjogU2VyaWFsaXplcikge1xuICAgIHRoaXMudmlld1JlZiA9IHNlcmlhbGl6ZXIuZGVzZXJpYWxpemUobWVzc2FnZVsndmlld1JlZiddLCBSZW5kZXJWaWV3UmVmKTtcbiAgICB0aGlzLmVsZW1lbnRJbmRleCA9IG1lc3NhZ2VbJ2VsZW1lbnRJbmRleCddO1xuICAgIHRoaXMuZXZlbnROYW1lID0gbWVzc2FnZVsnZXZlbnROYW1lJ107XG4gICAgdGhpcy5sb2NhbHMgPSBNYXBXcmFwcGVyLmNyZWF0ZUZyb21TdHJpbmdNYXAobWVzc2FnZVsnbG9jYWxzJ10pO1xuICB9XG59XG4iXX0=