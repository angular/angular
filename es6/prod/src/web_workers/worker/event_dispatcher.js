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
//# sourceMappingURL=event_dispatcher.js.map