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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclJlbmRlcmVyIiwiV2ViV29ya2VyUmVuZGVyZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJSZW5kZXJlci5yZWdpc3RlckNvbXBvbmVudFRlbXBsYXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlUHJvdG9WaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlUm9vdEhvc3RWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlVmlldyIsIldlYldvcmtlclJlbmRlcmVyLl9jcmVhdGVWaWV3SGVscGVyIiwiV2ViV29ya2VyUmVuZGVyZXIuZGVzdHJveVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hGcmFnbWVudEFmdGVyRnJhZ21lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hGcmFnbWVudEFmdGVyRWxlbWVudCIsIldlYldvcmtlclJlbmRlcmVyLmRldGFjaEZyYWdtZW50IiwiV2ViV29ya2VyUmVuZGVyZXIuaHlkcmF0ZVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5kZWh5ZHJhdGVWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuZ2V0TmF0aXZlRWxlbWVudFN5bmMiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50QXR0cmlidXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0RWxlbWVudENsYXNzIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0RWxlbWVudFN0eWxlIiwiV2ViV29ya2VyUmVuZGVyZXIuaW52b2tlRWxlbWVudE1ldGhvZCIsIldlYldvcmtlclJlbmRlcmVyLnNldFRleHQiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFdmVudERpc3BhdGNoZXIiXSwibWFwcGluZ3MiOiI7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QSw4Q0FBa0JBLEdBQWxCQSxVQUFtQkEsT0FBc0JBLEVBQUVBLFVBQWlDQTtRQUMxRW9CLElBQUlBLE1BQU1BLEdBQUdBLENBQUNBLElBQUlBLDZCQUFLQSxDQUFDQSxPQUFPQSxFQUFFQSxtQkFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLG1DQUFXQSxDQUFDQSxvQkFBb0JBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3pEQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLHVCQUF1QkEsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDbkVBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO0lBQy9DQSxDQUFDQTtJQXBPSHBCO1FBQUNBLGVBQVVBLEVBQUVBOzswQkFxT1pBO0lBQURBLHdCQUFDQTtBQUFEQSxDQUFDQSxBQXJPRCxJQXFPQztBQXBPWSx5QkFBaUIsb0JBb083QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUmVuZGVyZXIsXG4gIFJlbmRlclByb3RvVmlld1JlZixcbiAgUmVuZGVyVmlld1JlZixcbiAgUmVuZGVyRWxlbWVudFJlZixcbiAgUmVuZGVyRXZlbnREaXNwYXRjaGVyLFxuICBSZW5kZXJWaWV3V2l0aEZyYWdtZW50cyxcbiAgUmVuZGVyRnJhZ21lbnRSZWYsXG4gIFJlbmRlclRlbXBsYXRlQ21kLFxuICBSZW5kZXJDb21wb25lbnRUZW1wbGF0ZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7XG4gIENsaWVudE1lc3NhZ2VCcm9rZXIsXG4gIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5LFxuICBGbkFyZyxcbiAgVWlBcmd1bWVudHNcbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvY2xpZW50X21lc3NhZ2VfYnJva2VyXCI7XG5pbXBvcnQge2lzUHJlc2VudCwgcHJpbnR9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL2RpXCI7XG5pbXBvcnQge1JlbmRlclByb3RvVmlld1JlZlN0b3JlfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3JlbmRlcl9wcm90b192aWV3X3JlZl9zdG9yZSc7XG5pbXBvcnQge1xuICBSZW5kZXJWaWV3V2l0aEZyYWdtZW50c1N0b3JlLFxuICBXZWJXb3JrZXJSZW5kZXJWaWV3UmVmXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvcmVuZGVyX3ZpZXdfd2l0aF9mcmFnbWVudHNfc3RvcmUnO1xuaW1wb3J0IHtXZWJXb3JrZXJFbGVtZW50UmVmLCBXZWJXb3JrZXJUZW1wbGF0ZUNtZH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9hcGknO1xuaW1wb3J0IHtSRU5ERVJFUl9DSEFOTkVMfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2luZ19hcGknO1xuaW1wb3J0IHtXZWJXb3JrZXJFdmVudERpc3BhdGNoZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy93b3JrZXIvZXZlbnRfZGlzcGF0Y2hlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJSZW5kZXJlciBpbXBsZW1lbnRzIFJlbmRlcmVyIHtcbiAgcHJpdmF0ZSBfbWVzc2FnZUJyb2tlcjtcbiAgY29uc3RydWN0b3IobWVzc2FnZUJyb2tlckZhY3Rvcnk6IENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5LFxuICAgICAgICAgICAgICBwcml2YXRlIF9yZW5kZXJQcm90b1ZpZXdSZWZTdG9yZTogUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3JlbmRlclZpZXdTdG9yZTogUmVuZGVyVmlld1dpdGhGcmFnbWVudHNTdG9yZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZXZlbnREaXNwYXRjaGVyOiBXZWJXb3JrZXJFdmVudERpc3BhdGNoZXIpIHtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyID0gbWVzc2FnZUJyb2tlckZhY3RvcnkuY3JlYXRlTWVzc2FnZUJyb2tlcihSRU5ERVJFUl9DSEFOTkVMKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQ29tcG9uZW50VGVtcGxhdGUodGVtcGxhdGU6IFJlbmRlckNvbXBvbmVudFRlbXBsYXRlKSB7XG4gICAgdmFyIGZuQXJncyA9IFtuZXcgRm5BcmcodGVtcGxhdGUsIFJlbmRlckNvbXBvbmVudFRlbXBsYXRlKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJyZWdpc3RlckNvbXBvbmVudFRlbXBsYXRlXCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICBjcmVhdGVQcm90b1ZpZXcoY29tcG9uZW50VGVtcGxhdGVJZDogc3RyaW5nLCBjbWRzOiBSZW5kZXJUZW1wbGF0ZUNtZFtdKTogUmVuZGVyUHJvdG9WaWV3UmVmIHtcbiAgICB2YXIgcmVuZGVyUHJvdG9WaWV3UmVmID0gdGhpcy5fcmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUuYWxsb2NhdGUoKTtcblxuICAgIHZhciBmbkFyZ3M6IEZuQXJnW10gPSBbXG4gICAgICBuZXcgRm5BcmcoY29tcG9uZW50VGVtcGxhdGVJZCwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcoY21kcywgV2ViV29ya2VyVGVtcGxhdGVDbWQpLFxuICAgICAgbmV3IEZuQXJnKHJlbmRlclByb3RvVmlld1JlZiwgUmVuZGVyUHJvdG9WaWV3UmVmKVxuICAgIF07XG4gICAgdmFyIGFyZ3M6IFVpQXJndW1lbnRzID0gbmV3IFVpQXJndW1lbnRzKFwiY3JlYXRlUHJvdG9WaWV3XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gICAgcmV0dXJuIHJlbmRlclByb3RvVmlld1JlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcm9vdCBob3N0IHZpZXcgdGhhdCBpbmNsdWRlcyB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogTm90ZSB0aGF0IHRoZSBmcmFnbWVudENvdW50IG5lZWRzIHRvIGJlIHBhc3NlZCBpbiBzbyB0aGF0IHdlIGNhbiBjcmVhdGUgYSByZXN1bHRcbiAgICogc3luY2hyb25vdXNseSBldmVuIHdoZW4gZGVhbGluZyB3aXRoIHdlYndvcmtlcnMhXG4gICAqXG4gICAqIEBwYXJhbSB7UmVuZGVyUHJvdG9WaWV3UmVmfSBob3N0UHJvdG9WaWV3UmVmIGEgUmVuZGVyUHJvdG9WaWV3UmVmIG9mIHR5cGVcbiAgICogUHJvdG9WaWV3RHRvLkhPU1RfVklFV19UWVBFXG4gICAqIEBwYXJhbSB7YW55fSBob3N0RWxlbWVudFNlbGVjdG9yIGNzcyBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCAod2lsbCBiZSBxdWVyaWVkIGFnYWluc3QgdGhlXG4gICAqIG1haW4gZG9jdW1lbnQpXG4gICAqIEByZXR1cm4ge1JlbmRlclZpZXdSZWZ9IHRoZSBjcmVhdGVkIHZpZXdcbiAgICovXG4gIGNyZWF0ZVJvb3RIb3N0Vmlldyhob3N0UHJvdG9WaWV3UmVmOiBSZW5kZXJQcm90b1ZpZXdSZWYsIGZyYWdtZW50Q291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgIGhvc3RFbGVtZW50U2VsZWN0b3I6IHN0cmluZyk6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzIHtcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlVmlld0hlbHBlcihob3N0UHJvdG9WaWV3UmVmLCBmcmFnbWVudENvdW50LCBob3N0RWxlbWVudFNlbGVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcmVndWxhciB2aWV3IG91dCBvZiB0aGUgZ2l2ZW4gUHJvdG9WaWV3XG4gICAqIE5vdGUgdGhhdCB0aGUgZnJhZ21lbnRDb3VudCBuZWVkcyB0byBiZSBwYXNzZWQgaW4gc28gdGhhdCB3ZSBjYW4gY3JlYXRlIGEgcmVzdWx0XG4gICAqIHN5bmNocm9ub3VzbHkgZXZlbiB3aGVuIGRlYWxpbmcgd2l0aCB3ZWJ3b3JrZXJzIVxuICAgKi9cbiAgY3JlYXRlVmlldyhwcm90b1ZpZXdSZWY6IFJlbmRlclByb3RvVmlld1JlZiwgZnJhZ21lbnRDb3VudDogbnVtYmVyKTogUmVuZGVyVmlld1dpdGhGcmFnbWVudHMge1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVWaWV3SGVscGVyKHByb3RvVmlld1JlZiwgZnJhZ21lbnRDb3VudCk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVWaWV3SGVscGVyKHByb3RvVmlld1JlZjogUmVuZGVyUHJvdG9WaWV3UmVmLCBmcmFnbWVudENvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdEVsZW1lbnRTZWxlY3Rvcj86IHN0cmluZyk6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzIHtcbiAgICB2YXIgcmVuZGVyVmlld1dpdGhGcmFnbWVudHMgPSB0aGlzLl9yZW5kZXJWaWV3U3RvcmUuYWxsb2NhdGUoZnJhZ21lbnRDb3VudCk7XG5cbiAgICB2YXIgc3RhcnRJbmRleCA9ICg8V2ViV29ya2VyUmVuZGVyVmlld1JlZj4ocmVuZGVyVmlld1dpdGhGcmFnbWVudHMudmlld1JlZikpLnJlZk51bWJlcjtcbiAgICB2YXIgZm5BcmdzOiBGbkFyZ1tdID0gW1xuICAgICAgbmV3IEZuQXJnKHByb3RvVmlld1JlZiwgUmVuZGVyUHJvdG9WaWV3UmVmKSxcbiAgICAgIG5ldyBGbkFyZyhmcmFnbWVudENvdW50LCBudWxsKSxcbiAgICBdO1xuICAgIHZhciBtZXRob2QgPSBcImNyZWF0ZVZpZXdcIjtcbiAgICBpZiAoaXNQcmVzZW50KGhvc3RFbGVtZW50U2VsZWN0b3IpICYmIGhvc3RFbGVtZW50U2VsZWN0b3IgIT0gbnVsbCkge1xuICAgICAgZm5BcmdzLnB1c2gobmV3IEZuQXJnKGhvc3RFbGVtZW50U2VsZWN0b3IsIG51bGwpKTtcbiAgICAgIG1ldGhvZCA9IFwiY3JlYXRlUm9vdEhvc3RWaWV3XCI7XG4gICAgfVxuICAgIGZuQXJncy5wdXNoKG5ldyBGbkFyZyhzdGFydEluZGV4LCBudWxsKSk7XG5cbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhtZXRob2QsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG5cbiAgICByZXR1cm4gcmVuZGVyVmlld1dpdGhGcmFnbWVudHM7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGdpdmVuIHZpZXcgYWZ0ZXIgaXQgaGFzIGJlZW4gZGVoeWRyYXRlZCBhbmQgZGV0YWNoZWRcbiAgICovXG4gIGRlc3Ryb3lWaWV3KHZpZXdSZWY6IFJlbmRlclZpZXdSZWYpIHtcbiAgICB2YXIgZm5BcmdzID0gW25ldyBGbkFyZyh2aWV3UmVmLCBSZW5kZXJWaWV3UmVmKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJkZXN0cm95Vmlld1wiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICAgIHRoaXMuX3JlbmRlclZpZXdTdG9yZS5yZW1vdmUodmlld1JlZik7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgYSBmcmFnbWVudCBhZnRlciBhbm90aGVyIGZyYWdtZW50LlxuICAgKi9cbiAgYXR0YWNoRnJhZ21lbnRBZnRlckZyYWdtZW50KHByZXZpb3VzRnJhZ21lbnRSZWY6IFJlbmRlckZyYWdtZW50UmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRSZWY6IFJlbmRlckZyYWdtZW50UmVmKSB7XG4gICAgdmFyIGZuQXJncyA9IFtcbiAgICAgIG5ldyBGbkFyZyhwcmV2aW91c0ZyYWdtZW50UmVmLCBSZW5kZXJGcmFnbWVudFJlZiksXG4gICAgICBuZXcgRm5BcmcoZnJhZ21lbnRSZWYsIFJlbmRlckZyYWdtZW50UmVmKVxuICAgIF07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJhdHRhY2hGcmFnbWVudEFmdGVyRnJhZ21lbnRcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhIGZyYWdtZW50IGFmdGVyIGFuIGVsZW1lbnQuXG4gICAqL1xuICBhdHRhY2hGcmFnbWVudEFmdGVyRWxlbWVudChlbGVtZW50UmVmOiBSZW5kZXJFbGVtZW50UmVmLCBmcmFnbWVudFJlZjogUmVuZGVyRnJhZ21lbnRSZWYpIHtcbiAgICB2YXIgZm5BcmdzID1cbiAgICAgICAgW25ldyBGbkFyZyhlbGVtZW50UmVmLCBXZWJXb3JrZXJFbGVtZW50UmVmKSwgbmV3IEZuQXJnKGZyYWdtZW50UmVmLCBSZW5kZXJGcmFnbWVudFJlZildO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwiYXR0YWNoRnJhZ21lbnRBZnRlckVsZW1lbnRcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRhY2hlcyBhIGZyYWdtZW50LlxuICAgKi9cbiAgZGV0YWNoRnJhZ21lbnQoZnJhZ21lbnRSZWY6IFJlbmRlckZyYWdtZW50UmVmKSB7XG4gICAgdmFyIGZuQXJncyA9IFtuZXcgRm5BcmcoZnJhZ21lbnRSZWYsIFJlbmRlckZyYWdtZW50UmVmKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJkZXRhY2hGcmFnbWVudFwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEh5ZHJhdGVzIGEgdmlldyBhZnRlciBpdCBoYXMgYmVlbiBhdHRhY2hlZC4gSHlkcmF0aW9uL2RlaHlkcmF0aW9uIGlzIHVzZWQgZm9yIHJldXNpbmcgdmlld3NcbiAgICogaW5zaWRlIG9mIHRoZSB2aWV3IHBvb2wuXG4gICAqL1xuICBoeWRyYXRlVmlldyh2aWV3UmVmOiBSZW5kZXJWaWV3UmVmKSB7XG4gICAgdmFyIGZuQXJncyA9IFtuZXcgRm5Bcmcodmlld1JlZiwgUmVuZGVyVmlld1JlZildO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwiaHlkcmF0ZVZpZXdcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWh5ZHJhdGVzIGEgdmlldyBhZnRlciBpdCBoYXMgYmVlbiBhdHRhY2hlZC4gSHlkcmF0aW9uL2RlaHlkcmF0aW9uIGlzIHVzZWQgZm9yIHJldXNpbmcgdmlld3NcbiAgICogaW5zaWRlIG9mIHRoZSB2aWV3IHBvb2wuXG4gICAqL1xuICBkZWh5ZHJhdGVWaWV3KHZpZXdSZWY6IFJlbmRlclZpZXdSZWYpIHtcbiAgICB2YXIgZm5BcmdzID0gW25ldyBGbkFyZyh2aWV3UmVmLCBSZW5kZXJWaWV3UmVmKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJkZWh5ZHJhdGVWaWV3XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmF0aXZlIGVsZW1lbnQgYXQgdGhlIGdpdmVuIGxvY2F0aW9uLlxuICAgKiBBdHRlbnRpb246IEluIGEgV2ViV29ya2VyIHNjZW5hcmlvLCB0aGlzIHNob3VsZCBhbHdheXMgcmV0dXJuIG51bGwhXG4gICAqL1xuICBnZXROYXRpdmVFbGVtZW50U3luYyhsb2NhdGlvbjogUmVuZGVyRWxlbWVudFJlZik6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBwcm9wZXJ0eSBvbiBhbiBlbGVtZW50LlxuICAgKi9cbiAgc2V0RWxlbWVudFByb3BlcnR5KGxvY2F0aW9uOiBSZW5kZXJFbGVtZW50UmVmLCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogYW55KSB7XG4gICAgdmFyIGZuQXJncyA9IFtcbiAgICAgIG5ldyBGbkFyZyhsb2NhdGlvbiwgV2ViV29ya2VyRWxlbWVudFJlZiksXG4gICAgICBuZXcgRm5BcmcocHJvcGVydHlOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eVZhbHVlLCBudWxsKVxuICAgIF07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJzZXRFbGVtZW50UHJvcGVydHlcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvbiBhbiBlbGVtZW50LlxuICAgKi9cbiAgc2V0RWxlbWVudEF0dHJpYnV0ZShsb2NhdGlvbjogUmVuZGVyRWxlbWVudFJlZiwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdmFyIGZuQXJncyA9IFtcbiAgICAgIG5ldyBGbkFyZyhsb2NhdGlvbiwgV2ViV29ya2VyRWxlbWVudFJlZiksXG4gICAgICBuZXcgRm5BcmcoYXR0cmlidXRlTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcoYXR0cmlidXRlVmFsdWUsIG51bGwpXG4gICAgXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInNldEVsZW1lbnRBdHRyaWJ1dGVcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgY2xhc3Mgb24gYW4gZWxlbWVudC5cbiAgICovXG4gIHNldEVsZW1lbnRDbGFzcyhsb2NhdGlvbjogUmVuZGVyRWxlbWVudFJlZiwgY2xhc3NOYW1lOiBzdHJpbmcsIGlzQWRkOiBib29sZWFuKSB7XG4gICAgdmFyIGZuQXJncyA9IFtcbiAgICAgIG5ldyBGbkFyZyhsb2NhdGlvbiwgV2ViV29ya2VyRWxlbWVudFJlZiksXG4gICAgICBuZXcgRm5BcmcoY2xhc3NOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhpc0FkZCwgbnVsbClcbiAgICBdO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwic2V0RWxlbWVudENsYXNzXCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIHN0eWxlIG9uIGFuIGVsZW1lbnQuXG4gICAqL1xuICBzZXRFbGVtZW50U3R5bGUobG9jYXRpb246IFJlbmRlckVsZW1lbnRSZWYsIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcpIHtcbiAgICB2YXIgZm5BcmdzID0gW1xuICAgICAgbmV3IEZuQXJnKGxvY2F0aW9uLCBXZWJXb3JrZXJFbGVtZW50UmVmKSxcbiAgICAgIG5ldyBGbkFyZyhzdHlsZU5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKHN0eWxlVmFsdWUsIG51bGwpXG4gICAgXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInNldEVsZW1lbnRTdHlsZVwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGEgbWV0aG9kIG9uIGFuIGVsZW1lbnQuXG4gICAqIE5vdGU6IEZvciBub3cgd2UncmUgYXNzdW1pbmcgdGhhdCBldmVyeXRoaW5nIGluIHRoZSBhcmdzIGxpc3QgYXJlIHByaW1pdGl2ZVxuICAgKi9cbiAgaW52b2tlRWxlbWVudE1ldGhvZChsb2NhdGlvbjogUmVuZGVyRWxlbWVudFJlZiwgbWV0aG9kTmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSkge1xuICAgIHZhciBmbkFyZ3MgPSBbXG4gICAgICBuZXcgRm5BcmcobG9jYXRpb24sIFdlYldvcmtlckVsZW1lbnRSZWYpLFxuICAgICAgbmV3IEZuQXJnKG1ldGhvZE5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKGFyZ3MsIG51bGwpXG4gICAgXTtcbiAgICB2YXIgdWlBcmdzID0gbmV3IFVpQXJndW1lbnRzKFwiaW52b2tlRWxlbWVudE1ldGhvZFwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKHVpQXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSB0ZXh0IG5vZGUuXG4gICAqL1xuICBzZXRUZXh0KHZpZXdSZWY6IFJlbmRlclZpZXdSZWYsIHRleHROb2RlSW5kZXg6IG51bWJlciwgdGV4dDogc3RyaW5nKSB7XG4gICAgdmFyIGZuQXJncyA9XG4gICAgICAgIFtuZXcgRm5Bcmcodmlld1JlZiwgUmVuZGVyVmlld1JlZiksIG5ldyBGbkFyZyh0ZXh0Tm9kZUluZGV4LCBudWxsKSwgbmV3IEZuQXJnKHRleHQsIG51bGwpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInNldFRleHRcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkaXNwYXRjaGVyIGZvciBhbGwgZXZlbnRzIG9mIHRoZSBnaXZlbiB2aWV3XG4gICAqL1xuICBzZXRFdmVudERpc3BhdGNoZXIodmlld1JlZjogUmVuZGVyVmlld1JlZiwgZGlzcGF0Y2hlcjogUmVuZGVyRXZlbnREaXNwYXRjaGVyKSB7XG4gICAgdmFyIGZuQXJncyA9IFtuZXcgRm5Bcmcodmlld1JlZiwgUmVuZGVyVmlld1JlZildO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwic2V0RXZlbnREaXNwYXRjaGVyXCIsIGZuQXJncyk7XG4gICAgdGhpcy5fZXZlbnREaXNwYXRjaGVyLnJlZ2lzdGVyRXZlbnREaXNwYXRjaGVyKHZpZXdSZWYsIGRpc3BhdGNoZXIpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG59XG4iXX0=