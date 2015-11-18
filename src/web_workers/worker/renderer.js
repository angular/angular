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
var api_1 = require('angular2/src/core/render/api');
var client_message_broker_1 = require("angular2/src/web_workers/shared/client_message_broker");
var lang_1 = require("angular2/src/facade/lang");
var di_1 = require("angular2/src/core/di");
var render_proto_view_ref_store_1 = require('angular2/src/web_workers/shared/render_proto_view_ref_store');
var render_view_with_fragments_store_1 = require('angular2/src/web_workers/shared/render_view_with_fragments_store');
var api_2 = require('angular2/src/web_workers/shared/api');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var event_dispatcher_1 = require('angular2/src/web_workers/worker/event_dispatcher');
var WebWorkerRenderer = (function () {
    function WebWorkerRenderer(messageBrokerFactory, _renderProtoViewRefStore, _renderViewStore, _eventDispatcher) {
        this._renderProtoViewRefStore = _renderProtoViewRefStore;
        this._renderViewStore = _renderViewStore;
        this._eventDispatcher = _eventDispatcher;
        this._messageBroker = messageBrokerFactory.createMessageBroker(messaging_api_1.RENDERER_CHANNEL);
    }
    WebWorkerRenderer.prototype.registerComponentTemplate = function (template) {
        var fnArgs = [new client_message_broker_1.FnArg(template, api_1.RenderComponentTemplate)];
        var args = new client_message_broker_1.UiArguments("registerComponentTemplate", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    WebWorkerRenderer.prototype.createProtoView = function (componentTemplateId, cmds) {
        var renderProtoViewRef = this._renderProtoViewRefStore.allocate();
        var fnArgs = [
            new client_message_broker_1.FnArg(componentTemplateId, null),
            new client_message_broker_1.FnArg(cmds, api_2.WebWorkerTemplateCmd),
            new client_message_broker_1.FnArg(renderProtoViewRef, api_1.RenderProtoViewRef)
        ];
        var args = new client_message_broker_1.UiArguments("createProtoView", fnArgs);
        this._messageBroker.runOnService(args, null);
        return renderProtoViewRef;
    };
    /**
     * Creates a root host view that includes the given element.
     * Note that the fragmentCount needs to be passed in so that we can create a result
     * synchronously even when dealing with webworkers!
     *
     * @param {RenderProtoViewRef} hostProtoViewRef a RenderProtoViewRef of type
     * ProtoViewDto.HOST_VIEW_TYPE
     * @param {any} hostElementSelector css selector for the host element (will be queried against the
     * main document)
     * @return {RenderViewRef} the created view
     */
    WebWorkerRenderer.prototype.createRootHostView = function (hostProtoViewRef, fragmentCount, hostElementSelector) {
        return this._createViewHelper(hostProtoViewRef, fragmentCount, hostElementSelector);
    };
    /**
     * Creates a regular view out of the given ProtoView
     * Note that the fragmentCount needs to be passed in so that we can create a result
     * synchronously even when dealing with webworkers!
     */
    WebWorkerRenderer.prototype.createView = function (protoViewRef, fragmentCount) {
        return this._createViewHelper(protoViewRef, fragmentCount);
    };
    WebWorkerRenderer.prototype._createViewHelper = function (protoViewRef, fragmentCount, hostElementSelector) {
        var renderViewWithFragments = this._renderViewStore.allocate(fragmentCount);
        var startIndex = (renderViewWithFragments.viewRef).refNumber;
        var fnArgs = [
            new client_message_broker_1.FnArg(protoViewRef, api_1.RenderProtoViewRef),
            new client_message_broker_1.FnArg(fragmentCount, null),
        ];
        var method = "createView";
        if (lang_1.isPresent(hostElementSelector) && hostElementSelector != null) {
            fnArgs.push(new client_message_broker_1.FnArg(hostElementSelector, null));
            method = "createRootHostView";
        }
        fnArgs.push(new client_message_broker_1.FnArg(startIndex, null));
        var args = new client_message_broker_1.UiArguments(method, fnArgs);
        this._messageBroker.runOnService(args, null);
        return renderViewWithFragments;
    };
    /**
     * Destroys the given view after it has been dehydrated and detached
     */
    WebWorkerRenderer.prototype.destroyView = function (viewRef) {
        var fnArgs = [new client_message_broker_1.FnArg(viewRef, api_1.RenderViewRef)];
        var args = new client_message_broker_1.UiArguments("destroyView", fnArgs);
        this._messageBroker.runOnService(args, null);
        this._renderViewStore.remove(viewRef);
    };
    /**
     * Attaches a fragment after another fragment.
     */
    WebWorkerRenderer.prototype.attachFragmentAfterFragment = function (previousFragmentRef, fragmentRef) {
        var fnArgs = [
            new client_message_broker_1.FnArg(previousFragmentRef, api_1.RenderFragmentRef),
            new client_message_broker_1.FnArg(fragmentRef, api_1.RenderFragmentRef)
        ];
        var args = new client_message_broker_1.UiArguments("attachFragmentAfterFragment", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Attaches a fragment after an element.
     */
    WebWorkerRenderer.prototype.attachFragmentAfterElement = function (elementRef, fragmentRef) {
        var fnArgs = [new client_message_broker_1.FnArg(elementRef, api_2.WebWorkerElementRef), new client_message_broker_1.FnArg(fragmentRef, api_1.RenderFragmentRef)];
        var args = new client_message_broker_1.UiArguments("attachFragmentAfterElement", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Detaches a fragment.
     */
    WebWorkerRenderer.prototype.detachFragment = function (fragmentRef) {
        var fnArgs = [new client_message_broker_1.FnArg(fragmentRef, api_1.RenderFragmentRef)];
        var args = new client_message_broker_1.UiArguments("detachFragment", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
     * inside of the view pool.
     */
    WebWorkerRenderer.prototype.hydrateView = function (viewRef) {
        var fnArgs = [new client_message_broker_1.FnArg(viewRef, api_1.RenderViewRef)];
        var args = new client_message_broker_1.UiArguments("hydrateView", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
     * inside of the view pool.
     */
    WebWorkerRenderer.prototype.dehydrateView = function (viewRef) {
        var fnArgs = [new client_message_broker_1.FnArg(viewRef, api_1.RenderViewRef)];
        var args = new client_message_broker_1.UiArguments("dehydrateView", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Returns the native element at the given location.
     * Attention: In a WebWorker scenario, this should always return null!
     */
    WebWorkerRenderer.prototype.getNativeElementSync = function (location) { return null; };
    /**
     * Sets a property on an element.
     */
    WebWorkerRenderer.prototype.setElementProperty = function (location, propertyName, propertyValue) {
        var fnArgs = [
            new client_message_broker_1.FnArg(location, api_2.WebWorkerElementRef),
            new client_message_broker_1.FnArg(propertyName, null),
            new client_message_broker_1.FnArg(propertyValue, null)
        ];
        var args = new client_message_broker_1.UiArguments("setElementProperty", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Sets an attribute on an element.
     */
    WebWorkerRenderer.prototype.setElementAttribute = function (location, attributeName, attributeValue) {
        var fnArgs = [
            new client_message_broker_1.FnArg(location, api_2.WebWorkerElementRef),
            new client_message_broker_1.FnArg(attributeName, null),
            new client_message_broker_1.FnArg(attributeValue, null)
        ];
        var args = new client_message_broker_1.UiArguments("setElementAttribute", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Sets a class on an element.
     */
    WebWorkerRenderer.prototype.setElementClass = function (location, className, isAdd) {
        var fnArgs = [
            new client_message_broker_1.FnArg(location, api_2.WebWorkerElementRef),
            new client_message_broker_1.FnArg(className, null),
            new client_message_broker_1.FnArg(isAdd, null)
        ];
        var args = new client_message_broker_1.UiArguments("setElementClass", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Sets a style on an element.
     */
    WebWorkerRenderer.prototype.setElementStyle = function (location, styleName, styleValue) {
        var fnArgs = [
            new client_message_broker_1.FnArg(location, api_2.WebWorkerElementRef),
            new client_message_broker_1.FnArg(styleName, null),
            new client_message_broker_1.FnArg(styleValue, null)
        ];
        var args = new client_message_broker_1.UiArguments("setElementStyle", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Calls a method on an element.
     * Note: For now we're assuming that everything in the args list are primitive
     */
    WebWorkerRenderer.prototype.invokeElementMethod = function (location, methodName, args) {
        var fnArgs = [
            new client_message_broker_1.FnArg(location, api_2.WebWorkerElementRef),
            new client_message_broker_1.FnArg(methodName, null),
            new client_message_broker_1.FnArg(args, null)
        ];
        var uiArgs = new client_message_broker_1.UiArguments("invokeElementMethod", fnArgs);
        this._messageBroker.runOnService(uiArgs, null);
    };
    /**
     * Sets the value of a text node.
     */
    WebWorkerRenderer.prototype.setText = function (viewRef, textNodeIndex, text) {
        var fnArgs = [new client_message_broker_1.FnArg(viewRef, api_1.RenderViewRef), new client_message_broker_1.FnArg(textNodeIndex, null), new client_message_broker_1.FnArg(text, null)];
        var args = new client_message_broker_1.UiArguments("setText", fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    /**
     * Sets the dispatcher for all events of the given view
     */
    WebWorkerRenderer.prototype.setEventDispatcher = function (viewRef, dispatcher) {
        var fnArgs = [new client_message_broker_1.FnArg(viewRef, api_1.RenderViewRef)];
        var args = new client_message_broker_1.UiArguments("setEventDispatcher", fnArgs);
        this._eventDispatcher.registerEventDispatcher(viewRef, dispatcher);
        this._messageBroker.runOnService(args, null);
    };
    WebWorkerRenderer = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [client_message_broker_1.ClientMessageBrokerFactory, render_proto_view_ref_store_1.RenderProtoViewRefStore, render_view_with_fragments_store_1.RenderViewWithFragmentsStore, event_dispatcher_1.WebWorkerEventDispatcher])
    ], WebWorkerRenderer);
    return WebWorkerRenderer;
})();
exports.WebWorkerRenderer = WebWorkerRenderer;
//# sourceMappingURL=renderer.js.map