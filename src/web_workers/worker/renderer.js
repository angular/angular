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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclJlbmRlcmVyIiwiV2ViV29ya2VyUmVuZGVyZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJSZW5kZXJlci5yZWdpc3RlckNvbXBvbmVudFRlbXBsYXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlUHJvdG9WaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlUm9vdEhvc3RWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlVmlldyIsIldlYldvcmtlclJlbmRlcmVyLl9jcmVhdGVWaWV3SGVscGVyIiwiV2ViV29ya2VyUmVuZGVyZXIuZGVzdHJveVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hGcmFnbWVudEFmdGVyRnJhZ21lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hGcmFnbWVudEFmdGVyRWxlbWVudCIsIldlYldvcmtlclJlbmRlcmVyLmRldGFjaEZyYWdtZW50IiwiV2ViV29ya2VyUmVuZGVyZXIuaHlkcmF0ZVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5kZWh5ZHJhdGVWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuZ2V0TmF0aXZlRWxlbWVudFN5bmMiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50QXR0cmlidXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0RWxlbWVudENsYXNzIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0RWxlbWVudFN0eWxlIiwiV2ViV29ya2VyUmVuZGVyZXIuaW52b2tlRWxlbWVudE1ldGhvZCIsIldlYldvcmtlclJlbmRlcmVyLnNldFRleHQiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFdmVudERpc3BhdGNoZXIiXSwibWFwcGluZ3MiOiI7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OENBQWtCQSxHQUFsQkEsVUFBbUJBLE9BQXNCQSxFQUFFQSxVQUFpQ0E7UUFDMUVvQixJQUFJQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSw2QkFBS0EsQ0FBQ0EsT0FBT0EsRUFBRUEsbUJBQWFBLENBQUNBLENBQUNBLENBQUNBO1FBQ2pEQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxtQ0FBV0EsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN6REEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSx1QkFBdUJBLENBQUNBLE9BQU9BLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO1FBQ25FQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUMvQ0EsQ0FBQ0E7SUFwT0hwQjtRQUFDQSxlQUFVQSxFQUFFQTs7MEJBcU9aQTtJQUFEQSx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFyT0QsSUFxT0M7QUFwT1kseUJBQWlCLG9CQW9PN0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFJlbmRlcmVyLFxuICBSZW5kZXJQcm90b1ZpZXdSZWYsXG4gIFJlbmRlclZpZXdSZWYsXG4gIFJlbmRlckVsZW1lbnRSZWYsXG4gIFJlbmRlckV2ZW50RGlzcGF0Y2hlcixcbiAgUmVuZGVyVmlld1dpdGhGcmFnbWVudHMsXG4gIFJlbmRlckZyYWdtZW50UmVmLFxuICBSZW5kZXJUZW1wbGF0ZUNtZCxcbiAgUmVuZGVyQ29tcG9uZW50VGVtcGxhdGVcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge1xuICBDbGllbnRNZXNzYWdlQnJva2VyLFxuICBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSxcbiAgRm5BcmcsXG4gIFVpQXJndW1lbnRzXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL2NsaWVudF9tZXNzYWdlX2Jyb2tlclwiO1xuaW1wb3J0IHtpc1ByZXNlbnQsIHByaW50fSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9kaVwiO1xuaW1wb3J0IHtSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZX0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfcHJvdG9fdmlld19yZWZfc3RvcmUnO1xuaW1wb3J0IHtcbiAgUmVuZGVyVmlld1dpdGhGcmFnbWVudHNTdG9yZSxcbiAgV2ViV29ya2VyUmVuZGVyVmlld1JlZlxufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3JlbmRlcl92aWV3X3dpdGhfZnJhZ21lbnRzX3N0b3JlJztcbmltcG9ydCB7V2ViV29ya2VyRWxlbWVudFJlZiwgV2ViV29ya2VyVGVtcGxhdGVDbWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvYXBpJztcbmltcG9ydCB7UkVOREVSRVJfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7V2ViV29ya2VyRXZlbnREaXNwYXRjaGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL2V2ZW50X2Rpc3BhdGNoZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyUmVuZGVyZXIgaW1wbGVtZW50cyBSZW5kZXJlciB7XG4gIHByaXZhdGUgX21lc3NhZ2VCcm9rZXI7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2VCcm9rZXJGYWN0b3J5OiBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcmVuZGVyUHJvdG9WaWV3UmVmU3RvcmU6IFJlbmRlclByb3RvVmlld1JlZlN0b3JlLFxuICAgICAgICAgICAgICBwcml2YXRlIF9yZW5kZXJWaWV3U3RvcmU6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2V2ZW50RGlzcGF0Y2hlcjogV2ViV29ya2VyRXZlbnREaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlciA9IG1lc3NhZ2VCcm9rZXJGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VCcm9rZXIoUkVOREVSRVJfQ0hBTk5FTCk7XG4gIH1cblxuICByZWdpc3RlckNvbXBvbmVudFRlbXBsYXRlKHRlbXBsYXRlOiBSZW5kZXJDb21wb25lbnRUZW1wbGF0ZSkge1xuICAgIHZhciBmbkFyZ3MgPSBbbmV3IEZuQXJnKHRlbXBsYXRlLCBSZW5kZXJDb21wb25lbnRUZW1wbGF0ZSldO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwicmVnaXN0ZXJDb21wb25lbnRUZW1wbGF0ZVwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgY3JlYXRlUHJvdG9WaWV3KGNvbXBvbmVudFRlbXBsYXRlSWQ6IHN0cmluZywgY21kczogUmVuZGVyVGVtcGxhdGVDbWRbXSk6IFJlbmRlclByb3RvVmlld1JlZiB7XG4gICAgdmFyIHJlbmRlclByb3RvVmlld1JlZiA9IHRoaXMuX3JlbmRlclByb3RvVmlld1JlZlN0b3JlLmFsbG9jYXRlKCk7XG5cbiAgICB2YXIgZm5BcmdzOiBGbkFyZ1tdID0gW1xuICAgICAgbmV3IEZuQXJnKGNvbXBvbmVudFRlbXBsYXRlSWQsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKGNtZHMsIFdlYldvcmtlclRlbXBsYXRlQ21kKSxcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJQcm90b1ZpZXdSZWYsIFJlbmRlclByb3RvVmlld1JlZilcbiAgICBdO1xuICAgIHZhciBhcmdzOiBVaUFyZ3VtZW50cyA9IG5ldyBVaUFyZ3VtZW50cyhcImNyZWF0ZVByb3RvVmlld1wiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICAgIHJldHVybiByZW5kZXJQcm90b1ZpZXdSZWY7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHJvb3QgaG9zdCB2aWV3IHRoYXQgaW5jbHVkZXMgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIE5vdGUgdGhhdCB0aGUgZnJhZ21lbnRDb3VudCBuZWVkcyB0byBiZSBwYXNzZWQgaW4gc28gdGhhdCB3ZSBjYW4gY3JlYXRlIGEgcmVzdWx0XG4gICAqIHN5bmNocm9ub3VzbHkgZXZlbiB3aGVuIGRlYWxpbmcgd2l0aCB3ZWJ3b3JrZXJzIVxuICAgKlxuICAgKiBAcGFyYW0ge1JlbmRlclByb3RvVmlld1JlZn0gaG9zdFByb3RvVmlld1JlZiBhIFJlbmRlclByb3RvVmlld1JlZiBvZiB0eXBlXG4gICAqIFByb3RvVmlld0R0by5IT1NUX1ZJRVdfVFlQRVxuICAgKiBAcGFyYW0ge2FueX0gaG9zdEVsZW1lbnRTZWxlY3RvciBjc3Mgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgKHdpbGwgYmUgcXVlcmllZCBhZ2FpbnN0IHRoZVxuICAgKiBtYWluIGRvY3VtZW50KVxuICAgKiBAcmV0dXJuIHtSZW5kZXJWaWV3UmVmfSB0aGUgY3JlYXRlZCB2aWV3XG4gICAqL1xuICBjcmVhdGVSb290SG9zdFZpZXcoaG9zdFByb3RvVmlld1JlZjogUmVuZGVyUHJvdG9WaWV3UmVmLCBmcmFnbWVudENvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICBob3N0RWxlbWVudFNlbGVjdG9yOiBzdHJpbmcpOiBSZW5kZXJWaWV3V2l0aEZyYWdtZW50cyB7XG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVZpZXdIZWxwZXIoaG9zdFByb3RvVmlld1JlZiwgZnJhZ21lbnRDb3VudCwgaG9zdEVsZW1lbnRTZWxlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHJlZ3VsYXIgdmlldyBvdXQgb2YgdGhlIGdpdmVuIFByb3RvVmlld1xuICAgKiBOb3RlIHRoYXQgdGhlIGZyYWdtZW50Q291bnQgbmVlZHMgdG8gYmUgcGFzc2VkIGluIHNvIHRoYXQgd2UgY2FuIGNyZWF0ZSBhIHJlc3VsdFxuICAgKiBzeW5jaHJvbm91c2x5IGV2ZW4gd2hlbiBkZWFsaW5nIHdpdGggd2Vid29ya2VycyFcbiAgICovXG4gIGNyZWF0ZVZpZXcocHJvdG9WaWV3UmVmOiBSZW5kZXJQcm90b1ZpZXdSZWYsIGZyYWdtZW50Q291bnQ6IG51bWJlcik6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzIHtcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlVmlld0hlbHBlcihwcm90b1ZpZXdSZWYsIGZyYWdtZW50Q291bnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlVmlld0hlbHBlcihwcm90b1ZpZXdSZWY6IFJlbmRlclByb3RvVmlld1JlZiwgZnJhZ21lbnRDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RFbGVtZW50U2VsZWN0b3I/OiBzdHJpbmcpOiBSZW5kZXJWaWV3V2l0aEZyYWdtZW50cyB7XG4gICAgdmFyIHJlbmRlclZpZXdXaXRoRnJhZ21lbnRzID0gdGhpcy5fcmVuZGVyVmlld1N0b3JlLmFsbG9jYXRlKGZyYWdtZW50Q291bnQpO1xuXG4gICAgdmFyIHN0YXJ0SW5kZXggPSAoPFdlYldvcmtlclJlbmRlclZpZXdSZWY+KHJlbmRlclZpZXdXaXRoRnJhZ21lbnRzLnZpZXdSZWYpKS5yZWZOdW1iZXI7XG4gICAgdmFyIGZuQXJnczogRm5BcmdbXSA9IFtcbiAgICAgIG5ldyBGbkFyZyhwcm90b1ZpZXdSZWYsIFJlbmRlclByb3RvVmlld1JlZiksXG4gICAgICBuZXcgRm5BcmcoZnJhZ21lbnRDb3VudCwgbnVsbCksXG4gICAgXTtcbiAgICB2YXIgbWV0aG9kID0gXCJjcmVhdGVWaWV3XCI7XG4gICAgaWYgKGlzUHJlc2VudChob3N0RWxlbWVudFNlbGVjdG9yKSAmJiBob3N0RWxlbWVudFNlbGVjdG9yICE9IG51bGwpIHtcbiAgICAgIGZuQXJncy5wdXNoKG5ldyBGbkFyZyhob3N0RWxlbWVudFNlbGVjdG9yLCBudWxsKSk7XG4gICAgICBtZXRob2QgPSBcImNyZWF0ZVJvb3RIb3N0Vmlld1wiO1xuICAgIH1cbiAgICBmbkFyZ3MucHVzaChuZXcgRm5Bcmcoc3RhcnRJbmRleCwgbnVsbCkpO1xuXG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMobWV0aG9kLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuXG4gICAgcmV0dXJuIHJlbmRlclZpZXdXaXRoRnJhZ21lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBnaXZlbiB2aWV3IGFmdGVyIGl0IGhhcyBiZWVuIGRlaHlkcmF0ZWQgYW5kIGRldGFjaGVkXG4gICAqL1xuICBkZXN0cm95Vmlldyh2aWV3UmVmOiBSZW5kZXJWaWV3UmVmKSB7XG4gICAgdmFyIGZuQXJncyA9IFtuZXcgRm5Bcmcodmlld1JlZiwgUmVuZGVyVmlld1JlZildO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwiZGVzdHJveVZpZXdcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgICB0aGlzLl9yZW5kZXJWaWV3U3RvcmUucmVtb3ZlKHZpZXdSZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGEgZnJhZ21lbnQgYWZ0ZXIgYW5vdGhlciBmcmFnbWVudC5cbiAgICovXG4gIGF0dGFjaEZyYWdtZW50QWZ0ZXJGcmFnbWVudChwcmV2aW91c0ZyYWdtZW50UmVmOiBSZW5kZXJGcmFnbWVudFJlZixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50UmVmOiBSZW5kZXJGcmFnbWVudFJlZikge1xuICAgIHZhciBmbkFyZ3MgPSBbXG4gICAgICBuZXcgRm5BcmcocHJldmlvdXNGcmFnbWVudFJlZiwgUmVuZGVyRnJhZ21lbnRSZWYpLFxuICAgICAgbmV3IEZuQXJnKGZyYWdtZW50UmVmLCBSZW5kZXJGcmFnbWVudFJlZilcbiAgICBdO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwiYXR0YWNoRnJhZ21lbnRBZnRlckZyYWdtZW50XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgYSBmcmFnbWVudCBhZnRlciBhbiBlbGVtZW50LlxuICAgKi9cbiAgYXR0YWNoRnJhZ21lbnRBZnRlckVsZW1lbnQoZWxlbWVudFJlZjogUmVuZGVyRWxlbWVudFJlZiwgZnJhZ21lbnRSZWY6IFJlbmRlckZyYWdtZW50UmVmKSB7XG4gICAgdmFyIGZuQXJncyA9XG4gICAgICAgIFtuZXcgRm5BcmcoZWxlbWVudFJlZiwgV2ViV29ya2VyRWxlbWVudFJlZiksIG5ldyBGbkFyZyhmcmFnbWVudFJlZiwgUmVuZGVyRnJhZ21lbnRSZWYpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImF0dGFjaEZyYWdtZW50QWZ0ZXJFbGVtZW50XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgYSBmcmFnbWVudC5cbiAgICovXG4gIGRldGFjaEZyYWdtZW50KGZyYWdtZW50UmVmOiBSZW5kZXJGcmFnbWVudFJlZikge1xuICAgIHZhciBmbkFyZ3MgPSBbbmV3IEZuQXJnKGZyYWdtZW50UmVmLCBSZW5kZXJGcmFnbWVudFJlZildO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwiZGV0YWNoRnJhZ21lbnRcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIeWRyYXRlcyBhIHZpZXcgYWZ0ZXIgaXQgaGFzIGJlZW4gYXR0YWNoZWQuIEh5ZHJhdGlvbi9kZWh5ZHJhdGlvbiBpcyB1c2VkIGZvciByZXVzaW5nIHZpZXdzXG4gICAqIGluc2lkZSBvZiB0aGUgdmlldyBwb29sLlxuICAgKi9cbiAgaHlkcmF0ZVZpZXcodmlld1JlZjogUmVuZGVyVmlld1JlZikge1xuICAgIHZhciBmbkFyZ3MgPSBbbmV3IEZuQXJnKHZpZXdSZWYsIFJlbmRlclZpZXdSZWYpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImh5ZHJhdGVWaWV3XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogRGVoeWRyYXRlcyBhIHZpZXcgYWZ0ZXIgaXQgaGFzIGJlZW4gYXR0YWNoZWQuIEh5ZHJhdGlvbi9kZWh5ZHJhdGlvbiBpcyB1c2VkIGZvciByZXVzaW5nIHZpZXdzXG4gICAqIGluc2lkZSBvZiB0aGUgdmlldyBwb29sLlxuICAgKi9cbiAgZGVoeWRyYXRlVmlldyh2aWV3UmVmOiBSZW5kZXJWaWV3UmVmKSB7XG4gICAgdmFyIGZuQXJncyA9IFtuZXcgRm5Bcmcodmlld1JlZiwgUmVuZGVyVmlld1JlZildO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwiZGVoeWRyYXRlVmlld1wiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG5hdGl2ZSBlbGVtZW50IGF0IHRoZSBnaXZlbiBsb2NhdGlvbi5cbiAgICogQXR0ZW50aW9uOiBJbiBhIFdlYldvcmtlciBzY2VuYXJpbywgdGhpcyBzaG91bGQgYWx3YXlzIHJldHVybiBudWxsIVxuICAgKi9cbiAgZ2V0TmF0aXZlRWxlbWVudFN5bmMobG9jYXRpb246IFJlbmRlckVsZW1lbnRSZWYpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgcHJvcGVydHkgb24gYW4gZWxlbWVudC5cbiAgICovXG4gIHNldEVsZW1lbnRQcm9wZXJ0eShsb2NhdGlvbjogUmVuZGVyRWxlbWVudFJlZiwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHByb3BlcnR5VmFsdWU6IGFueSkge1xuICAgIHZhciBmbkFyZ3MgPSBbXG4gICAgICBuZXcgRm5BcmcobG9jYXRpb24sIFdlYldvcmtlckVsZW1lbnRSZWYpLFxuICAgICAgbmV3IEZuQXJnKHByb3BlcnR5TmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcocHJvcGVydHlWYWx1ZSwgbnVsbClcbiAgICBdO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwic2V0RWxlbWVudFByb3BlcnR5XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb24gYW4gZWxlbWVudC5cbiAgICovXG4gIHNldEVsZW1lbnRBdHRyaWJ1dGUobG9jYXRpb246IFJlbmRlckVsZW1lbnRSZWYsIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgYXR0cmlidXRlVmFsdWU6IHN0cmluZykge1xuICAgIHZhciBmbkFyZ3MgPSBbXG4gICAgICBuZXcgRm5BcmcobG9jYXRpb24sIFdlYldvcmtlckVsZW1lbnRSZWYpLFxuICAgICAgbmV3IEZuQXJnKGF0dHJpYnV0ZU5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKGF0dHJpYnV0ZVZhbHVlLCBudWxsKVxuICAgIF07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJzZXRFbGVtZW50QXR0cmlidXRlXCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIGNsYXNzIG9uIGFuIGVsZW1lbnQuXG4gICAqL1xuICBzZXRFbGVtZW50Q2xhc3MobG9jYXRpb246IFJlbmRlckVsZW1lbnRSZWYsIGNsYXNzTmFtZTogc3RyaW5nLCBpc0FkZDogYm9vbGVhbikge1xuICAgIHZhciBmbkFyZ3MgPSBbXG4gICAgICBuZXcgRm5BcmcobG9jYXRpb24sIFdlYldvcmtlckVsZW1lbnRSZWYpLFxuICAgICAgbmV3IEZuQXJnKGNsYXNzTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcoaXNBZGQsIG51bGwpXG4gICAgXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInNldEVsZW1lbnRDbGFzc1wiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBzdHlsZSBvbiBhbiBlbGVtZW50LlxuICAgKi9cbiAgc2V0RWxlbWVudFN0eWxlKGxvY2F0aW9uOiBSZW5kZXJFbGVtZW50UmVmLCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdmFyIGZuQXJncyA9IFtcbiAgICAgIG5ldyBGbkFyZyhsb2NhdGlvbiwgV2ViV29ya2VyRWxlbWVudFJlZiksXG4gICAgICBuZXcgRm5Bcmcoc3R5bGVOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhzdHlsZVZhbHVlLCBudWxsKVxuICAgIF07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJzZXRFbGVtZW50U3R5bGVcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBhIG1ldGhvZCBvbiBhbiBlbGVtZW50LlxuICAgKiBOb3RlOiBGb3Igbm93IHdlJ3JlIGFzc3VtaW5nIHRoYXQgZXZlcnl0aGluZyBpbiB0aGUgYXJncyBsaXN0IGFyZSBwcmltaXRpdmVcbiAgICovXG4gIGludm9rZUVsZW1lbnRNZXRob2QobG9jYXRpb246IFJlbmRlckVsZW1lbnRSZWYsIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pIHtcbiAgICB2YXIgZm5BcmdzID0gW1xuICAgICAgbmV3IEZuQXJnKGxvY2F0aW9uLCBXZWJXb3JrZXJFbGVtZW50UmVmKSxcbiAgICAgIG5ldyBGbkFyZyhtZXRob2ROYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhhcmdzLCBudWxsKVxuICAgIF07XG4gICAgdmFyIHVpQXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImludm9rZUVsZW1lbnRNZXRob2RcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZSh1aUFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgdGV4dCBub2RlLlxuICAgKi9cbiAgc2V0VGV4dCh2aWV3UmVmOiBSZW5kZXJWaWV3UmVmLCB0ZXh0Tm9kZUluZGV4OiBudW1iZXIsIHRleHQ6IHN0cmluZykge1xuICAgIHZhciBmbkFyZ3MgPVxuICAgICAgICBbbmV3IEZuQXJnKHZpZXdSZWYsIFJlbmRlclZpZXdSZWYpLCBuZXcgRm5BcmcodGV4dE5vZGVJbmRleCwgbnVsbCksIG5ldyBGbkFyZyh0ZXh0LCBudWxsKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJzZXRUZXh0XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGlzcGF0Y2hlciBmb3IgYWxsIGV2ZW50cyBvZiB0aGUgZ2l2ZW4gdmlld1xuICAgKi9cbiAgc2V0RXZlbnREaXNwYXRjaGVyKHZpZXdSZWY6IFJlbmRlclZpZXdSZWYsIGRpc3BhdGNoZXI6IFJlbmRlckV2ZW50RGlzcGF0Y2hlcikge1xuICAgIHZhciBmbkFyZ3MgPSBbbmV3IEZuQXJnKHZpZXdSZWYsIFJlbmRlclZpZXdSZWYpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInNldEV2ZW50RGlzcGF0Y2hlclwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX2V2ZW50RGlzcGF0Y2hlci5yZWdpc3RlckV2ZW50RGlzcGF0Y2hlcih2aWV3UmVmLCBkaXNwYXRjaGVyKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxufVxuIl19