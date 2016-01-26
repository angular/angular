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
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { Serializer, PRIMITIVE, RenderStoreObject } from 'angular2/src/web_workers/shared/serializer';
import { RootRenderer, RenderComponentType } from 'angular2/src/core/render/api';
import { EVENT_CHANNEL, RENDERER_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { bind } from './bind';
import { EventDispatcher } from 'angular2/src/web_workers/ui/event_dispatcher';
import { RenderStore } from 'angular2/src/web_workers/shared/render_store';
import { ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
export let MessageBasedRenderer = class {
    constructor(_brokerFactory, _bus, _serializer, _renderStore, _rootRenderer) {
        this._brokerFactory = _brokerFactory;
        this._bus = _bus;
        this._serializer = _serializer;
        this._renderStore = _renderStore;
        this._rootRenderer = _rootRenderer;
    }
    start() {
        var broker = this._brokerFactory.createMessageBroker(RENDERER_CHANNEL);
        this._bus.initChannel(EVENT_CHANNEL);
        this._eventDispatcher = new EventDispatcher(this._bus.to(EVENT_CHANNEL), this._serializer);
        broker.registerMethod("renderComponent", [RenderComponentType, PRIMITIVE], bind(this._renderComponent, this));
        broker.registerMethod("selectRootElement", [RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._selectRootElement, this));
        broker.registerMethod("createElement", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._createElement, this));
        broker.registerMethod("createViewRoot", [RenderStoreObject, RenderStoreObject, PRIMITIVE], bind(this._createViewRoot, this));
        broker.registerMethod("createTemplateAnchor", [RenderStoreObject, RenderStoreObject, PRIMITIVE], bind(this._createTemplateAnchor, this));
        broker.registerMethod("createText", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._createText, this));
        broker.registerMethod("projectNodes", [RenderStoreObject, RenderStoreObject, RenderStoreObject], bind(this._projectNodes, this));
        broker.registerMethod("attachViewAfter", [RenderStoreObject, RenderStoreObject, RenderStoreObject], bind(this._attachViewAfter, this));
        broker.registerMethod("detachView", [RenderStoreObject, RenderStoreObject], bind(this._detachView, this));
        broker.registerMethod("destroyView", [RenderStoreObject, RenderStoreObject, RenderStoreObject], bind(this._destroyView, this));
        broker.registerMethod("setElementProperty", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._setElementProperty, this));
        broker.registerMethod("setElementAttribute", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._setElementAttribute, this));
        broker.registerMethod("setBindingDebugInfo", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._setBindingDebugInfo, this));
        broker.registerMethod("setElementClass", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._setElementClass, this));
        broker.registerMethod("setElementStyle", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._setElementStyle, this));
        broker.registerMethod("invokeElementMethod", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._invokeElementMethod, this));
        broker.registerMethod("setText", [RenderStoreObject, RenderStoreObject, PRIMITIVE], bind(this._setText, this));
        broker.registerMethod("listen", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE], bind(this._listen, this));
        broker.registerMethod("listenGlobal", [RenderStoreObject, PRIMITIVE, PRIMITIVE, PRIMITIVE], bind(this._listenGlobal, this));
        broker.registerMethod("listenDone", [RenderStoreObject, RenderStoreObject], bind(this._listenDone, this));
    }
    _renderComponent(renderComponentType, rendererId) {
        var renderer = this._rootRenderer.renderComponent(renderComponentType);
        this._renderStore.store(renderer, rendererId);
    }
    _selectRootElement(renderer, selector, elId) {
        this._renderStore.store(renderer.selectRootElement(selector), elId);
    }
    _createElement(renderer, parentElement, name, elId) {
        this._renderStore.store(renderer.createElement(parentElement, name), elId);
    }
    _createViewRoot(renderer, hostElement, elId) {
        var viewRoot = renderer.createViewRoot(hostElement);
        if (this._renderStore.serialize(hostElement) !== elId) {
            this._renderStore.store(viewRoot, elId);
        }
    }
    _createTemplateAnchor(renderer, parentElement, elId) {
        this._renderStore.store(renderer.createTemplateAnchor(parentElement), elId);
    }
    _createText(renderer, parentElement, value, elId) {
        this._renderStore.store(renderer.createText(parentElement, value), elId);
    }
    _projectNodes(renderer, parentElement, nodes) {
        renderer.projectNodes(parentElement, nodes);
    }
    _attachViewAfter(renderer, node, viewRootNodes) {
        renderer.attachViewAfter(node, viewRootNodes);
    }
    _detachView(renderer, viewRootNodes) {
        renderer.detachView(viewRootNodes);
    }
    _destroyView(renderer, hostElement, viewAllNodes) {
        renderer.destroyView(hostElement, viewAllNodes);
        for (var i = 0; i < viewAllNodes.length; i++) {
            this._renderStore.remove(viewAllNodes[i]);
        }
    }
    _setElementProperty(renderer, renderElement, propertyName, propertyValue) {
        renderer.setElementProperty(renderElement, propertyName, propertyValue);
    }
    _setElementAttribute(renderer, renderElement, attributeName, attributeValue) {
        renderer.setElementAttribute(renderElement, attributeName, attributeValue);
    }
    _setBindingDebugInfo(renderer, renderElement, propertyName, propertyValue) {
        renderer.setBindingDebugInfo(renderElement, propertyName, propertyValue);
    }
    _setElementClass(renderer, renderElement, className, isAdd) {
        renderer.setElementClass(renderElement, className, isAdd);
    }
    _setElementStyle(renderer, renderElement, styleName, styleValue) {
        renderer.setElementStyle(renderElement, styleName, styleValue);
    }
    _invokeElementMethod(renderer, renderElement, methodName, args) {
        renderer.invokeElementMethod(renderElement, methodName, args);
    }
    _setText(renderer, renderNode, text) {
        renderer.setText(renderNode, text);
    }
    _listen(renderer, renderElement, eventName, unlistenId) {
        var unregisterCallback = renderer.listen(renderElement, eventName, (event) => this._eventDispatcher.dispatchRenderEvent(renderElement, null, eventName, event));
        this._renderStore.store(unregisterCallback, unlistenId);
    }
    _listenGlobal(renderer, eventTarget, eventName, unlistenId) {
        var unregisterCallback = renderer.listenGlobal(eventTarget, eventName, (event) => this._eventDispatcher.dispatchRenderEvent(null, eventTarget, eventName, event));
        this._renderStore.store(unregisterCallback, unlistenId);
    }
    _listenDone(renderer, unlistenCallback) { unlistenCallback(); }
};
MessageBasedRenderer = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ServiceMessageBrokerFactory, MessageBus, Serializer, RenderStore, RootRenderer])
], MessageBasedRenderer);
