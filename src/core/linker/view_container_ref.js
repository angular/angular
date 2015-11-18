'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
var view_ref_1 = require('./view_ref');
/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createHostView}, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via
 * {@link AppViewManager#getViewContainer}.
 *
 * <!-- TODO(i): we are also considering ElementRef#viewContainer api -->
 */
var ViewContainerRef = (function () {
    function ViewContainerRef() {
    }
    /**
     * Destroys all Views in this container.
     */
    ViewContainerRef.prototype.clear = function () {
        for (var i = this.length - 1; i >= 0; i--) {
            this.remove(i);
        }
    };
    Object.defineProperty(ViewContainerRef.prototype, "length", {
        /**
         * Returns the number of Views currently attached to this container.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return ViewContainerRef;
})();
exports.ViewContainerRef = ViewContainerRef;
var ViewContainerRef_ = (function (_super) {
    __extends(ViewContainerRef_, _super);
    function ViewContainerRef_(viewManager, element) {
        _super.call(this);
        this.viewManager = viewManager;
        this.element = element;
    }
    ViewContainerRef_.prototype._getViews = function () {
        var element = this.element;
        var vc = view_ref_1.internalView(element.parentView).viewContainers[element.boundElementIndex];
        return lang_1.isPresent(vc) ? vc.views : [];
    };
    ViewContainerRef_.prototype.get = function (index) { return this._getViews()[index].ref; };
    Object.defineProperty(ViewContainerRef_.prototype, "length", {
        get: function () { return this._getViews().length; },
        enumerable: true,
        configurable: true
    });
    // TODO(rado): profile and decide whether bounds checks should be added
    // to the methods below.
    ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, index) {
        if (index === void 0) { index = -1; }
        if (index == -1)
            index = this.length;
        return this.viewManager.createEmbeddedViewInContainer(this.element, index, templateRef);
    };
    ViewContainerRef_.prototype.createHostView = function (protoViewRef, index, dynamicallyCreatedProviders) {
        if (protoViewRef === void 0) { protoViewRef = null; }
        if (index === void 0) { index = -1; }
        if (dynamicallyCreatedProviders === void 0) { dynamicallyCreatedProviders = null; }
        if (index == -1)
            index = this.length;
        return this.viewManager.createHostViewInContainer(this.element, index, protoViewRef, dynamicallyCreatedProviders);
    };
    // TODO(i): refactor insert+remove into move
    ViewContainerRef_.prototype.insert = function (viewRef, index) {
        if (index === void 0) { index = -1; }
        if (index == -1)
            index = this.length;
        return this.viewManager.attachViewInContainer(this.element, index, viewRef);
    };
    ViewContainerRef_.prototype.indexOf = function (viewRef) {
        return collection_1.ListWrapper.indexOf(this._getViews(), view_ref_1.internalView(viewRef));
    };
    // TODO(i): rename to destroy
    ViewContainerRef_.prototype.remove = function (index) {
        if (index === void 0) { index = -1; }
        if (index == -1)
            index = this.length - 1;
        this.viewManager.destroyViewInContainer(this.element, index);
        // view is intentionally not returned to the client.
    };
    // TODO(i): refactor insert+remove into move
    ViewContainerRef_.prototype.detach = function (index) {
        if (index === void 0) { index = -1; }
        if (index == -1)
            index = this.length - 1;
        return this.viewManager.detachViewInContainer(this.element, index);
    };
    return ViewContainerRef_;
})(ViewContainerRef);
exports.ViewContainerRef_ = ViewContainerRef_;
//# sourceMappingURL=view_container_ref.js.map