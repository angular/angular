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
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var api_1 = require('angular2/src/core/render/api');
var api_2 = require('angular2/src/web_workers/shared/api');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var bind_1 = require('./bind');
var event_dispatcher_1 = require('angular2/src/web_workers/ui/event_dispatcher');
var render_proto_view_ref_store_1 = require('angular2/src/web_workers/shared/render_proto_view_ref_store');
var render_view_with_fragments_store_1 = require('angular2/src/web_workers/shared/render_view_with_fragments_store');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
var MessageBasedRenderer = (function () {
    function MessageBasedRenderer(_brokerFactory, _bus, _serializer, _renderProtoViewRefStore, _renderViewWithFragmentsStore, _renderer) {
        this._brokerFactory = _brokerFactory;
        this._bus = _bus;
        this._serializer = _serializer;
        this._renderProtoViewRefStore = _renderProtoViewRefStore;
        this._renderViewWithFragmentsStore = _renderViewWithFragmentsStore;
        this._renderer = _renderer;
    }
    MessageBasedRenderer.prototype.start = function () {
        var broker = this._brokerFactory.createMessageBroker(messaging_api_1.RENDERER_CHANNEL);
        this._bus.initChannel(messaging_api_1.EVENT_CHANNEL);
        broker.registerMethod("registerComponentTemplate", [api_1.RenderComponentTemplate], bind_1.bind(this._renderer.registerComponentTemplate, this._renderer));
        broker.registerMethod("createProtoView", [serializer_1.PRIMITIVE, api_2.WebWorkerTemplateCmd, serializer_1.PRIMITIVE], bind_1.bind(this._createProtoView, this));
        broker.registerMethod("createRootHostView", [api_1.RenderProtoViewRef, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], bind_1.bind(this._createRootHostView, this));
        broker.registerMethod("createView", [api_1.RenderProtoViewRef, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], bind_1.bind(this._createView, this));
        broker.registerMethod("destroyView", [api_1.RenderViewRef], bind_1.bind(this._destroyView, this));
        broker.registerMethod("attachFragmentAfterFragment", [api_1.RenderFragmentRef, api_1.RenderFragmentRef], bind_1.bind(this._renderer.attachFragmentAfterFragment, this._renderer));
        broker.registerMethod("attachFragmentAfterElement", [api_2.WebWorkerElementRef, api_1.RenderFragmentRef], bind_1.bind(this._renderer.attachFragmentAfterElement, this._renderer));
        broker.registerMethod("detachFragment", [api_1.RenderFragmentRef], bind_1.bind(this._renderer.detachFragment, this._renderer));
        broker.registerMethod("hydrateView", [api_1.RenderViewRef], bind_1.bind(this._renderer.hydrateView, this._renderer));
        broker.registerMethod("dehydrateView", [api_1.RenderViewRef], bind_1.bind(this._renderer.dehydrateView, this._renderer));
        broker.registerMethod("setText", [api_1.RenderViewRef, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], bind_1.bind(this._renderer.setText, this._renderer));
        broker.registerMethod("setElementProperty", [api_2.WebWorkerElementRef, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], bind_1.bind(this._renderer.setElementProperty, this._renderer));
        broker.registerMethod("setElementAttribute", [api_2.WebWorkerElementRef, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], bind_1.bind(this._renderer.setElementAttribute, this._renderer));
        broker.registerMethod("setElementClass", [api_2.WebWorkerElementRef, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], bind_1.bind(this._renderer.setElementClass, this._renderer));
        broker.registerMethod("setElementStyle", [api_2.WebWorkerElementRef, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], bind_1.bind(this._renderer.setElementStyle, this._renderer));
        broker.registerMethod("invokeElementMethod", [api_2.WebWorkerElementRef, serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], bind_1.bind(this._renderer.invokeElementMethod, this._renderer));
        broker.registerMethod("setEventDispatcher", [api_1.RenderViewRef], bind_1.bind(this._setEventDispatcher, this));
    };
    MessageBasedRenderer.prototype._destroyView = function (viewRef) {
        this._renderer.destroyView(viewRef);
        this._renderViewWithFragmentsStore.remove(viewRef);
    };
    MessageBasedRenderer.prototype._createProtoView = function (componentTemplateId, cmds, refIndex) {
        var protoViewRef = this._renderer.createProtoView(componentTemplateId, cmds);
        this._renderProtoViewRefStore.store(protoViewRef, refIndex);
    };
    MessageBasedRenderer.prototype._createRootHostView = function (ref, fragmentCount, selector, startIndex) {
        var renderViewWithFragments = this._renderer.createRootHostView(ref, fragmentCount, selector);
        this._renderViewWithFragmentsStore.store(renderViewWithFragments, startIndex);
    };
    MessageBasedRenderer.prototype._createView = function (ref, fragmentCount, startIndex) {
        var renderViewWithFragments = this._renderer.createView(ref, fragmentCount);
        this._renderViewWithFragmentsStore.store(renderViewWithFragments, startIndex);
    };
    MessageBasedRenderer.prototype._setEventDispatcher = function (viewRef) {
        var dispatcher = new event_dispatcher_1.EventDispatcher(viewRef, this._bus.to(messaging_api_1.EVENT_CHANNEL), this._serializer);
        this._renderer.setEventDispatcher(viewRef, dispatcher);
    };
    MessageBasedRenderer = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [service_message_broker_1.ServiceMessageBrokerFactory, message_bus_1.MessageBus, serializer_1.Serializer, render_proto_view_ref_store_1.RenderProtoViewRefStore, render_view_with_fragments_store_1.RenderViewWithFragmentsStore, api_1.Renderer])
    ], MessageBasedRenderer);
    return MessageBasedRenderer;
})();
exports.MessageBasedRenderer = MessageBasedRenderer;
//# sourceMappingURL=renderer.js.map