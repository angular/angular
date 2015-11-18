'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var api_1 = require('./api');
var DefaultProtoViewRef = (function (_super) {
    __extends(DefaultProtoViewRef, _super);
    function DefaultProtoViewRef(template, cmds) {
        _super.call(this);
        this.template = template;
        this.cmds = cmds;
    }
    return DefaultProtoViewRef;
})(api_1.RenderProtoViewRef);
exports.DefaultProtoViewRef = DefaultProtoViewRef;
var DefaultRenderFragmentRef = (function (_super) {
    __extends(DefaultRenderFragmentRef, _super);
    function DefaultRenderFragmentRef(nodes) {
        _super.call(this);
        this.nodes = nodes;
    }
    return DefaultRenderFragmentRef;
})(api_1.RenderFragmentRef);
exports.DefaultRenderFragmentRef = DefaultRenderFragmentRef;
var DefaultRenderView = (function (_super) {
    __extends(DefaultRenderView, _super);
    function DefaultRenderView(fragments, boundTextNodes, boundElements, nativeShadowRoots, globalEventAdders, rootContentInsertionPoints) {
        _super.call(this);
        this.fragments = fragments;
        this.boundTextNodes = boundTextNodes;
        this.boundElements = boundElements;
        this.nativeShadowRoots = nativeShadowRoots;
        this.globalEventAdders = globalEventAdders;
        this.rootContentInsertionPoints = rootContentInsertionPoints;
        this.hydrated = false;
        this.eventDispatcher = null;
        this.globalEventRemovers = null;
    }
    DefaultRenderView.prototype.hydrate = function () {
        if (this.hydrated)
            throw new exceptions_1.BaseException('The view is already hydrated.');
        this.hydrated = true;
        this.globalEventRemovers = collection_1.ListWrapper.createFixedSize(this.globalEventAdders.length);
        for (var i = 0; i < this.globalEventAdders.length; i++) {
            this.globalEventRemovers[i] = this.globalEventAdders[i]();
        }
    };
    DefaultRenderView.prototype.dehydrate = function () {
        if (!this.hydrated)
            throw new exceptions_1.BaseException('The view is already dehydrated.');
        for (var i = 0; i < this.globalEventRemovers.length; i++) {
            this.globalEventRemovers[i]();
        }
        this.globalEventRemovers = null;
        this.hydrated = false;
    };
    DefaultRenderView.prototype.setEventDispatcher = function (dispatcher) { this.eventDispatcher = dispatcher; };
    DefaultRenderView.prototype.dispatchRenderEvent = function (boundElementIndex, eventName, event) {
        var allowDefaultBehavior = true;
        if (lang_1.isPresent(this.eventDispatcher)) {
            var locals = new collection_1.Map();
            locals.set('$event', event);
            allowDefaultBehavior =
                this.eventDispatcher.dispatchRenderEvent(boundElementIndex, eventName, locals);
        }
        return allowDefaultBehavior;
    };
    return DefaultRenderView;
})(api_1.RenderViewRef);
exports.DefaultRenderView = DefaultRenderView;
//# sourceMappingURL=view.js.map