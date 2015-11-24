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
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { Serializer, PRIMITIVE } from 'angular2/src/web_workers/shared/serializer';
import { RenderViewRef, RenderFragmentRef, RenderProtoViewRef, Renderer, RenderComponentTemplate } from 'angular2/src/core/render/api';
import { WebWorkerElementRef, WebWorkerTemplateCmd } from 'angular2/src/web_workers/shared/api';
import { EVENT_CHANNEL, RENDERER_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { bind } from './bind';
import { EventDispatcher } from 'angular2/src/web_workers/ui/event_dispatcher';
import { RenderProtoViewRefStore } from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import { RenderViewWithFragmentsStore } from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import { ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
export let MessageBasedRenderer = class {
    constructor(_brokerFactory, _bus, _serializer, _renderProtoViewRefStore, _renderViewWithFragmentsStore, _renderer) {
        this._brokerFactory = _brokerFactory;
        this._bus = _bus;
        this._serializer = _serializer;
        this._renderProtoViewRefStore = _renderProtoViewRefStore;
        this._renderViewWithFragmentsStore = _renderViewWithFragmentsStore;
        this._renderer = _renderer;
    }
    start() {
        var broker = this._brokerFactory.createMessageBroker(RENDERER_CHANNEL);
        this._bus.initChannel(EVENT_CHANNEL);
        broker.registerMethod("registerComponentTemplate", [RenderComponentTemplate], bind(this._renderer.registerComponentTemplate, this._renderer));
        broker.registerMethod("createProtoView", [PRIMITIVE, WebWorkerTemplateCmd, PRIMITIVE], bind(this._createProtoView, this));
        broker.registerMethod("createRootHostView", [RenderProtoViewRef, PRIMITIVE, PRIMITIVE, PRIMITIVE], bind(this._createRootHostView, this));
        broker.registerMethod("createView", [RenderProtoViewRef, PRIMITIVE, PRIMITIVE], bind(this._createView, this));
        broker.registerMethod("destroyView", [RenderViewRef], bind(this._destroyView, this));
        broker.registerMethod("attachFragmentAfterFragment", [RenderFragmentRef, RenderFragmentRef], bind(this._renderer.attachFragmentAfterFragment, this._renderer));
        broker.registerMethod("attachFragmentAfterElement", [WebWorkerElementRef, RenderFragmentRef], bind(this._renderer.attachFragmentAfterElement, this._renderer));
        broker.registerMethod("detachFragment", [RenderFragmentRef], bind(this._renderer.detachFragment, this._renderer));
        broker.registerMethod("hydrateView", [RenderViewRef], bind(this._renderer.hydrateView, this._renderer));
        broker.registerMethod("dehydrateView", [RenderViewRef], bind(this._renderer.dehydrateView, this._renderer));
        broker.registerMethod("setText", [RenderViewRef, PRIMITIVE, PRIMITIVE], bind(this._renderer.setText, this._renderer));
        broker.registerMethod("setElementProperty", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE], bind(this._renderer.setElementProperty, this._renderer));
        broker.registerMethod("setElementAttribute", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE], bind(this._renderer.setElementAttribute, this._renderer));
        broker.registerMethod("setElementClass", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE], bind(this._renderer.setElementClass, this._renderer));
        broker.registerMethod("setElementStyle", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE], bind(this._renderer.setElementStyle, this._renderer));
        broker.registerMethod("invokeElementMethod", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE], bind(this._renderer.invokeElementMethod, this._renderer));
        broker.registerMethod("setEventDispatcher", [RenderViewRef], bind(this._setEventDispatcher, this));
    }
    _destroyView(viewRef) {
        this._renderer.destroyView(viewRef);
        this._renderViewWithFragmentsStore.remove(viewRef);
    }
    _createProtoView(componentTemplateId, cmds, refIndex) {
        var protoViewRef = this._renderer.createProtoView(componentTemplateId, cmds);
        this._renderProtoViewRefStore.store(protoViewRef, refIndex);
    }
    _createRootHostView(ref, fragmentCount, selector, startIndex) {
        var renderViewWithFragments = this._renderer.createRootHostView(ref, fragmentCount, selector);
        this._renderViewWithFragmentsStore.store(renderViewWithFragments, startIndex);
    }
    _createView(ref, fragmentCount, startIndex) {
        var renderViewWithFragments = this._renderer.createView(ref, fragmentCount);
        this._renderViewWithFragmentsStore.store(renderViewWithFragments, startIndex);
    }
    _setEventDispatcher(viewRef) {
        var dispatcher = new EventDispatcher(viewRef, this._bus.to(EVENT_CHANNEL), this._serializer);
        this._renderer.setEventDispatcher(viewRef, dispatcher);
    }
};
MessageBasedRenderer = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ServiceMessageBrokerFactory, MessageBus, Serializer, RenderProtoViewRefStore, RenderViewWithFragmentsStore, Renderer])
], MessageBasedRenderer);
//# sourceMappingURL=renderer.js.map