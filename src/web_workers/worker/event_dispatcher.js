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
//# sourceMappingURL=event_dispatcher.js.map