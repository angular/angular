'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
}());
exports.WebWorkerRootRenderer = WebWorkerRootRenderer;
var WebWorkerRenderer = (function () {
    function WebWorkerRenderer(_rootRenderer, _componentType) {
        this._rootRenderer = _rootRenderer;
        this._componentType = _componentType;
    }
    WebWorkerRenderer.prototype._runOnService = function (fnName, fnArgs) {
        var fnArgsWithRenderer = [new client_message_broker_1.FnArg(this, serializer_1.RenderStoreObject)].concat(fnArgs);
        this._rootRenderer.runOnService(fnName, fnArgsWithRenderer);
    };
    WebWorkerRenderer.prototype.selectRootElement = function (selectorOrNode, debugInfo) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('selectRootElement', [new client_message_broker_1.FnArg(selectorOrNode, null), new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)]);
        return node;
    };
    WebWorkerRenderer.prototype.createElement = function (parentElement, name, debugInfo) {
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
    WebWorkerRenderer.prototype.createTemplateAnchor = function (parentElement, debugInfo) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('createTemplateAnchor', [new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)]);
        return node;
    };
    WebWorkerRenderer.prototype.createText = function (parentElement, value, debugInfo) {
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
}());
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
}());
exports.NamedEventEmitter = NamedEventEmitter;
function eventNameWithTarget(target, eventName) {
    return target + ":" + eventName;
}
var WebWorkerRenderNode = (function () {
    function WebWorkerRenderNode() {
        this.events = new NamedEventEmitter();
    }
    return WebWorkerRenderNode;
}());
exports.WebWorkerRenderNode = WebWorkerRenderNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxvQkFLTyw4QkFBOEIsQ0FBQyxDQUFBO0FBQ3RDLHNDQUtPLHVEQUF1RCxDQUFDLENBQUE7QUFDL0QscUJBQXdDLDBCQUEwQixDQUFDLENBQUE7QUFDbkUsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsNkJBQTBCLDhDQUE4QyxDQUFDLENBQUE7QUFDekUsOEJBQStCLCtDQUErQyxDQUFDLENBQUE7QUFDL0UsMkJBQTRDLDRDQUE0QyxDQUFDLENBQUE7QUFDekYsOEJBQTRCLCtDQUErQyxDQUFDLENBQUE7QUFDNUUsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUscUJBQWdDLGlDQUFpQyxDQUFDLENBQUE7QUFDbEUsbUNBQXNDLHNCQUFzQixDQUFDLENBQUE7QUFHN0Q7SUFNRSwrQkFBWSxvQkFBZ0QsRUFBRSxHQUFlLEVBQ3pELFdBQXVCLEVBQVUsWUFBeUI7UUFQaEYsaUJBNkRDO1FBdERxQixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFhO1FBTHZFLGlCQUFZLEdBQXNCLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUN6RCx3QkFBbUIsR0FDdkIsSUFBSSxHQUFHLEVBQTZCLENBQUM7UUFJdkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxnQ0FBZ0IsQ0FBQyxDQUFDO1FBQ2pGLEdBQUcsQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxDQUFDO1FBQy9CLElBQUks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LE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCx5Q0FBYSxHQUFiLFVBQWMsU0FBaUIsRUFBRSxLQUFVO1FBQ3pDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLENBQUM7SUFDSCxDQUFDO0lBQ0gsd0JBQUM7QUFBRCxDQUFDLEFBM0JELElBMkJDO0FBM0JZLHlCQUFpQixvQkEyQjdCLENBQUE7QUFFRCw2QkFBNkIsTUFBYyxFQUFFLFNBQWlCO0lBQzVELE1BQU0sQ0FBSSxNQUFNLFNBQUksU0FBVyxDQUFDO0FBQ2xDLENBQUM7QUFFRDtJQUFBO1FBQW1DLFdBQU0sR0FBc0IsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBQUMsQ0FBQztJQUFELDBCQUFDO0FBQUQsQ0FBQyxBQUF6RixJQUF5RjtBQUE1RSwyQkFBbUIsc0JBQXlELENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZW5kZXJlcixcbiAgUm9vdFJlbmRlcmVyLFxuICBSZW5kZXJDb21wb25lbnRUeXBlLFxuICBSZW5kZXJEZWJ1Z0luZm9cbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge1xuICBDbGllbnRNZXNzYWdlQnJva2VyLFxuICBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSxcbiAgRm5BcmcsXG4gIFVpQXJndW1lbnRzXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL2NsaWVudF9tZXNzYWdlX2Jyb2tlclwiO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIHByaW50fSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmltcG9ydCB7UmVuZGVyU3RvcmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvcmVuZGVyX3N0b3JlJztcbmltcG9ydCB7UkVOREVSRVJfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7U2VyaWFsaXplciwgUmVuZGVyU3RvcmVPYmplY3R9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5pbXBvcnQge0VWRU5UX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtkZXNlcmlhbGl6ZUdlbmVyaWNFdmVudH0gZnJvbSAnLi9ldmVudF9kZXNlcmlhbGl6ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyUm9vdFJlbmRlcmVyIGltcGxlbWVudHMgUm9vdFJlbmRlcmVyIHtcbiAgcHJpdmF0ZSBfbWVzc2FnZUJyb2tlcjtcbiAgcHVibGljIGdsb2JhbEV2ZW50czogTmFtZWRFdmVudEVtaXR0ZXIgPSBuZXcgTmFtZWRFdmVudEVtaXR0ZXIoKTtcbiAgcHJpdmF0ZSBfY29tcG9uZW50UmVuZGVyZXJzOiBNYXA8c3RyaW5nLCBXZWJXb3JrZXJSZW5kZXJlcj4gPVxuICAgICAgbmV3IE1hcDxzdHJpbmcsIFdlYldvcmtlclJlbmRlcmVyPigpO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2VCcm9rZXJGYWN0b3J5OiBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSwgYnVzOiBNZXNzYWdlQnVzLFxuICAgICAgICAgICAgICBwcml2YXRlIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyLCBwcml2YXRlIF9yZW5kZXJTdG9yZTogUmVuZGVyU3RvcmUpIHtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyID0gbWVzc2FnZUJyb2tlckZhY3RvcnkuY3JlYXRlTWVzc2FnZUJyb2tlcihSRU5ERVJFUl9DSEFOTkVMKTtcbiAgICBidXMuaW5pdENoYW5uZWwoRVZFTlRfQ0hBTk5FTCk7XG4gICAgdmFyIHNvdXJjZSA9IGJ1cy5mcm9tKEVWRU5UX0NIQU5ORUwpO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShzb3VyY2UsIChtZXNzYWdlKSA9PiB0aGlzLl9kaXNwYXRjaEV2ZW50KG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rpc3BhdGNoRXZlbnQobWVzc2FnZToge1trZXk6IHN0cmluZ106IGFueX0pOiB2b2lkIHtcbiAgICB2YXIgZXZlbnROYW1lID0gbWVzc2FnZVsnZXZlbnROYW1lJ107XG4gICAgdmFyIHRhcmdldCA9IG1lc3NhZ2VbJ2V2ZW50VGFyZ2V0J107XG4gICAgdmFyIGV2ZW50ID0gZGVzZXJpYWxpemVHZW5lcmljRXZlbnQobWVzc2FnZVsnZXZlbnQnXSk7XG4gICAgaWYgKGlzUHJlc2VudCh0YXJnZXQpKSB7XG4gICAgICB0aGlzLmdsb2JhbEV2ZW50cy5kaXNwYXRjaEV2ZW50KGV2ZW50TmFtZVdpdGhUYXJnZXQodGFyZ2V0LCBldmVudE5hbWUpLCBldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlbGVtZW50ID1cbiAgICAgICAgICA8V2ViV29ya2VyUmVuZGVyTm9kZT50aGlzLl9zZXJpYWxpemVyLmRlc2VyaWFsaXplKG1lc3NhZ2VbJ2VsZW1lbnQnXSwgUmVuZGVyU3RvcmVPYmplY3QpO1xuICAgICAgZWxlbWVudC5ldmVudHMuZGlzcGF0Y2hFdmVudChldmVudE5hbWUsIGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICByZW5kZXJDb21wb25lbnQoY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSk6IFJlbmRlcmVyIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY29tcG9uZW50UmVuZGVyZXJzLmdldChjb21wb25lbnRUeXBlLmlkKTtcbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSBuZXcgV2ViV29ya2VyUmVuZGVyZXIodGhpcywgY29tcG9uZW50VHlwZSk7XG4gICAgICB0aGlzLl9jb21wb25lbnRSZW5kZXJlcnMuc2V0KGNvbXBvbmVudFR5cGUuaWQsIHJlc3VsdCk7XG4gICAgICB2YXIgaWQgPSB0aGlzLl9yZW5kZXJTdG9yZS5hbGxvY2F0ZUlkKCk7XG4gICAgICB0aGlzLl9yZW5kZXJTdG9yZS5zdG9yZShyZXN1bHQsIGlkKTtcbiAgICAgIHRoaXMucnVuT25TZXJ2aWNlKCdyZW5kZXJDb21wb25lbnQnLCBbXG4gICAgICAgIG5ldyBGbkFyZyhjb21wb25lbnRUeXBlLCBSZW5kZXJDb21wb25lbnRUeXBlKSxcbiAgICAgICAgbmV3IEZuQXJnKHJlc3VsdCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBydW5PblNlcnZpY2UoZm5OYW1lOiBzdHJpbmcsIGZuQXJnczogRm5BcmdbXSkge1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKGZuTmFtZSwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIGFsbG9jYXRlTm9kZSgpOiBXZWJXb3JrZXJSZW5kZXJOb2RlIHtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IFdlYldvcmtlclJlbmRlck5vZGUoKTtcbiAgICB2YXIgaWQgPSB0aGlzLl9yZW5kZXJTdG9yZS5hbGxvY2F0ZUlkKCk7XG4gICAgdGhpcy5fcmVuZGVyU3RvcmUuc3RvcmUocmVzdWx0LCBpZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGFsbG9jYXRlSWQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3JlbmRlclN0b3JlLmFsbG9jYXRlSWQoKTsgfVxuXG4gIGRlc3Ryb3lOb2Rlcyhub2RlczogYW55W10pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9yZW5kZXJTdG9yZS5yZW1vdmUobm9kZXNbaV0pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyUmVuZGVyZXIgaW1wbGVtZW50cyBSZW5kZXJlciwgUmVuZGVyU3RvcmVPYmplY3Qge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yb290UmVuZGVyZXI6IFdlYldvcmtlclJvb3RSZW5kZXJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSkge31cblxuICBwcml2YXRlIF9ydW5PblNlcnZpY2UoZm5OYW1lOiBzdHJpbmcsIGZuQXJnczogRm5BcmdbXSkge1xuICAgIHZhciBmbkFyZ3NXaXRoUmVuZGVyZXIgPSBbbmV3IEZuQXJnKHRoaXMsIFJlbmRlclN0b3JlT2JqZWN0KV0uY29uY2F0KGZuQXJncyk7XG4gICAgdGhpcy5fcm9vdFJlbmRlcmVyLnJ1bk9uU2VydmljZShmbk5hbWUsIGZuQXJnc1dpdGhSZW5kZXJlcik7XG4gIH1cblxuICBzZWxlY3RSb290RWxlbWVudChzZWxlY3Rvck9yTm9kZTogc3RyaW5nLCBkZWJ1Z0luZm86IFJlbmRlckRlYnVnSW5mbyk6IGFueSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVOb2RlKCk7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZWxlY3RSb290RWxlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgIFtuZXcgRm5Bcmcoc2VsZWN0b3JPck5vZGUsIG51bGwpLCBuZXcgRm5Bcmcobm9kZSwgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBjcmVhdGVFbGVtZW50KHBhcmVudEVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCBkZWJ1Z0luZm86IFJlbmRlckRlYnVnSW5mbyk6IGFueSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVOb2RlKCk7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdjcmVhdGVFbGVtZW50JywgW1xuICAgICAgbmV3IEZuQXJnKHBhcmVudEVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIG5ldyBGbkFyZyhuYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhub2RlLCBSZW5kZXJTdG9yZU9iamVjdClcbiAgICBdKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGNyZWF0ZVZpZXdSb290KGhvc3RFbGVtZW50OiBhbnkpOiBhbnkge1xuICAgIHZhciB2aWV3Um9vdCA9IHRoaXMuX2NvbXBvbmVudFR5cGUuZW5jYXBzdWxhdGlvbiA9PT0gVmlld0VuY2Fwc3VsYXRpb24uTmF0aXZlID9cbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgaG9zdEVsZW1lbnQ7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnY3JlYXRlVmlld1Jvb3QnLFxuICAgICAgICBbbmV3IEZuQXJnKGhvc3RFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyh2aWV3Um9vdCwgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gICAgcmV0dXJuIHZpZXdSb290O1xuICB9XG5cbiAgY3JlYXRlVGVtcGxhdGVBbmNob3IocGFyZW50RWxlbWVudDogYW55LCBkZWJ1Z0luZm86IFJlbmRlckRlYnVnSW5mbyk6IGFueSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVOb2RlKCk7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnY3JlYXRlVGVtcGxhdGVBbmNob3InLFxuICAgICAgICBbbmV3IEZuQXJnKHBhcmVudEVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKG5vZGUsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgY3JlYXRlVGV4dChwYXJlbnRFbGVtZW50OiBhbnksIHZhbHVlOiBzdHJpbmcsIGRlYnVnSW5mbzogUmVuZGVyRGVidWdJbmZvKTogYW55IHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX3Jvb3RSZW5kZXJlci5hbGxvY2F0ZU5vZGUoKTtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ2NyZWF0ZVRleHQnLCBbXG4gICAgICBuZXcgRm5BcmcocGFyZW50RWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgbmV3IEZuQXJnKHZhbHVlLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhub2RlLCBSZW5kZXJTdG9yZU9iamVjdClcbiAgICBdKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHByb2plY3ROb2RlcyhwYXJlbnRFbGVtZW50OiBhbnksIG5vZGVzOiBhbnlbXSkge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ3Byb2plY3ROb2RlcycsXG4gICAgICAgIFtuZXcgRm5BcmcocGFyZW50RWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5Bcmcobm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICB9XG5cbiAgYXR0YWNoVmlld0FmdGVyKG5vZGU6IGFueSwgdmlld1Jvb3ROb2RlczogYW55W10pIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoXG4gICAgICAgICdhdHRhY2hWaWV3QWZ0ZXInLFxuICAgICAgICBbbmV3IEZuQXJnKG5vZGUsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKHZpZXdSb290Tm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICB9XG5cbiAgZGV0YWNoVmlldyh2aWV3Um9vdE5vZGVzOiBhbnlbXSkge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnZGV0YWNoVmlldycsIFtuZXcgRm5Bcmcodmlld1Jvb3ROb2RlcywgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gIH1cblxuICBkZXN0cm95Vmlldyhob3N0RWxlbWVudDogYW55LCB2aWV3QWxsTm9kZXM6IGFueVtdKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnZGVzdHJveVZpZXcnLFxuICAgICAgICBbbmV3IEZuQXJnKGhvc3RFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyh2aWV3QWxsTm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5kZXN0cm95Tm9kZXModmlld0FsbE5vZGVzKTtcbiAgfVxuXG4gIHNldEVsZW1lbnRQcm9wZXJ0eShyZW5kZXJFbGVtZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ3NldEVsZW1lbnRQcm9wZXJ0eScsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcocHJvcGVydHlOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eVZhbHVlLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0RWxlbWVudEF0dHJpYnV0ZShyZW5kZXJFbGVtZW50OiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgYXR0cmlidXRlVmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnc2V0RWxlbWVudEF0dHJpYnV0ZScsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcoYXR0cmlidXRlTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcoYXR0cmlidXRlVmFsdWUsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRCaW5kaW5nRGVidWdJbmZvKHJlbmRlckVsZW1lbnQ6IGFueSwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHByb3BlcnR5VmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnc2V0QmluZGluZ0RlYnVnSW5mbycsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksXG4gICAgICBuZXcgRm5BcmcocHJvcGVydHlOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eVZhbHVlLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0RWxlbWVudENsYXNzKHJlbmRlckVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcsIGlzQWRkOiBib29sZWFuKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZXRFbGVtZW50Q2xhc3MnLCBbXG4gICAgICBuZXcgRm5BcmcocmVuZGVyRWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgbmV3IEZuQXJnKGNsYXNzTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcoaXNBZGQsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRFbGVtZW50U3R5bGUocmVuZGVyRWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZXRFbGVtZW50U3R5bGUnLCBbXG4gICAgICBuZXcgRm5BcmcocmVuZGVyRWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLFxuICAgICAgbmV3IEZuQXJnKHN0eWxlTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5Bcmcoc3R5bGVWYWx1ZSwgbnVsbClcbiAgICBdKTtcbiAgfVxuXG4gIGludm9rZUVsZW1lbnRNZXRob2QocmVuZGVyRWxlbWVudDogYW55LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdpbnZva2VFbGVtZW50TWV0aG9kJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIG5ldyBGbkFyZyhtZXRob2ROYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhhcmdzLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0VGV4dChyZW5kZXJOb2RlOiBhbnksIHRleHQ6IHN0cmluZykge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnc2V0VGV4dCcsXG4gICAgICAgICAgICAgICAgICAgICAgIFtuZXcgRm5BcmcocmVuZGVyTm9kZSwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5BcmcodGV4dCwgbnVsbCldKTtcbiAgfVxuXG4gIGxpc3RlbihyZW5kZXJFbGVtZW50OiBXZWJXb3JrZXJSZW5kZXJOb2RlLCBuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICByZW5kZXJFbGVtZW50LmV2ZW50cy5saXN0ZW4obmFtZSwgY2FsbGJhY2spO1xuICAgIHZhciB1bmxpc3RlbkNhbGxiYWNrSWQgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVJZCgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnbGlzdGVuJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIG5ldyBGbkFyZyhuYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyh1bmxpc3RlbkNhbGxiYWNrSWQsIG51bGwpXG4gICAgXSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHJlbmRlckVsZW1lbnQuZXZlbnRzLnVubGlzdGVuKG5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIHRoaXMuX3J1bk9uU2VydmljZSgnbGlzdGVuRG9uZScsIFtuZXcgRm5BcmcodW5saXN0ZW5DYWxsYmFja0lkLCBudWxsKV0pO1xuICAgIH07XG4gIH1cblxuICBsaXN0ZW5HbG9iYWwodGFyZ2V0OiBzdHJpbmcsIG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5nbG9iYWxFdmVudHMubGlzdGVuKGV2ZW50TmFtZVdpdGhUYXJnZXQodGFyZ2V0LCBuYW1lKSwgY2FsbGJhY2spO1xuICAgIHZhciB1bmxpc3RlbkNhbGxiYWNrSWQgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVJZCgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ2xpc3Rlbkdsb2JhbCcsXG4gICAgICAgIFtuZXcgRm5BcmcodGFyZ2V0LCBudWxsKSwgbmV3IEZuQXJnKG5hbWUsIG51bGwpLCBuZXcgRm5BcmcodW5saXN0ZW5DYWxsYmFja0lkLCBudWxsKV0pO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLl9yb290UmVuZGVyZXIuZ2xvYmFsRXZlbnRzLnVubGlzdGVuKGV2ZW50TmFtZVdpdGhUYXJnZXQodGFyZ2V0LCBuYW1lKSwgY2FsbGJhY2spO1xuICAgICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdsaXN0ZW5Eb25lJywgW25ldyBGbkFyZyh1bmxpc3RlbkNhbGxiYWNrSWQsIG51bGwpXSk7XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmFtZWRFdmVudEVtaXR0ZXIge1xuICBwcml2YXRlIF9saXN0ZW5lcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uW10+O1xuXG4gIHByaXZhdGUgX2dldExpc3RlbmVycyhldmVudE5hbWU6IHN0cmluZyk6IEZ1bmN0aW9uW10ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX2xpc3RlbmVycykpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBGdW5jdGlvbltdPigpO1xuICAgIH1cbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldmVudE5hbWUpO1xuICAgIGlmIChpc0JsYW5rKGxpc3RlbmVycykpIHtcbiAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNldChldmVudE5hbWUsIGxpc3RlbmVycyk7XG4gICAgfVxuICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gIH1cblxuICBsaXN0ZW4oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbikgeyB0aGlzLl9nZXRMaXN0ZW5lcnMoZXZlbnROYW1lKS5wdXNoKGNhbGxiYWNrKTsgfVxuXG4gIHVubGlzdGVuKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSksIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3BhdGNoRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXShldmVudCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50TmFtZVdpdGhUYXJnZXQodGFyZ2V0OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3RhcmdldH06JHtldmVudE5hbWV9YDtcbn1cblxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclJlbmRlck5vZGUgeyBldmVudHM6IE5hbWVkRXZlbnRFbWl0dGVyID0gbmV3IE5hbWVkRXZlbnRFbWl0dGVyKCk7IH1cbiJdfQ==