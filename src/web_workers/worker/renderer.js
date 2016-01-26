'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var api_1 = require('angular2/src/core/render/api');
var client_message_broker_1 = require("angular2/src/web_workers/shared/client_message_broker");
var lang_1 = require("angular2/src/facade/lang");
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require("angular2/src/core/di");
var render_store_1 = require('angular2/src/web_workers/shared/render_store');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var messaging_api_2 = require('angular2/src/web_workers/shared/messaging_api');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var async_1 = require('angular2/src/facade/async');
var view_1 = require('angular2/src/core/metadata/view');
var event_deserializer_1 = require('./event_deserializer');
var WebWorkerRootRenderer = (function () {
    function WebWorkerRootRenderer(messageBrokerFactory, bus, _serializer, _renderStore) {
        var _this = this;
        this._serializer = _serializer;
        this._renderStore = _renderStore;
        this.globalEvents = new NamedEventEmitter();
        this._componentRenderers = new Map();
        this._messageBroker = messageBrokerFactory.createMessageBroker(messaging_api_1.RENDERER_CHANNEL);
        bus.initChannel(messaging_api_2.EVENT_CHANNEL);
        var source = bus.from(messaging_api_2.EVENT_CHANNEL);
        async_1.ObservableWrapper.subscribe(source, function (message) { return _this._dispatchEvent(message); });
    }
    WebWorkerRootRenderer.prototype._dispatchEvent = function (message) {
        var eventName = message['eventName'];
        var target = message['eventTarget'];
        var event = event_deserializer_1.deserializeGenericEvent(message['event']);
        if (lang_1.isPresent(target)) {
            this.globalEvents.dispatchEvent(eventNameWithTarget(target, eventName), event);
        }
        else {
            var element = this._serializer.deserialize(message['element'], serializer_1.RenderStoreObject);
            element.events.dispatchEvent(eventName, event);
        }
    };
    WebWorkerRootRenderer.prototype.renderComponent = function (componentType) {
        var result = this._componentRenderers.get(componentType.id);
        if (lang_1.isBlank(result)) {
            result = new WebWorkerRenderer(this, componentType);
            this._componentRenderers.set(componentType.id, result);
            var id = this._renderStore.allocateId();
            this._renderStore.store(result, id);
            this.runOnService('renderComponent', [
                new client_message_broker_1.FnArg(componentType, api_1.RenderComponentType),
                new client_message_broker_1.FnArg(result, serializer_1.RenderStoreObject),
            ]);
        }
        return result;
    };
    WebWorkerRootRenderer.prototype.runOnService = function (fnName, fnArgs) {
        var args = new client_message_broker_1.UiArguments(fnName, fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    WebWorkerRootRenderer.prototype.allocateNode = function () {
        var result = new WebWorkerRenderNode();
        var id = this._renderStore.allocateId();
        this._renderStore.store(result, id);
        return result;
    };
    WebWorkerRootRenderer.prototype.allocateId = function () { return this._renderStore.allocateId(); };
    WebWorkerRootRenderer.prototype.destroyNodes = function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this._renderStore.remove(nodes[i]);
        }
    };
    WebWorkerRootRenderer = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [client_message_broker_1.ClientMessageBrokerFactory, message_bus_1.MessageBus, serializer_1.Serializer, render_store_1.RenderStore])
    ], WebWorkerRootRenderer);
    return WebWorkerRootRenderer;
})();
exports.WebWorkerRootRenderer = WebWorkerRootRenderer;
var WebWorkerRenderer = (function () {
    function WebWorkerRenderer(_rootRenderer, _componentType) {
        this._rootRenderer = _rootRenderer;
        this._componentType = _componentType;
    }
    WebWorkerRenderer.prototype.renderComponent = function (componentType) {
        return this._rootRenderer.renderComponent(componentType);
    };
    WebWorkerRenderer.prototype._runOnService = function (fnName, fnArgs) {
        var fnArgsWithRenderer = [new client_message_broker_1.FnArg(this, serializer_1.RenderStoreObject)].concat(fnArgs);
        this._rootRenderer.runOnService(fnName, fnArgsWithRenderer);
    };
    WebWorkerRenderer.prototype.selectRootElement = function (selector) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('selectRootElement', [new client_message_broker_1.FnArg(selector, null), new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)]);
        return node;
    };
    WebWorkerRenderer.prototype.createElement = function (parentElement, name) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('createElement', [
            new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(name, null),
            new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)
        ]);
        return node;
    };
    WebWorkerRenderer.prototype.createViewRoot = function (hostElement) {
        var viewRoot = this._componentType.encapsulation === view_1.ViewEncapsulation.Native ?
            this._rootRenderer.allocateNode() :
            hostElement;
        this._runOnService('createViewRoot', [new client_message_broker_1.FnArg(hostElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(viewRoot, serializer_1.RenderStoreObject)]);
        return viewRoot;
    };
    WebWorkerRenderer.prototype.createTemplateAnchor = function (parentElement) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('createTemplateAnchor', [new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)]);
        return node;
    };
    WebWorkerRenderer.prototype.createText = function (parentElement, value) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('createText', [
            new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(value, null),
            new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)
        ]);
        return node;
    };
    WebWorkerRenderer.prototype.projectNodes = function (parentElement, nodes) {
        this._runOnService('projectNodes', [new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(nodes, serializer_1.RenderStoreObject)]);
    };
    WebWorkerRenderer.prototype.attachViewAfter = function (node, viewRootNodes) {
        this._runOnService('attachViewAfter', [new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(viewRootNodes, serializer_1.RenderStoreObject)]);
    };
    WebWorkerRenderer.prototype.detachView = function (viewRootNodes) {
        this._runOnService('detachView', [new client_message_broker_1.FnArg(viewRootNodes, serializer_1.RenderStoreObject)]);
    };
    WebWorkerRenderer.prototype.destroyView = function (hostElement, viewAllNodes) {
        this._runOnService('destroyView', [new client_message_broker_1.FnArg(hostElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(viewAllNodes, serializer_1.RenderStoreObject)]);
        this._rootRenderer.destroyNodes(viewAllNodes);
    };
    WebWorkerRenderer.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
        this._runOnService('setElementProperty', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(propertyName, null),
            new client_message_broker_1.FnArg(propertyValue, null)
        ]);
    };
    WebWorkerRenderer.prototype.setElementAttribute = function (renderElement, attributeName, attributeValue) {
        this._runOnService('setElementAttribute', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(attributeName, null),
            new client_message_broker_1.FnArg(attributeValue, null)
        ]);
    };
    WebWorkerRenderer.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) {
        this._runOnService('setBindingDebugInfo', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(propertyName, null),
            new client_message_broker_1.FnArg(propertyValue, null)
        ]);
    };
    WebWorkerRenderer.prototype.setElementClass = function (renderElement, className, isAdd) {
        this._runOnService('setElementClass', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(className, null),
            new client_message_broker_1.FnArg(isAdd, null)
        ]);
    };
    WebWorkerRenderer.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
        this._runOnService('setElementStyle', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(styleName, null),
            new client_message_broker_1.FnArg(styleValue, null)
        ]);
    };
    WebWorkerRenderer.prototype.invokeElementMethod = function (renderElement, methodName, args) {
        this._runOnService('invokeElementMethod', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(methodName, null),
            new client_message_broker_1.FnArg(args, null)
        ]);
    };
    WebWorkerRenderer.prototype.setText = function (renderNode, text) {
        this._runOnService('setText', [new client_message_broker_1.FnArg(renderNode, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(text, null)]);
    };
    WebWorkerRenderer.prototype.listen = function (renderElement, name, callback) {
        var _this = this;
        renderElement.events.listen(name, callback);
        var unlistenCallbackId = this._rootRenderer.allocateId();
        this._runOnService('listen', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject),
            new client_message_broker_1.FnArg(name, null),
            new client_message_broker_1.FnArg(unlistenCallbackId, null)
        ]);
        return function () {
            renderElement.events.unlisten(name, callback);
            _this._runOnService('listenDone', [new client_message_broker_1.FnArg(unlistenCallbackId, null)]);
        };
    };
    WebWorkerRenderer.prototype.listenGlobal = function (target, name, callback) {
        var _this = this;
        this._rootRenderer.globalEvents.listen(eventNameWithTarget(target, name), callback);
        var unlistenCallbackId = this._rootRenderer.allocateId();
        this._runOnService('listenGlobal', [new client_message_broker_1.FnArg(target, null), new client_message_broker_1.FnArg(name, null), new client_message_broker_1.FnArg(unlistenCallbackId, null)]);
        return function () {
            _this._rootRenderer.globalEvents.unlisten(eventNameWithTarget(target, name), callback);
            _this._runOnService('listenDone', [new client_message_broker_1.FnArg(unlistenCallbackId, null)]);
        };
    };
    return WebWorkerRenderer;
})();
exports.WebWorkerRenderer = WebWorkerRenderer;
var NamedEventEmitter = (function () {
    function NamedEventEmitter() {
    }
    NamedEventEmitter.prototype._getListeners = function (eventName) {
        if (lang_1.isBlank(this._listeners)) {
            this._listeners = new Map();
        }
        var listeners = this._listeners.get(eventName);
        if (lang_1.isBlank(listeners)) {
            listeners = [];
            this._listeners.set(eventName, listeners);
        }
        return listeners;
    };
    NamedEventEmitter.prototype.listen = function (eventName, callback) { this._getListeners(eventName).push(callback); };
    NamedEventEmitter.prototype.unlisten = function (eventName, callback) {
        collection_1.ListWrapper.remove(this._getListeners(eventName), callback);
    };
    NamedEventEmitter.prototype.dispatchEvent = function (eventName, event) {
        var listeners = this._getListeners(eventName);
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](event);
        }
    };
    return NamedEventEmitter;
})();
exports.NamedEventEmitter = NamedEventEmitter;
function eventNameWithTarget(target, eventName) {
    return target + ":" + eventName;
}
var WebWorkerRenderNode = (function () {
    function WebWorkerRenderNode() {
        this.events = new NamedEventEmitter();
    }
    return WebWorkerRenderNode;
})();
exports.WebWorkerRenderNode = WebWorkerRenderNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclJvb3RSZW5kZXJlciIsIldlYldvcmtlclJvb3RSZW5kZXJlci5jb25zdHJ1Y3RvciIsIldlYldvcmtlclJvb3RSZW5kZXJlci5fZGlzcGF0Y2hFdmVudCIsIldlYldvcmtlclJvb3RSZW5kZXJlci5yZW5kZXJDb21wb25lbnQiLCJXZWJXb3JrZXJSb290UmVuZGVyZXIucnVuT25TZXJ2aWNlIiwiV2ViV29ya2VyUm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSIsIldlYldvcmtlclJvb3RSZW5kZXJlci5hbGxvY2F0ZUlkIiwiV2ViV29ya2VyUm9vdFJlbmRlcmVyLmRlc3Ryb3lOb2RlcyIsIldlYldvcmtlclJlbmRlcmVyIiwiV2ViV29ya2VyUmVuZGVyZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJSZW5kZXJlci5yZW5kZXJDb21wb25lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5fcnVuT25TZXJ2aWNlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2VsZWN0Um9vdEVsZW1lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5jcmVhdGVFbGVtZW50IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlVmlld1Jvb3QiLCJXZWJXb3JrZXJSZW5kZXJlci5jcmVhdGVUZW1wbGF0ZUFuY2hvciIsIldlYldvcmtlclJlbmRlcmVyLmNyZWF0ZVRleHQiLCJXZWJXb3JrZXJSZW5kZXJlci5wcm9qZWN0Tm9kZXMiLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hWaWV3QWZ0ZXIiLCJXZWJXb3JrZXJSZW5kZXJlci5kZXRhY2hWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuZGVzdHJveVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50QXR0cmlidXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0QmluZGluZ0RlYnVnSW5mbyIsIldlYldvcmtlclJlbmRlcmVyLnNldEVsZW1lbnRDbGFzcyIsIldlYldvcmtlclJlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSIsIldlYldvcmtlclJlbmRlcmVyLmludm9rZUVsZW1lbnRNZXRob2QiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRUZXh0IiwiV2ViV29ya2VyUmVuZGVyZXIubGlzdGVuIiwiV2ViV29ya2VyUmVuZGVyZXIubGlzdGVuR2xvYmFsIiwiTmFtZWRFdmVudEVtaXR0ZXIiLCJOYW1lZEV2ZW50RW1pdHRlci5jb25zdHJ1Y3RvciIsIk5hbWVkRXZlbnRFbWl0dGVyLl9nZXRMaXN0ZW5lcnMiLCJOYW1lZEV2ZW50RW1pdHRlci5saXN0ZW4iLCJOYW1lZEV2ZW50RW1pdHRlci51bmxpc3RlbiIsIk5hbWVkRXZlbnRFbWl0dGVyLmRpc3BhdGNoRXZlbnQiLCJldmVudE5hbWVXaXRoVGFyZ2V0IiwiV2ViV29ya2VyUmVuZGVyTm9kZSIsIldlYldvcmtlclJlbmRlck5vZGUuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG9CQUEwRCw4QkFBOEIsQ0FBQyxDQUFBO0FBQ3pGLHNDQUtPLHVEQUF1RCxDQUFDLENBQUE7QUFDL0QscUJBQXdDLDBCQUEwQixDQUFDLENBQUE7QUFDbkUsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsNkJBQTBCLDhDQUE4QyxDQUFDLENBQUE7QUFDekUsOEJBQStCLCtDQUErQyxDQUFDLENBQUE7QUFDL0UsMkJBQTRDLDRDQUE0QyxDQUFDLENBQUE7QUFDekYsOEJBQTRCLCtDQUErQyxDQUFDLENBQUE7QUFDNUUsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUscUJBQWdDLGlDQUFpQyxDQUFDLENBQUE7QUFDbEUsbUNBQXND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aW1wb3J0IHtSZW5kZXJlciwgUm9vdFJlbmRlcmVyLCBSZW5kZXJDb21wb25lbnRUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7XG4gIENsaWVudE1lc3NhZ2VCcm9rZXIsXG4gIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5LFxuICBGbkFyZyxcbiAgVWlBcmd1bWVudHNcbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvY2xpZW50X21lc3NhZ2VfYnJva2VyXCI7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgcHJpbnR9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9kaVwiO1xuaW1wb3J0IHtSZW5kZXJTdG9yZX0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfc3RvcmUnO1xuaW1wb3J0IHtSRU5ERVJFUl9DSEFOTkVMfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2luZ19hcGknO1xuaW1wb3J0IHtTZXJpYWxpemVyLCBSZW5kZXJTdG9yZU9iamVjdH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7RVZFTlRfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge2Rlc2VyaWFsaXplR2VuZXJpY0V2ZW50fSBmcm9tICcuL2V2ZW50X2Rlc2VyaWFsaXplcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJSb290UmVuZGVyZXIgaW1wbGVtZW50cyBSb290UmVuZGVyZXIge1xuICBwcml2YXRlIF9tZXNzYWdlQnJva2VyO1xuICBwdWJsaWMgZ2xvYmFsRXZlbnRzOiBOYW1lZEV2ZW50RW1pdHRlciA9IG5ldyBOYW1lZEV2ZW50RW1pdHRlcigpO1xuICBwcml2YXRlIF9jb21wb25lbnRSZW5kZXJlcnM6IE1hcDxzdHJpbmcsIFdlYldvcmtlclJlbmRlcmVyPiA9XG4gICAgICBuZXcgTWFwPHN0cmluZywgV2ViV29ya2VyUmVuZGVyZXI+KCk7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZUJyb2tlckZhY3Rvcnk6IENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5LCBidXM6IE1lc3NhZ2VCdXMsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIsIHByaXZhdGUgX3JlbmRlclN0b3JlOiBSZW5kZXJTdG9yZSkge1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIgPSBtZXNzYWdlQnJva2VyRmFjdG9yeS5jcmVhdGVNZXNzYWdlQnJva2VyKFJFTkRFUkVSX0NIQU5ORUwpO1xuICAgIGJ1cy5pbml0Q2hhbm5lbChFVkVOVF9DSEFOTkVMKTtcbiAgICB2YXIgc291cmNlID0gYnVzLmZyb20oRVZFTlRfQ0hBTk5FTCk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHNvdXJjZSwgKG1lc3NhZ2UpID0+IHRoaXMuX2Rpc3BhdGNoRXZlbnQobWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGlzcGF0Y2hFdmVudChtZXNzYWdlOiB7W2tleTogc3RyaW5nXTogYW55fSk6IHZvaWQge1xuICAgIHZhciBldmVudE5hbWUgPSBtZXNzYWdlWydldmVudE5hbWUnXTtcbiAgICB2YXIgdGFyZ2V0ID0gbWVzc2FnZVsnZXZlbnRUYXJnZXQnXTtcbiAgICB2YXIgZXZlbnQgPSBkZXNlcmlhbGl6ZUdlbmVyaWNFdmVudChtZXNzYWdlWydldmVudCddKTtcbiAgICBpZiAoaXNQcmVzZW50KHRhcmdldCkpIHtcbiAgICAgIHRoaXMuZ2xvYmFsRXZlbnRzLmRpc3BhdGNoRXZlbnQoZXZlbnROYW1lV2l0aFRhcmdldCh0YXJnZXQsIGV2ZW50TmFtZSksIGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGVsZW1lbnQgPVxuICAgICAgICAgIDxXZWJXb3JrZXJSZW5kZXJOb2RlPnRoaXMuX3NlcmlhbGl6ZXIuZGVzZXJpYWxpemUobWVzc2FnZVsnZWxlbWVudCddLCBSZW5kZXJTdG9yZU9iamVjdCk7XG4gICAgICBlbGVtZW50LmV2ZW50cy5kaXNwYXRjaEV2ZW50KGV2ZW50TmFtZSwgZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlKTogUmVuZGVyZXIge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLl9jb21wb25lbnRSZW5kZXJlcnMuZ2V0KGNvbXBvbmVudFR5cGUuaWQpO1xuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBXZWJXb3JrZXJSZW5kZXJlcih0aGlzLCBjb21wb25lbnRUeXBlKTtcbiAgICAgIHRoaXMuX2NvbXBvbmVudFJlbmRlcmVycy5zZXQoY29tcG9uZW50VHlwZS5pZCwgcmVzdWx0KTtcbiAgICAgIHZhciBpZCA9IHRoaXMuX3JlbmRlclN0b3JlLmFsbG9jYXRlSWQoKTtcbiAgICAgIHRoaXMuX3JlbmRlclN0b3JlLnN0b3JlKHJlc3VsdCwgaWQpO1xuICAgICAgdGhpcy5ydW5PblNlcnZpY2UoJ3JlbmRlckNvbXBvbmVudCcsIFtcbiAgICAgICAgbmV3IEZuQXJnKGNvbXBvbmVudFR5cGUsIFJlbmRlckNvbXBvbmVudFR5cGUpLFxuICAgICAgICBuZXcgRm5BcmcocmVzdWx0LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHJ1bk9uU2VydmljZShmbk5hbWU6IHN0cmluZywgZm5BcmdzOiBGbkFyZ1tdKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoZm5OYW1lLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgYWxsb2NhdGVOb2RlKCk6IFdlYldvcmtlclJlbmRlck5vZGUge1xuICAgIHZhciByZXN1bHQgPSBuZXcgV2ViV29ya2VyUmVuZGVyTm9kZSgpO1xuICAgIHZhciBpZCA9IHRoaXMuX3JlbmRlclN0b3JlLmFsbG9jYXRlSWQoKTtcbiAgICB0aGlzLl9yZW5kZXJTdG9yZS5zdG9yZShyZXN1bHQsIGlkKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgYWxsb2NhdGVJZCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fcmVuZGVyU3RvcmUuYWxsb2NhdGVJZCgpOyB9XG5cbiAgZGVzdHJveU5vZGVzKG5vZGVzOiBhbnlbXSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX3JlbmRlclN0b3JlLnJlbW92ZShub2Rlc1tpXSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJSZW5kZXJlciBpbXBsZW1lbnRzIFJlbmRlcmVyLCBSZW5kZXJTdG9yZU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Jvb3RSZW5kZXJlcjogV2ViV29ya2VyUm9vdFJlbmRlcmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF9jb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlKSB7fVxuXG4gIHJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlKTogUmVuZGVyZXIge1xuICAgIHJldHVybiB0aGlzLl9yb290UmVuZGVyZXIucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcnVuT25TZXJ2aWNlKGZuTmFtZTogc3RyaW5nLCBmbkFyZ3M6IEZuQXJnW10pIHtcbiAgICB2YXIgZm5BcmdzV2l0aFJlbmRlcmVyID0gW25ldyBGbkFyZyh0aGlzLCBSZW5kZXJTdG9yZU9iamVjdCldLmNvbmNhdChmbkFyZ3MpO1xuICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5ydW5PblNlcnZpY2UoZm5OYW1lLCBmbkFyZ3NXaXRoUmVuZGVyZXIpO1xuICB9XG5cbiAgc2VsZWN0Um9vdEVsZW1lbnQoc2VsZWN0b3I6IHN0cmluZyk6IGFueSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVOb2RlKCk7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZWxlY3RSb290RWxlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgIFtuZXcgRm5Bcmcoc2VsZWN0b3IsIG51bGwpLCBuZXcgRm5Bcmcobm9kZSwgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBjcmVhdGVFbGVtZW50KHBhcmVudEVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nKTogYW55IHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX3Jvb3RSZW5kZXJlci5hbGxvY2F0ZU5vZGUoKTtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ2NyZWF0ZUVsZW1lbnQnLCBbXG4gICAgICBuZXcgRm5BcmcocGFyZW50RWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgbmV3IEZuQXJnKG5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKG5vZGUsIFJlbmRlclN0b3JlT2JqZWN0KVxuICAgIF0pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgY3JlYXRlVmlld1Jvb3QoaG9zdEVsZW1lbnQ6IGFueSk6IGFueSB7XG4gICAgdmFyIHZpZXdSb290ID0gdGhpcy5fY29tcG9uZW50VHlwZS5lbmNhcHN1bGF0aW9uID09PSBWaWV3RW5jYXBzdWxhdGlvbi5OYXRpdmUgP1xuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVOb2RlKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICBob3N0RWxlbWVudDtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoXG4gICAgICAgICdjcmVhdGVWaWV3Um9vdCcsXG4gICAgICAgIFtuZXcgRm5BcmcoaG9zdEVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKHZpZXdSb290LCBSZW5kZXJTdG9yZU9iamVjdCldKTtcbiAgICByZXR1cm4gdmlld1Jvb3Q7XG4gIH1cblxuICBjcmVhdGVUZW1wbGF0ZUFuY2hvcihwYXJlbnRFbGVtZW50OiBhbnkpOiBhbnkge1xuICAgIHZhciBub2RlID0gdGhpcy5fcm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ2NyZWF0ZVRlbXBsYXRlQW5jaG9yJyxcbiAgICAgICAgW25ldyBGbkFyZyhwYXJlbnRFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyhub2RlLCBSZW5kZXJTdG9yZU9iamVjdCldKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGNyZWF0ZVRleHQocGFyZW50RWxlbWVudDogYW55LCB2YWx1ZTogc3RyaW5nKTogYW55IHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX3Jvb3RSZW5kZXJlci5hbGxvY2F0ZU5vZGUoKTtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ2NyZWF0ZVRleHQnLCBbXG4gICAgICBuZXcgRm5BcmcocGFyZW50RWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgbmV3IEZuQXJnKHZhbHVlLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhub2RlLCBSZW5kZXJTdG9yZU9iamVjdClcbiAgICBdKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHByb2plY3ROb2RlcyhwYXJlbnRFbGVtZW50OiBhbnksIG5vZGVzOiBhbnlbXSkge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ3Byb2plY3ROb2RlcycsXG4gICAgICAgIFtuZXcgRm5BcmcocGFyZW50RWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5Bcmcobm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICB9XG5cbiAgYXR0YWNoVmlld0FmdGVyKG5vZGU6IGFueSwgdmlld1Jvb3ROb2RlczogYW55W10pIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoXG4gICAgICAgICdhdHRhY2hWaWV3QWZ0ZXInLFxuICAgICAgICBbbmV3IEZuQXJnKG5vZGUsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKHZpZXdSb290Tm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICB9XG5cbiAgZGV0YWNoVmlldyh2aWV3Um9vdE5vZGVzOiBhbnlbXSkge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnZGV0YWNoVmlldycsIFtuZXcgRm5Bcmcodmlld1Jvb3ROb2RlcywgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gIH1cblxuICBkZXN0cm95Vmlldyhob3N0RWxlbWVudDogYW55LCB2aWV3QWxsTm9kZXM6IGFueVtdKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnZGVzdHJveVZpZXcnLFxuICAgICAgICBbbmV3IEZuQXJnKGhvc3RFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyh2aWV3QWxsTm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5kZXN0cm95Tm9kZXModmlld0FsbE5vZGVzKTtcbiAgfVxuXG4gIHNldEVsZW1lbnRQcm9wZXJ0eShyZW5kZXJFbGVtZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ3NldEVsZW1lbnRQcm9wZXJ0eScsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcocHJvcGVydHlOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eVZhbHVlLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0RWxlbWVudEF0dHJpYnV0ZShyZW5kZXJFbGVtZW50OiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgYXR0cmlidXRlVmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnc2V0RWxlbWVudEF0dHJpYnV0ZScsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcoYXR0cmlidXRlTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcoYXR0cmlidXRlVmFsdWUsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRCaW5kaW5nRGVidWdJbmZvKHJlbmRlckVsZW1lbnQ6IGFueSwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHByb3BlcnR5VmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnc2V0QmluZGluZ0RlYnVnSW5mbycsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcocHJvcGVydHlOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eVZhbHVlLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0RWxlbWVudENsYXNzKHJlbmRlckVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcsIGlzQWRkOiBib29sZWFuKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZXRFbGVtZW50Q2xhc3MnLCBbXG4gICAgICBuZXcgRm5BcmcocmVuZGVyRWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgbmV3IEZuQXJnKGNsYXNzTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcoaXNBZGQsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRFbGVtZW50U3R5bGUocmVuZGVyRWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZXRFbGVtZW50U3R5bGUnLCBbXG4gICAgICBuZXcgRm5BcmcocmVuZGVyRWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgbmV3IEZuQXJnKHN0eWxlTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5Bcmcoc3R5bGVWYWx1ZSwgbnVsbClcbiAgICBdKTtcbiAgfVxuXG4gIGludm9rZUVsZW1lbnRNZXRob2QocmVuZGVyRWxlbWVudDogYW55LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdpbnZva2VFbGVtZW50TWV0aG9kJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIG5ldyBGbkFyZyhtZXRob2ROYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhhcmdzLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0VGV4dChyZW5kZXJOb2RlOiBhbnksIHRleHQ6IHN0cmluZykge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnc2V0VGV4dCcsXG4gICAgICAgICAgICAgICAgICAgICAgIFtuZXcgRm5BcmcocmVuZGVyTm9kZSwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5BcmcodGV4dCwgbnVsbCldKTtcbiAgfVxuXG4gIGxpc3RlbihyZW5kZXJFbGVtZW50OiBXZWJXb3JrZXJSZW5kZXJOb2RlLCBuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICByZW5kZXJFbGVtZW50LmV2ZW50cy5saXN0ZW4obmFtZSwgY2FsbGJhY2spO1xuICAgIHZhciB1bmxpc3RlbkNhbGxiYWNrSWQgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVJZCgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnbGlzdGVuJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIG5ldyBGbkFyZyhuYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyh1bmxpc3RlbkNhbGxiYWNrSWQsIG51bGwpXG4gICAgXSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHJlbmRlckVsZW1lbnQuZXZlbnRzLnVubGlzdGVuKG5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIHRoaXMuX3J1bk9uU2VydmljZSgnbGlzdGVuRG9uZScsIFtuZXcgRm5BcmcodW5saXN0ZW5DYWxsYmFja0lkLCBudWxsKV0pO1xuICAgIH07XG4gIH1cblxuICBsaXN0ZW5HbG9iYWwodGFyZ2V0OiBzdHJpbmcsIG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5nbG9iYWxFdmVudHMubGlzdGVuKGV2ZW50TmFtZVdpdGhUYXJnZXQodGFyZ2V0LCBuYW1lKSwgY2FsbGJhY2spO1xuICAgIHZhciB1bmxpc3RlbkNhbGxiYWNrSWQgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVJZCgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ2xpc3Rlbkdsb2JhbCcsXG4gICAgICAgIFtuZXcgRm5BcmcodGFyZ2V0LCBudWxsKSwgbmV3IEZuQXJnKG5hbWUsIG51bGwpLCBuZXcgRm5BcmcodW5saXN0ZW5DYWxsYmFja0lkLCBudWxsKV0pO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLl9yb290UmVuZGVyZXIuZ2xvYmFsRXZlbnRzLnVubGlzdGVuKGV2ZW50TmFtZVdpdGhUYXJnZXQodGFyZ2V0LCBuYW1lKSwgY2FsbGJhY2spO1xuICAgICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdsaXN0ZW5Eb25lJywgW25ldyBGbkFyZyh1bmxpc3RlbkNhbGxiYWNrSWQsIG51bGwpXSk7XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmFtZWRFdmVudEVtaXR0ZXIge1xuICBwcml2YXRlIF9saXN0ZW5lcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uW10+O1xuXG4gIHByaXZhdGUgX2dldExpc3RlbmVycyhldmVudE5hbWU6IHN0cmluZyk6IEZ1bmN0aW9uW10ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX2xpc3RlbmVycykpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBGdW5jdGlvbltdPigpO1xuICAgIH1cbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldmVudE5hbWUpO1xuICAgIGlmIChpc0JsYW5rKGxpc3RlbmVycykpIHtcbiAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNldChldmVudE5hbWUsIGxpc3RlbmVycyk7XG4gICAgfVxuICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gIH1cblxuICBsaXN0ZW4oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbikgeyB0aGlzLl9nZXRMaXN0ZW5lcnMoZXZlbnROYW1lKS5wdXNoKGNhbGxiYWNrKTsgfVxuXG4gIHVubGlzdGVuKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSksIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3BhdGNoRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXShldmVudCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50TmFtZVdpdGhUYXJnZXQodGFyZ2V0OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3RhcmdldH06JHtldmVudE5hbWV9YDtcbn1cblxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclJlbmRlck5vZGUgeyBldmVudHM6IE5hbWVkRXZlbnRFbWl0dGVyID0gbmV3IE5hbWVkRXZlbnRFbWl0dGVyKCk7IH1cbiJdfQ==