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
    WebWorkerRenderer.prototype.setBindingDebugInfo = function (location, propertyName, propertyValue) {
        var fnArgs = [
            new client_message_broker_1.FnArg(location, api_2.WebWorkerElementRef),
            new client_message_broker_1.FnArg(propertyName, null),
            new client_message_broker_1.FnArg(propertyValue, null)
        ];
        var args = new client_message_broker_1.UiArguments("setBindingDebugInfo", fnArgs);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclJlbmRlcmVyIiwiV2ViV29ya2VyUmVuZGVyZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJSZW5kZXJlci5yZWdpc3RlckNvbXBvbmVudFRlbXBsYXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlUHJvdG9WaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlUm9vdEhvc3RWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlVmlldyIsIldlYldvcmtlclJlbmRlcmVyLl9jcmVhdGVWaWV3SGVscGVyIiwiV2ViV29ya2VyUmVuZGVyZXIuZGVzdHJveVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hGcmFnbWVudEFmdGVyRnJhZ21lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hGcmFnbWVudEFmdGVyRWxlbWVudCIsIldlYldvcmtlclJlbmRlcmVyLmRldGFjaEZyYWdtZW50IiwiV2ViV29ya2VyUmVuZGVyZXIuaHlkcmF0ZVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5kZWh5ZHJhdGVWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuZ2V0TmF0aXZlRWxlbWVudFN5bmMiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50QXR0cmlidXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0QmluZGluZ0RlYnVnSW5mbyIsIldlYldvcmtlclJlbmRlcmVyLnNldEVsZW1lbnRDbGFzcyIsIldlYldvcmtlclJlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSIsIldlYldvcmtlclJlbmRlcmVyLmludm9rZUVsZW1lbnRNZXRob2QiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRUZXh0IiwiV2ViV29ya2VyUmVu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LHlCQUFpQixvQkErTzdCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZW5kZXJlcixcbiAgUmVuZGVyUHJvdG9WaWV3UmVmLFxuICBSZW5kZXJWaWV3UmVmLFxuICBSZW5kZXJFbGVtZW50UmVmLFxuICBSZW5kZXJFdmVudERpc3BhdGNoZXIsXG4gIFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzLFxuICBSZW5kZXJGcmFnbWVudFJlZixcbiAgUmVuZGVyVGVtcGxhdGVDbWQsXG4gIFJlbmRlckNvbXBvbmVudFRlbXBsYXRlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtcbiAgQ2xpZW50TWVzc2FnZUJyb2tlcixcbiAgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnksXG4gIEZuQXJnLFxuICBVaUFyZ3VtZW50c1xufSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXJcIjtcbmltcG9ydCB7aXNQcmVzZW50LCBwcmludH0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmltcG9ydCB7UmVuZGVyUHJvdG9WaWV3UmVmU3RvcmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvcmVuZGVyX3Byb3RvX3ZpZXdfcmVmX3N0b3JlJztcbmltcG9ydCB7XG4gIFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUsXG4gIFdlYldvcmtlclJlbmRlclZpZXdSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfdmlld193aXRoX2ZyYWdtZW50c19zdG9yZSc7XG5pbXBvcnQge1dlYldvcmtlckVsZW1lbnRSZWYsIFdlYldvcmtlclRlbXBsYXRlQ21kfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL2FwaSc7XG5pbXBvcnQge1JFTkRFUkVSX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5pbXBvcnQge1dlYldvcmtlckV2ZW50RGlzcGF0Y2hlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3dvcmtlci9ldmVudF9kaXNwYXRjaGVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclJlbmRlcmVyIGltcGxlbWVudHMgUmVuZGVyZXIge1xuICBwcml2YXRlIF9tZXNzYWdlQnJva2VyO1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlQnJva2VyRmFjdG9yeTogQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnksXG4gICAgICAgICAgICAgIHByaXZhdGUgX3JlbmRlclByb3RvVmlld1JlZlN0b3JlOiBSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcmVuZGVyVmlld1N0b3JlOiBSZW5kZXJWaWV3V2l0aEZyYWdtZW50c1N0b3JlLFxuICAgICAgICAgICAgICBwcml2YXRlIF9ldmVudERpc3BhdGNoZXI6IFdlYldvcmtlckV2ZW50RGlzcGF0Y2hlcikge1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIgPSBtZXNzYWdlQnJva2VyRmFjdG9yeS5jcmVhdGVNZXNzYWdlQnJva2VyKFJFTkRFUkVSX0NIQU5ORUwpO1xuICB9XG5cbiAgcmVnaXN0ZXJDb21wb25lbnRUZW1wbGF0ZSh0ZW1wbGF0ZTogUmVuZGVyQ29tcG9uZW50VGVtcGxhdGUpIHtcbiAgICB2YXIgZm5BcmdzID0gW25ldyBGbkFyZyh0ZW1wbGF0ZSwgUmVuZGVyQ29tcG9uZW50VGVtcGxhdGUpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInJlZ2lzdGVyQ29tcG9uZW50VGVtcGxhdGVcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIGNyZWF0ZVByb3RvVmlldyhjb21wb25lbnRUZW1wbGF0ZUlkOiBzdHJpbmcsIGNtZHM6IFJlbmRlclRlbXBsYXRlQ21kW10pOiBSZW5kZXJQcm90b1ZpZXdSZWYge1xuICAgIHZhciByZW5kZXJQcm90b1ZpZXdSZWYgPSB0aGlzLl9yZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5hbGxvY2F0ZSgpO1xuXG4gICAgdmFyIGZuQXJnczogRm5BcmdbXSA9IFtcbiAgICAgIG5ldyBGbkFyZyhjb21wb25lbnRUZW1wbGF0ZUlkLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhjbWRzLCBXZWJXb3JrZXJUZW1wbGF0ZUNtZCksXG4gICAgICBuZXcgRm5BcmcocmVuZGVyUHJvdG9WaWV3UmVmLCBSZW5kZXJQcm90b1ZpZXdSZWYpXG4gICAgXTtcbiAgICB2YXIgYXJnczogVWlBcmd1bWVudHMgPSBuZXcgVWlBcmd1bWVudHMoXCJjcmVhdGVQcm90b1ZpZXdcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgICByZXR1cm4gcmVuZGVyUHJvdG9WaWV3UmVmO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSByb290IGhvc3QgdmlldyB0aGF0IGluY2x1ZGVzIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBOb3RlIHRoYXQgdGhlIGZyYWdtZW50Q291bnQgbmVlZHMgdG8gYmUgcGFzc2VkIGluIHNvIHRoYXQgd2UgY2FuIGNyZWF0ZSBhIHJlc3VsdFxuICAgKiBzeW5jaHJvbm91c2x5IGV2ZW4gd2hlbiBkZWFsaW5nIHdpdGggd2Vid29ya2VycyFcbiAgICpcbiAgICogQHBhcmFtIHtSZW5kZXJQcm90b1ZpZXdSZWZ9IGhvc3RQcm90b1ZpZXdSZWYgYSBSZW5kZXJQcm90b1ZpZXdSZWYgb2YgdHlwZVxuICAgKiBQcm90b1ZpZXdEdG8uSE9TVF9WSUVXX1RZUEVcbiAgICogQHBhcmFtIHthbnl9IGhvc3RFbGVtZW50U2VsZWN0b3IgY3NzIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50ICh3aWxsIGJlIHF1ZXJpZWQgYWdhaW5zdCB0aGVcbiAgICogbWFpbiBkb2N1bWVudClcbiAgICogQHJldHVybiB7UmVuZGVyVmlld1JlZn0gdGhlIGNyZWF0ZWQgdmlld1xuICAgKi9cbiAgY3JlYXRlUm9vdEhvc3RWaWV3KGhvc3RQcm90b1ZpZXdSZWY6IFJlbmRlclByb3RvVmlld1JlZiwgZnJhZ21lbnRDb3VudDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgaG9zdEVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nKTogUmVuZGVyVmlld1dpdGhGcmFnbWVudHMge1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVWaWV3SGVscGVyKGhvc3RQcm90b1ZpZXdSZWYsIGZyYWdtZW50Q291bnQsIGhvc3RFbGVtZW50U2VsZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSByZWd1bGFyIHZpZXcgb3V0IG9mIHRoZSBnaXZlbiBQcm90b1ZpZXdcbiAgICogTm90ZSB0aGF0IHRoZSBmcmFnbWVudENvdW50IG5lZWRzIHRvIGJlIHBhc3NlZCBpbiBzbyB0aGF0IHdlIGNhbiBjcmVhdGUgYSByZXN1bHRcbiAgICogc3luY2hyb25vdXNseSBldmVuIHdoZW4gZGVhbGluZyB3aXRoIHdlYndvcmtlcnMhXG4gICAqL1xuICBjcmVhdGVWaWV3KHByb3RvVmlld1JlZjogUmVuZGVyUHJvdG9WaWV3UmVmLCBmcmFnbWVudENvdW50OiBudW1iZXIpOiBSZW5kZXJWaWV3V2l0aEZyYWdtZW50cyB7XG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVZpZXdIZWxwZXIocHJvdG9WaWV3UmVmLCBmcmFnbWVudENvdW50KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVZpZXdIZWxwZXIocHJvdG9WaWV3UmVmOiBSZW5kZXJQcm90b1ZpZXdSZWYsIGZyYWdtZW50Q291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0RWxlbWVudFNlbGVjdG9yPzogc3RyaW5nKTogUmVuZGVyVmlld1dpdGhGcmFnbWVudHMge1xuICAgIHZhciByZW5kZXJWaWV3V2l0aEZyYWdtZW50cyA9IHRoaXMuX3JlbmRlclZpZXdTdG9yZS5hbGxvY2F0ZShmcmFnbWVudENvdW50KTtcblxuICAgIHZhciBzdGFydEluZGV4ID0gKDxXZWJXb3JrZXJSZW5kZXJWaWV3UmVmPihyZW5kZXJWaWV3V2l0aEZyYWdtZW50cy52aWV3UmVmKSkucmVmTnVtYmVyO1xuICAgIHZhciBmbkFyZ3M6IEZuQXJnW10gPSBbXG4gICAgICBuZXcgRm5BcmcocHJvdG9WaWV3UmVmLCBSZW5kZXJQcm90b1ZpZXdSZWYpLFxuICAgICAgbmV3IEZuQXJnKGZyYWdtZW50Q291bnQsIG51bGwpLFxuICAgIF07XG4gICAgdmFyIG1ldGhvZCA9IFwiY3JlYXRlVmlld1wiO1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdEVsZW1lbnRTZWxlY3RvcikgJiYgaG9zdEVsZW1lbnRTZWxlY3RvciAhPSBudWxsKSB7XG4gICAgICBmbkFyZ3MucHVzaChuZXcgRm5BcmcoaG9zdEVsZW1lbnRTZWxlY3RvciwgbnVsbCkpO1xuICAgICAgbWV0aG9kID0gXCJjcmVhdGVSb290SG9zdFZpZXdcIjtcbiAgICB9XG4gICAgZm5BcmdzLnB1c2gobmV3IEZuQXJnKHN0YXJ0SW5kZXgsIG51bGwpKTtcblxuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKG1ldGhvZCwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcblxuICAgIHJldHVybiByZW5kZXJWaWV3V2l0aEZyYWdtZW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgZ2l2ZW4gdmlldyBhZnRlciBpdCBoYXMgYmVlbiBkZWh5ZHJhdGVkIGFuZCBkZXRhY2hlZFxuICAgKi9cbiAgZGVzdHJveVZpZXcodmlld1JlZjogUmVuZGVyVmlld1JlZikge1xuICAgIHZhciBmbkFyZ3MgPSBbbmV3IEZuQXJnKHZpZXdSZWYsIFJlbmRlclZpZXdSZWYpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImRlc3Ryb3lWaWV3XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gICAgdGhpcy5fcmVuZGVyVmlld1N0b3JlLnJlbW92ZSh2aWV3UmVmKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBhIGZyYWdtZW50IGFmdGVyIGFub3RoZXIgZnJhZ21lbnQuXG4gICAqL1xuICBhdHRhY2hGcmFnbWVudEFmdGVyRnJhZ21lbnQocHJldmlvdXNGcmFnbWVudFJlZjogUmVuZGVyRnJhZ21lbnRSZWYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudFJlZjogUmVuZGVyRnJhZ21lbnRSZWYpIHtcbiAgICB2YXIgZm5BcmdzID0gW1xuICAgICAgbmV3IEZuQXJnKHByZXZpb3VzRnJhZ21lbnRSZWYsIFJlbmRlckZyYWdtZW50UmVmKSxcbiAgICAgIG5ldyBGbkFyZyhmcmFnbWVudFJlZiwgUmVuZGVyRnJhZ21lbnRSZWYpXG4gICAgXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImF0dGFjaEZyYWdtZW50QWZ0ZXJGcmFnbWVudFwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIGEgZnJhZ21lbnQgYWZ0ZXIgYW4gZWxlbWVudC5cbiAgICovXG4gIGF0dGFjaEZyYWdtZW50QWZ0ZXJFbGVtZW50KGVsZW1lbnRSZWY6IFJlbmRlckVsZW1lbnRSZWYsIGZyYWdtZW50UmVmOiBSZW5kZXJGcmFnbWVudFJlZikge1xuICAgIHZhciBmbkFyZ3MgPVxuICAgICAgICBbbmV3IEZuQXJnKGVsZW1lbnRSZWYsIFdlYldvcmtlckVsZW1lbnRSZWYpLCBuZXcgRm5BcmcoZnJhZ21lbnRSZWYsIFJlbmRlckZyYWdtZW50UmVmKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJhdHRhY2hGcmFnbWVudEFmdGVyRWxlbWVudFwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGFjaGVzIGEgZnJhZ21lbnQuXG4gICAqL1xuICBkZXRhY2hGcmFnbWVudChmcmFnbWVudFJlZjogUmVuZGVyRnJhZ21lbnRSZWYpIHtcbiAgICB2YXIgZm5BcmdzID0gW25ldyBGbkFyZyhmcmFnbWVudFJlZiwgUmVuZGVyRnJhZ21lbnRSZWYpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImRldGFjaEZyYWdtZW50XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogSHlkcmF0ZXMgYSB2aWV3IGFmdGVyIGl0IGhhcyBiZWVuIGF0dGFjaGVkLiBIeWRyYXRpb24vZGVoeWRyYXRpb24gaXMgdXNlZCBmb3IgcmV1c2luZyB2aWV3c1xuICAgKiBpbnNpZGUgb2YgdGhlIHZpZXcgcG9vbC5cbiAgICovXG4gIGh5ZHJhdGVWaWV3KHZpZXdSZWY6IFJlbmRlclZpZXdSZWYpIHtcbiAgICB2YXIgZm5BcmdzID0gW25ldyBGbkFyZyh2aWV3UmVmLCBSZW5kZXJWaWV3UmVmKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJoeWRyYXRlVmlld1wiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlaHlkcmF0ZXMgYSB2aWV3IGFmdGVyIGl0IGhhcyBiZWVuIGF0dGFjaGVkLiBIeWRyYXRpb24vZGVoeWRyYXRpb24gaXMgdXNlZCBmb3IgcmV1c2luZyB2aWV3c1xuICAgKiBpbnNpZGUgb2YgdGhlIHZpZXcgcG9vbC5cbiAgICovXG4gIGRlaHlkcmF0ZVZpZXcodmlld1JlZjogUmVuZGVyVmlld1JlZikge1xuICAgIHZhciBmbkFyZ3MgPSBbbmV3IEZuQXJnKHZpZXdSZWYsIFJlbmRlclZpZXdSZWYpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImRlaHlkcmF0ZVZpZXdcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuYXRpdmUgZWxlbWVudCBhdCB0aGUgZ2l2ZW4gbG9jYXRpb24uXG4gICAqIEF0dGVudGlvbjogSW4gYSBXZWJXb3JrZXIgc2NlbmFyaW8sIHRoaXMgc2hvdWxkIGFsd2F5cyByZXR1cm4gbnVsbCFcbiAgICovXG4gIGdldE5hdGl2ZUVsZW1lbnRTeW5jKGxvY2F0aW9uOiBSZW5kZXJFbGVtZW50UmVmKTogYW55IHsgcmV0dXJuIG51bGw7IH1cblxuICAvKipcbiAgICogU2V0cyBhIHByb3BlcnR5IG9uIGFuIGVsZW1lbnQuXG4gICAqL1xuICBzZXRFbGVtZW50UHJvcGVydHkobG9jYXRpb246IFJlbmRlckVsZW1lbnRSZWYsIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBhbnkpIHtcbiAgICB2YXIgZm5BcmdzID0gW1xuICAgICAgbmV3IEZuQXJnKGxvY2F0aW9uLCBXZWJXb3JrZXJFbGVtZW50UmVmKSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eU5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKHByb3BlcnR5VmFsdWUsIG51bGwpXG4gICAgXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInNldEVsZW1lbnRQcm9wZXJ0eVwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYW4gYXR0cmlidXRlIG9uIGFuIGVsZW1lbnQuXG4gICAqL1xuICBzZXRFbGVtZW50QXR0cmlidXRlKGxvY2F0aW9uOiBSZW5kZXJFbGVtZW50UmVmLCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZVZhbHVlOiBzdHJpbmcpIHtcbiAgICB2YXIgZm5BcmdzID0gW1xuICAgICAgbmV3IEZuQXJnKGxvY2F0aW9uLCBXZWJXb3JrZXJFbGVtZW50UmVmKSxcbiAgICAgIG5ldyBGbkFyZyhhdHRyaWJ1dGVOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhhdHRyaWJ1dGVWYWx1ZSwgbnVsbClcbiAgICBdO1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwic2V0RWxlbWVudEF0dHJpYnV0ZVwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgc2V0QmluZGluZ0RlYnVnSW5mbyhsb2NhdGlvbjogUmVuZGVyRWxlbWVudFJlZiwgcHJvcGVydHlOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdmFyIGZuQXJncyA9IFtcbiAgICAgIG5ldyBGbkFyZyhsb2NhdGlvbiwgV2ViV29ya2VyRWxlbWVudFJlZiksXG4gICAgICBuZXcgRm5BcmcocHJvcGVydHlOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eVZhbHVlLCBudWxsKVxuICAgIF07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJzZXRCaW5kaW5nRGVidWdJbmZvXCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIGNsYXNzIG9uIGFuIGVsZW1lbnQuXG4gICAqL1xuICBzZXRFbGVtZW50Q2xhc3MobG9jYXRpb246IFJlbmRlckVsZW1lbnRSZWYsIGNsYXNzTmFtZTogc3RyaW5nLCBpc0FkZDogYm9vbGVhbikge1xuICAgIHZhciBmbkFyZ3MgPSBbXG4gICAgICBuZXcgRm5BcmcobG9jYXRpb24sIFdlYldvcmtlckVsZW1lbnRSZWYpLFxuICAgICAgbmV3IEZuQXJnKGNsYXNzTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5BcmcoaXNBZGQsIG51bGwpXG4gICAgXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInNldEVsZW1lbnRDbGFzc1wiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBzdHlsZSBvbiBhbiBlbGVtZW50LlxuICAgKi9cbiAgc2V0RWxlbWVudFN0eWxlKGxvY2F0aW9uOiBSZW5kZXJFbGVtZW50UmVmLCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdmFyIGZuQXJncyA9IFtcbiAgICAgIG5ldyBGbkFyZyhsb2NhdGlvbiwgV2ViV29ya2VyRWxlbWVudFJlZiksXG4gICAgICBuZXcgRm5Bcmcoc3R5bGVOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhzdHlsZVZhbHVlLCBudWxsKVxuICAgIF07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJzZXRFbGVtZW50U3R5bGVcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBhIG1ldGhvZCBvbiBhbiBlbGVtZW50LlxuICAgKiBOb3RlOiBGb3Igbm93IHdlJ3JlIGFzc3VtaW5nIHRoYXQgZXZlcnl0aGluZyBpbiB0aGUgYXJncyBsaXN0IGFyZSBwcmltaXRpdmVcbiAgICovXG4gIGludm9rZUVsZW1lbnRNZXRob2QobG9jYXRpb246IFJlbmRlckVsZW1lbnRSZWYsIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pIHtcbiAgICB2YXIgZm5BcmdzID0gW1xuICAgICAgbmV3IEZuQXJnKGxvY2F0aW9uLCBXZWJXb3JrZXJFbGVtZW50UmVmKSxcbiAgICAgIG5ldyBGbkFyZyhtZXRob2ROYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhhcmdzLCBudWxsKVxuICAgIF07XG4gICAgdmFyIHVpQXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImludm9rZUVsZW1lbnRNZXRob2RcIiwgZm5BcmdzKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZSh1aUFyZ3MsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgdGV4dCBub2RlLlxuICAgKi9cbiAgc2V0VGV4dCh2aWV3UmVmOiBSZW5kZXJWaWV3UmVmLCB0ZXh0Tm9kZUluZGV4OiBudW1iZXIsIHRleHQ6IHN0cmluZykge1xuICAgIHZhciBmbkFyZ3MgPVxuICAgICAgICBbbmV3IEZuQXJnKHZpZXdSZWYsIFJlbmRlclZpZXdSZWYpLCBuZXcgRm5BcmcodGV4dE5vZGVJbmRleCwgbnVsbCksIG5ldyBGbkFyZyh0ZXh0LCBudWxsKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJzZXRUZXh0XCIsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGlzcGF0Y2hlciBmb3IgYWxsIGV2ZW50cyBvZiB0aGUgZ2l2ZW4gdmlld1xuICAgKi9cbiAgc2V0RXZlbnREaXNwYXRjaGVyKHZpZXdSZWY6IFJlbmRlclZpZXdSZWYsIGRpc3BhdGNoZXI6IFJlbmRlckV2ZW50RGlzcGF0Y2hlcikge1xuICAgIHZhciBmbkFyZ3MgPSBbbmV3IEZuQXJnKHZpZXdSZWYsIFJlbmRlclZpZXdSZWYpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInNldEV2ZW50RGlzcGF0Y2hlclwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX2V2ZW50RGlzcGF0Y2hlci5yZWdpc3RlckV2ZW50RGlzcGF0Y2hlcih2aWV3UmVmLCBkaXNwYXRjaGVyKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxufVxuIl19