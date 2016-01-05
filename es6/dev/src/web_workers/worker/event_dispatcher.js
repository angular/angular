var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZGlzcGF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy93b3JrZXIvZXZlbnRfZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6WyJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIuX2Rpc3BhdGNoRXZlbnQiLCJXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIucmVnaXN0ZXJFdmVudERpc3BhdGNoZXIiLCJSZW5kZXJFdmVudERhdGEiLCJSZW5kZXJFdmVudERhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxNQUFNLGdDQUFnQztPQUN2RCxFQUFDLGFBQWEsRUFBd0IsTUFBTSw4QkFBOEI7T0FDMUUsRUFBQyxVQUFVLEVBQUMsTUFBTSw0Q0FBNEM7T0FDOUQsRUFBQyxhQUFhLEVBQUMsTUFBTSwrQ0FBK0M7T0FDcEUsRUFBQyxVQUFVLEVBQUMsTUFBTSw2Q0FBNkM7T0FDL0QsRUFBZSxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtPQUNsRSxFQUFDLHVCQUF1QixFQUFDLE1BQU0sc0JBQXNCO0FBRTVEO0lBS0VBLFlBQVlBLEdBQWVBLEVBQVVBLFdBQXVCQTtRQUF2QkMsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO1FBSHBEQSwyQkFBc0JBLEdBQzFCQSxJQUFJQSxHQUFHQSxFQUF3Q0EsQ0FBQ0E7UUFHbERBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQy9CQSxJQUFJQSxNQUFNQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUNyQ0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUN2QkEsTUFBTUEsRUFBRUEsQ0FBQ0EsT0FBT0EsS0FBS0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDM0ZBLENBQUNBO0lBR09ELGNBQWNBLENBQUNBLFNBQTBCQTtRQUMvQ0UsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNwRUEsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsdUJBQXVCQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRkEsVUFBVUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxFQUFFQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUNoR0EsQ0FBQ0E7SUFFREYsdUJBQXVCQSxDQUFDQSxPQUFzQkEsRUFBRUEsVUFBaUNBO1FBQy9FRyxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO0lBQ3ZEQSxDQUFDQTtBQUNISCxDQUFDQTtBQXRCRDtJQUFDLFVBQVUsRUFBRTs7NkJBc0JaO0FBR0Q7SUFNRUksWUFBWUEsT0FBNkJBLEVBQUVBLFVBQXNCQTtRQUMvREMsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsVUFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDekVBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLE9BQU9BLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO1FBQzVDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUN0Q0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsVUFBVUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNsRUEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1JlbmRlclZpZXdSZWYsIFJlbmRlckV2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5pbXBvcnQge0VWRU5UX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7ZGVzZXJpYWxpemVHZW5lcmljRXZlbnR9IGZyb20gJy4vZXZlbnRfZGVzZXJpYWxpemVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlckV2ZW50RGlzcGF0Y2hlciB7XG4gIHByaXZhdGUgX2V2ZW50RGlzcGF0Y2hSZWdpc3RyeTogTWFwPFJlbmRlclZpZXdSZWYsIFJlbmRlckV2ZW50RGlzcGF0Y2hlcj4gPVxuICAgICAgbmV3IE1hcDxSZW5kZXJWaWV3UmVmLCBSZW5kZXJFdmVudERpc3BhdGNoZXI+KCk7XG5cbiAgY29uc3RydWN0b3IoYnVzOiBNZXNzYWdlQnVzLCBwcml2YXRlIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyKSB7XG4gICAgYnVzLmluaXRDaGFubmVsKEVWRU5UX0NIQU5ORUwpO1xuICAgIHZhciBzb3VyY2UgPSBidXMuZnJvbShFVkVOVF9DSEFOTkVMKTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoXG4gICAgICAgIHNvdXJjZSwgKG1lc3NhZ2UpID0+IHRoaXMuX2Rpc3BhdGNoRXZlbnQobmV3IFJlbmRlckV2ZW50RGF0YShtZXNzYWdlLCBfc2VyaWFsaXplcikpKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfZGlzcGF0Y2hFdmVudChldmVudERhdGE6IFJlbmRlckV2ZW50RGF0YSk6IHZvaWQge1xuICAgIHZhciBkaXNwYXRjaGVyID0gdGhpcy5fZXZlbnREaXNwYXRjaFJlZ2lzdHJ5LmdldChldmVudERhdGEudmlld1JlZik7XG4gICAgZXZlbnREYXRhLmxvY2Fsc1snJGV2ZW50J10gPSBkZXNlcmlhbGl6ZUdlbmVyaWNFdmVudChldmVudERhdGEubG9jYWxzWyckZXZlbnQnXSk7XG4gICAgZGlzcGF0Y2hlci5kaXNwYXRjaFJlbmRlckV2ZW50KGV2ZW50RGF0YS5lbGVtZW50SW5kZXgsIGV2ZW50RGF0YS5ldmVudE5hbWUsIGV2ZW50RGF0YS5sb2NhbHMpO1xuICB9XG5cbiAgcmVnaXN0ZXJFdmVudERpc3BhdGNoZXIodmlld1JlZjogUmVuZGVyVmlld1JlZiwgZGlzcGF0Y2hlcjogUmVuZGVyRXZlbnREaXNwYXRjaGVyKTogdm9pZCB7XG4gICAgdGhpcy5fZXZlbnREaXNwYXRjaFJlZ2lzdHJ5LnNldCh2aWV3UmVmLCBkaXNwYXRjaGVyKTtcbiAgfVxufVxuXG5cbmNsYXNzIFJlbmRlckV2ZW50RGF0YSB7XG4gIHZpZXdSZWY6IFJlbmRlclZpZXdSZWY7XG4gIGVsZW1lbnRJbmRleDogbnVtYmVyO1xuICBldmVudE5hbWU6IHN0cmluZztcbiAgbG9jYWxzOiBNYXA8c3RyaW5nLCBhbnk+O1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBzZXJpYWxpemVyOiBTZXJpYWxpemVyKSB7XG4gICAgdGhpcy52aWV3UmVmID0gc2VyaWFsaXplci5kZXNlcmlhbGl6ZShtZXNzYWdlWyd2aWV3UmVmJ10sIFJlbmRlclZpZXdSZWYpO1xuICAgIHRoaXMuZWxlbWVudEluZGV4ID0gbWVzc2FnZVsnZWxlbWVudEluZGV4J107XG4gICAgdGhpcy5ldmVudE5hbWUgPSBtZXNzYWdlWydldmVudE5hbWUnXTtcbiAgICB0aGlzLmxvY2FscyA9IE1hcFdyYXBwZXIuY3JlYXRlRnJvbVN0cmluZ01hcChtZXNzYWdlWydsb2NhbHMnXSk7XG4gIH1cbn1cbiJdfQ==