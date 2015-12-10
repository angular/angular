'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy93b3JrZXIvZXZlbnRfZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6WyJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIuX2Rpc3BhdGNoRXZlbnQiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIucmVnaXN0ZXJFdmVudERpc3BhdGNoZXIiLCJSZW5kZXJFdmVudERhdGEiLCJSZW5kZXJFdmVudERhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELDJCQUE4QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9ELG9CQUFtRCw4QkFBOEIsQ0FBQyxDQUFBO0FBQ2xGLDJCQUF5Qiw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ3RFLDhCQUE0QiwrQ0FBK0MsQ0FBQyxDQUFBO0FBQzVFLDRCQUF5Qiw2Q0FBNkMsQ0FBQyxDQUFBO0FBQ3ZFLHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBQzFFLG1DQUFzQyxzQkFBc0IsQ0FBQyxDQUFBO0FBRTdEO0lBS0VBLGtDQUFZQSxHQUFlQSxFQUFVQSxXQUF1QkE7UUFMOURDLGlCQXNCQ0E7UUFqQnNDQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7UUFIcERBLDJCQUFzQkEsR0FDMUJBLElBQUlBLGdCQUFHQSxFQUF3Q0EsQ0FBQ0E7UUFHbERBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLDZCQUFhQSxDQUFDQSxDQUFDQTtRQUMvQkEsSUFBSUEsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsNkJBQWFBLENBQUNBLENBQUNBO1FBQ3JDQSx5QkFBaUJBLENBQUNBLFNBQVNBLENBQ3ZCQSxNQUFNQSxFQUFFQSxVQUFDQSxPQUFPQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxPQUFPQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQSxFQUE5REEsQ0FBOERBLENBQUNBLENBQUNBO0lBQzNGQSxDQUFDQTtJQUdPRCxpREFBY0EsR0FBdEJBLFVBQXVCQSxTQUEwQkE7UUFDL0NFLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDcEVBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLDRDQUF1QkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakZBLFVBQVVBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsRUFBRUEsU0FBU0EsQ0FBQ0EsU0FBU0EsRUFBRUEsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDaEdBLENBQUNBO0lBRURGLDBEQUF1QkEsR0FBdkJBLFVBQXdCQSxPQUFzQkEsRUFBRUEsVUFBaUNBO1FBQy9FRyxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO0lBQ3ZEQSxDQUFDQTtJQXJCSEg7UUFBQ0EsZUFBVUEsRUFBRUE7O2lDQXNCWkE7SUFBREEsK0JBQUNBO0FBQURBLENBQUNBLEFBdEJELElBc0JDO0FBckJZLGdDQUF3QiwyQkFxQnBDLENBQUE7QUFHRDtJQU1FSSx5QkFBWUEsT0FBNkJBLEVBQUVBLFVBQXNCQTtRQUMvREMsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsVUFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsbUJBQWFBLENBQUNBLENBQUNBO1FBQ3pFQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxPQUFPQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUM1Q0EsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDdENBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLHVCQUFVQSxDQUFDQSxtQkFBbUJBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtJQUNIRCxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFaRCxJQVlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UmVuZGVyVmlld1JlZiwgUmVuZGVyRXZlbnREaXNwYXRjaGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7U2VyaWFsaXplcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7RVZFTlRfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtkZXNlcmlhbGl6ZUdlbmVyaWNFdmVudH0gZnJvbSAnLi9ldmVudF9kZXNlcmlhbGl6ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyRXZlbnREaXNwYXRjaGVyIHtcbiAgcHJpdmF0ZSBfZXZlbnREaXNwYXRjaFJlZ2lzdHJ5OiBNYXA8UmVuZGVyVmlld1JlZiwgUmVuZGVyRXZlbnREaXNwYXRjaGVyPiA9XG4gICAgICBuZXcgTWFwPFJlbmRlclZpZXdSZWYsIFJlbmRlckV2ZW50RGlzcGF0Y2hlcj4oKTtcblxuICBjb25zdHJ1Y3RvcihidXM6IE1lc3NhZ2VCdXMsIHByaXZhdGUgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICBidXMuaW5pdENoYW5uZWwoRVZFTlRfQ0hBTk5FTCk7XG4gICAgdmFyIHNvdXJjZSA9IGJ1cy5mcm9tKEVWRU5UX0NIQU5ORUwpO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShcbiAgICAgICAgc291cmNlLCAobWVzc2FnZSkgPT4gdGhpcy5fZGlzcGF0Y2hFdmVudChuZXcgUmVuZGVyRXZlbnREYXRhKG1lc3NhZ2UsIF9zZXJpYWxpemVyKSkpO1xuICB9XG5cblxuICBwcml2YXRlIF9kaXNwYXRjaEV2ZW50KGV2ZW50RGF0YTogUmVuZGVyRXZlbnREYXRhKTogdm9pZCB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSB0aGlzLl9ldmVudERpc3BhdGNoUmVnaXN0cnkuZ2V0KGV2ZW50RGF0YS52aWV3UmVmKTtcbiAgICBldmVudERhdGEubG9jYWxzWyckZXZlbnQnXSA9IGRlc2VyaWFsaXplR2VuZXJpY0V2ZW50KGV2ZW50RGF0YS5sb2NhbHNbJyRldmVudCddKTtcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoUmVuZGVyRXZlbnQoZXZlbnREYXRhLmVsZW1lbnRJbmRleCwgZXZlbnREYXRhLmV2ZW50TmFtZSwgZXZlbnREYXRhLmxvY2Fscyk7XG4gIH1cblxuICByZWdpc3RlckV2ZW50RGlzcGF0Y2hlcih2aWV3UmVmOiBSZW5kZXJWaWV3UmVmLCBkaXNwYXRjaGVyOiBSZW5kZXJFdmVudERpc3BhdGNoZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9ldmVudERpc3BhdGNoUmVnaXN0cnkuc2V0KHZpZXdSZWYsIGRpc3BhdGNoZXIpO1xuICB9XG59XG5cblxuY2xhc3MgUmVuZGVyRXZlbnREYXRhIHtcbiAgdmlld1JlZjogUmVuZGVyVmlld1JlZjtcbiAgZWxlbWVudEluZGV4OiBudW1iZXI7XG4gIGV2ZW50TmFtZTogc3RyaW5nO1xuICBsb2NhbHM6IE1hcDxzdHJpbmcsIGFueT47XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZToge1trZXk6IHN0cmluZ106IGFueX0sIHNlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICB0aGlzLnZpZXdSZWYgPSBzZXJpYWxpemVyLmRlc2VyaWFsaXplKG1lc3NhZ2VbJ3ZpZXdSZWYnXSwgUmVuZGVyVmlld1JlZik7XG4gICAgdGhpcy5lbGVtZW50SW5kZXggPSBtZXNzYWdlWydlbGVtZW50SW5kZXgnXTtcbiAgICB0aGlzLmV2ZW50TmFtZSA9IG1lc3NhZ2VbJ2V2ZW50TmFtZSddO1xuICAgIHRoaXMubG9jYWxzID0gTWFwV3JhcHBlci5jcmVhdGVGcm9tU3RyaW5nTWFwKG1lc3NhZ2VbJ2xvY2FscyddKTtcbiAgfVxufVxuIl19