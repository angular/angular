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
import { Injectable } from 'angular2/src/core/di';
import { Map, MapWrapper } from 'angular2/src/facade/collection';
import { RenderViewRef } from 'angular2/src/core/render/api';
import { Serializer } from 'angular2/src/web_workers/shared/serializer';
import { EVENT_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { deserializeGenericEvent } from './event_deserializer';
export let WebWorkerEventDispatcher = class {
    constructor(bus, _serializer) {
        this._serializer = _serializer;
        this._eventDispatchRegistry = new Map();
        bus.initChannel(EVENT_CHANNEL);
        var source = bus.from(EVENT_CHANNEL);
        ObservableWrapper.subscribe(source, (message) => this._dispatchEvent(new RenderEventData(message, _serializer)));
    }
    _dispatchEvent(eventData) {
        var dispatcher = this._eventDispatchRegistry.get(eventData.viewRef);
        eventData.locals['$event'] = deserializeGenericEvent(eventData.locals['$event']);
        dispatcher.dispatchRenderEvent(eventData.elementIndex, eventData.eventName, eventData.locals);
    }
    registerEventDispatcher(viewRef, dispatcher) {
        this._eventDispatchRegistry.set(viewRef, dispatcher);
    }
};
WebWorkerEventDispatcher = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [MessageBus, Serializer])
], WebWorkerEventDispatcher);
class RenderEventData {
    constructor(message, serializer) {
        this.viewRef = serializer.deserialize(message['viewRef'], RenderViewRef);
        this.elementIndex = message['elementIndex'];
        this.eventName = message['eventName'];
        this.locals = MapWrapper.createFromStringMap(message['locals']);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy93b3JrZXIvZXZlbnRfZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6WyJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIuX2Rpc3BhdGNoRXZlbnQiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIucmVnaXN0ZXJFdmVudERpc3BhdGNoZXIiLCJSZW5kZXJFdmVudERhdGEiLCJSZW5kZXJFdmVudERhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3ZELEVBQUMsYUFBYSxFQUF3QixNQUFNLDhCQUE4QjtPQUMxRSxFQUFDLFVBQVUsRUFBQyxNQUFNLDRDQUE0QztPQUM5RCxFQUFDLGFBQWEsRUFBQyxNQUFNLCtDQUErQztPQUNwRSxFQUFDLFVBQVUsRUFBQyxNQUFNLDZDQUE2QztPQUMvRCxFQUFlLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ2xFLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxzQkFBc0I7QUFFNUQ7SUFLRUEsWUFBWUEsR0FBZUEsRUFBVUEsV0FBdUJBO1FBQXZCQyxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7UUFIcERBLDJCQUFzQkEsR0FDMUJBLElBQUlBLEdBQUdBLEVBQXdDQSxDQUFDQTtRQUdsREEsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLElBQUlBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ3JDQSxpQkFBaUJBLENBQUNBLFNBQVNBLENBQ3ZCQSxNQUFNQSxFQUFFQSxDQUFDQSxPQUFPQSxLQUFLQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxPQUFPQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMzRkEsQ0FBQ0E7SUFHT0QsY0FBY0EsQ0FBQ0EsU0FBMEJBO1FBQy9DRSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3BFQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSx1QkFBdUJBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1FBQ2pGQSxVQUFVQSxDQUFDQSxtQkFBbUJBLENBQUNBLFNBQVNBLENBQUNBLFlBQVlBLEVBQUVBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ2hHQSxDQUFDQTtJQUVERix1QkFBdUJBLENBQUNBLE9BQXNCQSxFQUFFQSxVQUFpQ0E7UUFDL0VHLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0FBQ0hILENBQUNBO0FBdEJEO0lBQUMsVUFBVSxFQUFFOzs2QkFzQlo7QUFHRDtJQU1FSSxZQUFZQSxPQUE2QkEsRUFBRUEsVUFBc0JBO1FBQy9EQyxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxVQUFVQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUN6RUEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsT0FBT0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQ3RDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxVQUFVQSxDQUFDQSxtQkFBbUJBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UmVuZGVyVmlld1JlZiwgUmVuZGVyRXZlbnREaXNwYXRjaGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7U2VyaWFsaXplcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7RVZFTlRfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtkZXNlcmlhbGl6ZUdlbmVyaWNFdmVudH0gZnJvbSAnLi9ldmVudF9kZXNlcmlhbGl6ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyRXZlbnREaXNwYXRjaGVyIHtcbiAgcHJpdmF0ZSBfZXZlbnREaXNwYXRjaFJlZ2lzdHJ5OiBNYXA8UmVuZGVyVmlld1JlZiwgUmVuZGVyRXZlbnREaXNwYXRjaGVyPiA9XG4gICAgICBuZXcgTWFwPFJlbmRlclZpZXdSZWYsIFJlbmRlckV2ZW50RGlzcGF0Y2hlcj4oKTtcblxuICBjb25zdHJ1Y3RvcihidXM6IE1lc3NhZ2VCdXMsIHByaXZhdGUgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICBidXMuaW5pdENoYW5uZWwoRVZFTlRfQ0hBTk5FTCk7XG4gICAgdmFyIHNvdXJjZSA9IGJ1cy5mcm9tKEVWRU5UX0NIQU5ORUwpO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShcbiAgICAgICAgc291cmNlLCAobWVzc2FnZSkgPT4gdGhpcy5fZGlzcGF0Y2hFdmVudChuZXcgUmVuZGVyRXZlbnREYXRhKG1lc3NhZ2UsIF9zZXJpYWxpemVyKSkpO1xuICB9XG5cblxuICBwcml2YXRlIF9kaXNwYXRjaEV2ZW50KGV2ZW50RGF0YTogUmVuZGVyRXZlbnREYXRhKTogdm9pZCB7XG4gICAgdmFyIGRpc3BhdGNoZXIgPSB0aGlzLl9ldmVudERpc3BhdGNoUmVnaXN0cnkuZ2V0KGV2ZW50RGF0YS52aWV3UmVmKTtcbiAgICBldmVudERhdGEubG9jYWxzWyckZXZlbnQnXSA9IGRlc2VyaWFsaXplR2VuZXJpY0V2ZW50KGV2ZW50RGF0YS5sb2NhbHNbJyRldmVudCddKTtcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoUmVuZGVyRXZlbnQoZXZlbnREYXRhLmVsZW1lbnRJbmRleCwgZXZlbnREYXRhLmV2ZW50TmFtZSwgZXZlbnREYXRhLmxvY2Fscyk7XG4gIH1cblxuICByZWdpc3RlckV2ZW50RGlzcGF0Y2hlcih2aWV3UmVmOiBSZW5kZXJWaWV3UmVmLCBkaXNwYXRjaGVyOiBSZW5kZXJFdmVudERpc3BhdGNoZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9ldmVudERpc3BhdGNoUmVnaXN0cnkuc2V0KHZpZXdSZWYsIGRpc3BhdGNoZXIpO1xuICB9XG59XG5cblxuY2xhc3MgUmVuZGVyRXZlbnREYXRhIHtcbiAgdmlld1JlZjogUmVuZGVyVmlld1JlZjtcbiAgZWxlbWVudEluZGV4OiBudW1iZXI7XG4gIGV2ZW50TmFtZTogc3RyaW5nO1xuICBsb2NhbHM6IE1hcDxzdHJpbmcsIGFueT47XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZToge1trZXk6IHN0cmluZ106IGFueX0sIHNlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICB0aGlzLnZpZXdSZWYgPSBzZXJpYWxpemVyLmRlc2VyaWFsaXplKG1lc3NhZ2VbJ3ZpZXdSZWYnXSwgUmVuZGVyVmlld1JlZik7XG4gICAgdGhpcy5lbGVtZW50SW5kZXggPSBtZXNzYWdlWydlbGVtZW50SW5kZXgnXTtcbiAgICB0aGlzLmV2ZW50TmFtZSA9IG1lc3NhZ2VbJ2V2ZW50TmFtZSddO1xuICAgIHRoaXMubG9jYWxzID0gTWFwV3JhcHBlci5jcmVhdGVGcm9tU3RyaW5nTWFwKG1lc3NhZ2VbJ2xvY2FscyddKTtcbiAgfVxufVxuIl19