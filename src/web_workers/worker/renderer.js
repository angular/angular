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
        renderElement.events.listen(name, callback);
        this._runOnService('listen', [new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(name, null)]);
    };
    WebWorkerRenderer.prototype.listenGlobal = function (target, name, callback) {
        var _this = this;
        this._rootRenderer.globalEvents.listen(eventNameWithTarget(target, name), callback);
        var unlistenCallbackId = this._rootRenderer.allocateId();
        this._runOnService('listenGlobal', [new client_message_broker_1.FnArg(target, null), new client_message_broker_1.FnArg(name, null), new client_message_broker_1.FnArg(unlistenCallbackId, null)]);
        return function () {
            _this._rootRenderer.globalEvents.unlisten(eventNameWithTarget(target, name), callback);
            _this._runOnService('listenGlobalDone', [new client_message_broker_1.FnArg(unlistenCallbackId, null)]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclJvb3RSZW5kZXJlciIsIldlYldvcmtlclJvb3RSZW5kZXJlci5jb25zdHJ1Y3RvciIsIldlYldvcmtlclJvb3RSZW5kZXJlci5fZGlzcGF0Y2hFdmVudCIsIldlYldvcmtlclJvb3RSZW5kZXJlci5yZW5kZXJDb21wb25lbnQiLCJXZWJXb3JrZXJSb290UmVuZGVyZXIucnVuT25TZXJ2aWNlIiwiV2ViV29ya2VyUm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSIsIldlYldvcmtlclJvb3RSZW5kZXJlci5hbGxvY2F0ZUlkIiwiV2ViV29ya2VyUm9vdFJlbmRlcmVyLmRlc3Ryb3lOb2RlcyIsIldlYldvcmtlclJlbmRlcmVyIiwiV2ViV29ya2VyUmVuZGVyZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJSZW5kZXJlci5yZW5kZXJDb21wb25lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5fcnVuT25TZXJ2aWNlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2VsZWN0Um9vdEVsZW1lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5jcmVhdGVFbGVtZW50IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlVmlld1Jvb3QiLCJXZWJXb3JrZXJSZW5kZXJlci5jcmVhdGVUZW1wbGF0ZUFuY2hvciIsIldlYldvcmtlclJlbmRlcmVyLmNyZWF0ZVRleHQiLCJXZWJXb3JrZXJSZW5kZXJlci5wcm9qZWN0Tm9kZXMiLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hWaWV3QWZ0ZXIiLCJXZWJXb3JrZXJSZW5kZXJlci5kZXRhY2hWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuZGVzdHJveVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50QXR0cmlidXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0QmluZGluZ0RlYnVnSW5mbyIsIldlYldvcmtlclJlbmRlcmVyLnNldEVsZW1lbnRDbGFzcyIsIldlYldvcmtlclJlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSIsIldlYldvcmtlclJlbmRlcmVyLmludm9rZUVsZW1lbnRNZXRob2QiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRUZXh0IiwiV2ViV29ya2VyUmVuZGVyZXIubGlzdGVuIiwiV2ViV29ya2VyUmVuZGVyZXIubGlzdGVuR2xvYmFsIiwiTmFtZWRFdmVudEVtaXR0ZXIiLCJOYW1lZEV2ZW50RW1pdHRlci5jb25zdHJ1Y3RvciIsIk5hbWVkRXZlbnRFbWl0dGVyLl9nZXRMaXN0ZW5lcnMiLCJOYW1lZEV2ZW50RW1pdHRlci5saXN0ZW4iLCJOYW1lZEV2ZW50RW1pdHRlci51bmxpc3RlbiIsIk5hbWVkRXZlbnRFbWl0dGVyLmRpc3BhdGNoRXZlbnQiLCJldmVudE5hbWVXaXRoVGFyZ2V0IiwiV2ViV29ya2VyUmVuZGVyTm9kZSIsIldlYldvcmtlclJlbmRlck5vZGUuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG9CQUEwRCw4QkFBOEIsQ0FBQyxDQUFBO0FBQ3pGLHNDQUtPLHVEQUF1RCxDQUFDLENBQUE7QUFDL0QscUJBQXdDLDBCQUEwQixDQUFDLENBQUE7QUFDbkUsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsNkJBQTBCLDhDQUE4QyxDQUFDLENBQUE7QUFDekUsOEJBQStCLCtDQUErQyxDQUFDLENBQUE7QUFDL0UsMkJBQTRDLDRDQUE0QyxDQUFDLENBQUE7QUFDekYsOEJBQTRCLCtDQUErQyxDQUFDLENBQUE7QUFDNUUsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUscUJBQWdDLGlDQUFpQyxDQUFDLENBQUE7QUFDbEUsbUNBQXND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QUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzlDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUMxQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDdEJBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0hMLHdCQUFDQTtBQUFEQSxDQUFDQSxBQTNCRCxJQTJCQztBQTNCWSx5QkFBaUIsb0JBMkI3QixDQUFBO0FBRUQsNkJBQTZCLE1BQWMsRUFBRSxTQUFpQjtJQUM1RE0sTUFBTUEsQ0FBSUEsTUFBTUEsU0FBSUEsU0FBV0EsQ0FBQ0E7QUFDbENBLENBQUNBO0FBRUQ7SUFBQUM7UUFBbUNDLFdBQU1BLEdBQXNCQSxJQUFJQSxpQkFBaUJBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBQURELDBCQUFDQTtBQUFEQSxDQUFDQSxBQUF6RixJQUF5RjtBQUE1RSwyQkFBbUIsc0JBQXlELENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1JlbmRlcmVyLCBSb290UmVuZGVyZXIsIFJlbmRlckNvbXBvbmVudFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtcbiAgQ2xpZW50TWVzc2FnZUJyb2tlcixcbiAgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnksXG4gIEZuQXJnLFxuICBVaUFyZ3VtZW50c1xufSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXJcIjtcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBwcmludH0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL2RpXCI7XG5pbXBvcnQge1JlbmRlclN0b3JlfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3JlbmRlcl9zdG9yZSc7XG5pbXBvcnQge1JFTkRFUkVSX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5pbXBvcnQge1NlcmlhbGl6ZXIsIFJlbmRlclN0b3JlT2JqZWN0fSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtFVkVOVF9DSEFOTkVMfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2luZ19hcGknO1xuaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7ZGVzZXJpYWxpemVHZW5lcmljRXZlbnR9IGZyb20gJy4vZXZlbnRfZGVzZXJpYWxpemVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclJvb3RSZW5kZXJlciBpbXBsZW1lbnRzIFJvb3RSZW5kZXJlciB7XG4gIHByaXZhdGUgX21lc3NhZ2VCcm9rZXI7XG4gIHB1YmxpYyBnbG9iYWxFdmVudHM6IE5hbWVkRXZlbnRFbWl0dGVyID0gbmV3IE5hbWVkRXZlbnRFbWl0dGVyKCk7XG4gIHByaXZhdGUgX2NvbXBvbmVudFJlbmRlcmVyczogTWFwPHN0cmluZywgV2ViV29ya2VyUmVuZGVyZXI+ID1cbiAgICAgIG5ldyBNYXA8c3RyaW5nLCBXZWJXb3JrZXJSZW5kZXJlcj4oKTtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlQnJva2VyRmFjdG9yeTogQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnksIGJ1czogTWVzc2FnZUJ1cyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplciwgcHJpdmF0ZSBfcmVuZGVyU3RvcmU6IFJlbmRlclN0b3JlKSB7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlciA9IG1lc3NhZ2VCcm9rZXJGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VCcm9rZXIoUkVOREVSRVJfQ0hBTk5FTCk7XG4gICAgYnVzLmluaXRDaGFubmVsKEVWRU5UX0NIQU5ORUwpO1xuICAgIHZhciBzb3VyY2UgPSBidXMuZnJvbShFVkVOVF9DSEFOTkVMKTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoc291cmNlLCAobWVzc2FnZSkgPT4gdGhpcy5fZGlzcGF0Y2hFdmVudChtZXNzYWdlKSk7XG4gIH1cblxuICBwcml2YXRlIF9kaXNwYXRjaEV2ZW50KG1lc3NhZ2U6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgdmFyIGV2ZW50TmFtZSA9IG1lc3NhZ2VbJ2V2ZW50TmFtZSddO1xuICAgIHZhciB0YXJnZXQgPSBtZXNzYWdlWydldmVudFRhcmdldCddO1xuICAgIHZhciBldmVudCA9IGRlc2VyaWFsaXplR2VuZXJpY0V2ZW50KG1lc3NhZ2VbJ2V2ZW50J10pO1xuICAgIGlmIChpc1ByZXNlbnQodGFyZ2V0KSkge1xuICAgICAgdGhpcy5nbG9iYWxFdmVudHMuZGlzcGF0Y2hFdmVudChldmVudE5hbWVXaXRoVGFyZ2V0KHRhcmdldCwgZXZlbnROYW1lKSwgZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZWxlbWVudCA9XG4gICAgICAgICAgPFdlYldvcmtlclJlbmRlck5vZGU+dGhpcy5fc2VyaWFsaXplci5kZXNlcmlhbGl6ZShtZXNzYWdlWydlbGVtZW50J10sIFJlbmRlclN0b3JlT2JqZWN0KTtcbiAgICAgIGVsZW1lbnQuZXZlbnRzLmRpc3BhdGNoRXZlbnQoZXZlbnROYW1lLCBldmVudCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUpOiBSZW5kZXJlciB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NvbXBvbmVudFJlbmRlcmVycy5nZXQoY29tcG9uZW50VHlwZS5pZCk7XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0gbmV3IFdlYldvcmtlclJlbmRlcmVyKHRoaXMsIGNvbXBvbmVudFR5cGUpO1xuICAgICAgdGhpcy5fY29tcG9uZW50UmVuZGVyZXJzLnNldChjb21wb25lbnRUeXBlLmlkLCByZXN1bHQpO1xuICAgICAgdmFyIGlkID0gdGhpcy5fcmVuZGVyU3RvcmUuYWxsb2NhdGVJZCgpO1xuICAgICAgdGhpcy5fcmVuZGVyU3RvcmUuc3RvcmUocmVzdWx0LCBpZCk7XG4gICAgICB0aGlzLnJ1bk9uU2VydmljZSgncmVuZGVyQ29tcG9uZW50JywgW1xuICAgICAgICBuZXcgRm5BcmcoY29tcG9uZW50VHlwZSwgUmVuZGVyQ29tcG9uZW50VHlwZSksXG4gICAgICAgIG5ldyBGbkFyZyhyZXN1bHQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcnVuT25TZXJ2aWNlKGZuTmFtZTogc3RyaW5nLCBmbkFyZ3M6IEZuQXJnW10pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhmbk5hbWUsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICBhbGxvY2F0ZU5vZGUoKTogV2ViV29ya2VyUmVuZGVyTm9kZSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBXZWJXb3JrZXJSZW5kZXJOb2RlKCk7XG4gICAgdmFyIGlkID0gdGhpcy5fcmVuZGVyU3RvcmUuYWxsb2NhdGVJZCgpO1xuICAgIHRoaXMuX3JlbmRlclN0b3JlLnN0b3JlKHJlc3VsdCwgaWQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBhbGxvY2F0ZUlkKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9yZW5kZXJTdG9yZS5hbGxvY2F0ZUlkKCk7IH1cblxuICBkZXN0cm95Tm9kZXMobm9kZXM6IGFueVtdKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fcmVuZGVyU3RvcmUucmVtb3ZlKG5vZGVzW2ldKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclJlbmRlcmVyIGltcGxlbWVudHMgUmVuZGVyZXIsIFJlbmRlclN0b3JlT2JqZWN0IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcm9vdFJlbmRlcmVyOiBXZWJXb3JrZXJSb290UmVuZGVyZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUpIHt9XG5cbiAgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUpOiBSZW5kZXJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3Jvb3RSZW5kZXJlci5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50VHlwZSk7XG4gIH1cblxuICBwcml2YXRlIF9ydW5PblNlcnZpY2UoZm5OYW1lOiBzdHJpbmcsIGZuQXJnczogRm5BcmdbXSkge1xuICAgIHZhciBmbkFyZ3NXaXRoUmVuZGVyZXIgPSBbbmV3IEZuQXJnKHRoaXMsIFJlbmRlclN0b3JlT2JqZWN0KV0uY29uY2F0KGZuQXJncyk7XG4gICAgdGhpcy5fcm9vdFJlbmRlcmVyLnJ1bk9uU2VydmljZShmbk5hbWUsIGZuQXJnc1dpdGhSZW5kZXJlcik7XG4gIH1cblxuICBzZWxlY3RSb290RWxlbWVudChzZWxlY3Rvcjogc3RyaW5nKTogYW55IHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX3Jvb3RSZW5kZXJlci5hbGxvY2F0ZU5vZGUoKTtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ3NlbGVjdFJvb3RFbGVtZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgW25ldyBGbkFyZyhzZWxlY3RvciwgbnVsbCksIG5ldyBGbkFyZyhub2RlLCBSZW5kZXJTdG9yZU9iamVjdCldKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGNyZWF0ZUVsZW1lbnQocGFyZW50RWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHZhciBub2RlID0gdGhpcy5fcm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnY3JlYXRlRWxlbWVudCcsIFtcbiAgICAgIG5ldyBGbkFyZyhwYXJlbnRFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcobmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5Bcmcobm9kZSwgUmVuZGVyU3RvcmVPYmplY3QpXG4gICAgXSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBjcmVhdGVWaWV3Um9vdChob3N0RWxlbWVudDogYW55KTogYW55IHtcbiAgICB2YXIgdmlld1Jvb3QgPSB0aGlzLl9jb21wb25lbnRUeXBlLmVuY2Fwc3VsYXRpb24gPT09IFZpZXdFbmNhcHN1bGF0aW9uLk5hdGl2ZSA/XG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5hbGxvY2F0ZU5vZGUoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgIGhvc3RFbGVtZW50O1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ2NyZWF0ZVZpZXdSb290JyxcbiAgICAgICAgW25ldyBGbkFyZyhob3N0RWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5Bcmcodmlld1Jvb3QsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICAgIHJldHVybiB2aWV3Um9vdDtcbiAgfVxuXG4gIGNyZWF0ZVRlbXBsYXRlQW5jaG9yKHBhcmVudEVsZW1lbnQ6IGFueSk6IGFueSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVOb2RlKCk7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnY3JlYXRlVGVtcGxhdGVBbmNob3InLFxuICAgICAgICBbbmV3IEZuQXJnKHBhcmVudEVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKG5vZGUsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgY3JlYXRlVGV4dChwYXJlbnRFbGVtZW50OiBhbnksIHZhbHVlOiBzdHJpbmcpOiBhbnkge1xuICAgIHZhciBub2RlID0gdGhpcy5fcm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnY3JlYXRlVGV4dCcsIFtcbiAgICAgIG5ldyBGbkFyZyhwYXJlbnRFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcodmFsdWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKG5vZGUsIFJlbmRlclN0b3JlT2JqZWN0KVxuICAgIF0pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgcHJvamVjdE5vZGVzKHBhcmVudEVsZW1lbnQ6IGFueSwgbm9kZXM6IGFueVtdKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAncHJvamVjdE5vZGVzJyxcbiAgICAgICAgW25ldyBGbkFyZyhwYXJlbnRFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyhub2RlcywgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gIH1cblxuICBhdHRhY2hWaWV3QWZ0ZXIobm9kZTogYW55LCB2aWV3Um9vdE5vZGVzOiBhbnlbXSkge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ2F0dGFjaFZpZXdBZnRlcicsXG4gICAgICAgIFtuZXcgRm5Bcmcobm9kZSwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5Bcmcodmlld1Jvb3ROb2RlcywgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gIH1cblxuICBkZXRhY2hWaWV3KHZpZXdSb290Tm9kZXM6IGFueVtdKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdkZXRhY2hWaWV3JywgW25ldyBGbkFyZyh2aWV3Um9vdE5vZGVzLCBSZW5kZXJTdG9yZU9iamVjdCldKTtcbiAgfVxuXG4gIGRlc3Ryb3lWaWV3KGhvc3RFbGVtZW50OiBhbnksIHZpZXdBbGxOb2RlczogYW55W10pIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoXG4gICAgICAgICdkZXN0cm95VmlldycsXG4gICAgICAgIFtuZXcgRm5BcmcoaG9zdEVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKHZpZXdBbGxOb2RlcywgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gICAgdGhpcy5fcm9vdFJlbmRlcmVyLmRlc3Ryb3lOb2Rlcyh2aWV3QWxsTm9kZXMpO1xuICB9XG5cbiAgc2V0RWxlbWVudFByb3BlcnR5KHJlbmRlckVsZW1lbnQ6IGFueSwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHByb3BlcnR5VmFsdWU6IGFueSkge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnc2V0RWxlbWVudFByb3BlcnR5JywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eU5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKHByb3BlcnR5VmFsdWUsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRFbGVtZW50QXR0cmlidXRlKHJlbmRlckVsZW1lbnQ6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZXRFbGVtZW50QXR0cmlidXRlJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIG5ldyBGbkFyZyhhdHRyaWJ1dGVOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhhdHRyaWJ1dGVWYWx1ZSwgbnVsbClcbiAgICBdKTtcbiAgfVxuXG4gIHNldEJpbmRpbmdEZWJ1Z0luZm8ocmVuZGVyRWxlbWVudDogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZXRCaW5kaW5nRGVidWdJbmZvJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eU5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKHByb3BlcnR5VmFsdWUsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRFbGVtZW50Q2xhc3MocmVuZGVyRWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZywgaXNBZGQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ3NldEVsZW1lbnRDbGFzcycsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcoY2xhc3NOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhpc0FkZCwgbnVsbClcbiAgICBdKTtcbiAgfVxuXG4gIHNldEVsZW1lbnRTdHlsZShyZW5kZXJFbGVtZW50OiBhbnksIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ3NldEVsZW1lbnRTdHlsZScsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5Bcmcoc3R5bGVOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhzdHlsZVZhbHVlLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgaW52b2tlRWxlbWVudE1ldGhvZChyZW5kZXJFbGVtZW50OiBhbnksIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ2ludm9rZUVsZW1lbnRNZXRob2QnLCBbXG4gICAgICBuZXcgRm5BcmcocmVuZGVyRWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgbmV3IEZuQXJnKG1ldGhvZE5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKGFyZ3MsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRUZXh0KHJlbmRlck5vZGU6IGFueSwgdGV4dDogc3RyaW5nKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZXRUZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgW25ldyBGbkFyZyhyZW5kZXJOb2RlLCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyh0ZXh0LCBudWxsKV0pO1xuICB9XG5cbiAgbGlzdGVuKHJlbmRlckVsZW1lbnQ6IFdlYldvcmtlclJlbmRlck5vZGUsIG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgcmVuZGVyRWxlbWVudC5ldmVudHMubGlzdGVuKG5hbWUsIGNhbGxiYWNrKTtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ2xpc3RlbicsXG4gICAgICAgICAgICAgICAgICAgICAgIFtuZXcgRm5BcmcocmVuZGVyRWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5BcmcobmFtZSwgbnVsbCldKTtcbiAgfVxuXG4gIGxpc3Rlbkdsb2JhbCh0YXJnZXQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdGhpcy5fcm9vdFJlbmRlcmVyLmdsb2JhbEV2ZW50cy5saXN0ZW4oZXZlbnROYW1lV2l0aFRhcmdldCh0YXJnZXQsIG5hbWUpLCBjYWxsYmFjayk7XG4gICAgdmFyIHVubGlzdGVuQ2FsbGJhY2tJZCA9IHRoaXMuX3Jvb3RSZW5kZXJlci5hbGxvY2F0ZUlkKCk7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnbGlzdGVuR2xvYmFsJyxcbiAgICAgICAgW25ldyBGbkFyZyh0YXJnZXQsIG51bGwpLCBuZXcgRm5BcmcobmFtZSwgbnVsbCksIG5ldyBGbkFyZyh1bmxpc3RlbkNhbGxiYWNrSWQsIG51bGwpXSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5nbG9iYWxFdmVudHMudW5saXN0ZW4oZXZlbnROYW1lV2l0aFRhcmdldCh0YXJnZXQsIG5hbWUpLCBjYWxsYmFjayk7XG4gICAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ2xpc3Rlbkdsb2JhbERvbmUnLCBbbmV3IEZuQXJnKHVubGlzdGVuQ2FsbGJhY2tJZCwgbnVsbCldKTtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOYW1lZEV2ZW50RW1pdHRlciB7XG4gIHByaXZhdGUgX2xpc3RlbmVyczogTWFwPHN0cmluZywgRnVuY3Rpb25bXT47XG5cbiAgcHJpdmF0ZSBfZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZTogc3RyaW5nKTogRnVuY3Rpb25bXSB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fbGlzdGVuZXJzKSkge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIEZ1bmN0aW9uW10+KCk7XG4gICAgfVxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2ZW50TmFtZSk7XG4gICAgaWYgKGlzQmxhbmsobGlzdGVuZXJzKSkge1xuICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuc2V0KGV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcbiAgICB9XG4gICAgcmV0dXJuIGxpc3RlbmVycztcbiAgfVxuXG4gIGxpc3RlbihldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7IHRoaXMuX2dldExpc3RlbmVycyhldmVudE5hbWUpLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgdW5saXN0ZW4oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9nZXRMaXN0ZW5lcnMoZXZlbnROYW1lKSwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcGF0Y2hFdmVudChldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9nZXRMaXN0ZW5lcnMoZXZlbnROYW1lKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldKGV2ZW50KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnROYW1lV2l0aFRhcmdldCh0YXJnZXQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7dGFyZ2V0fToke2V2ZW50TmFtZX1gO1xufVxuXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyUmVuZGVyTm9kZSB7IGV2ZW50czogTmFtZWRFdmVudEVtaXR0ZXIgPSBuZXcgTmFtZWRFdmVudEVtaXR0ZXIoKTsgfVxuIl19