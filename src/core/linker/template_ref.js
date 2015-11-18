'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var view_ref_1 = require('./view_ref');
/**
 * Represents an Embedded Template that can be used to instantiate Embedded Views.
 *
 * You can access a `TemplateRef`, in two ways. Via a directive placed on a `<template>` element (or
 * directive prefixed with `*`) and have the `TemplateRef` for this Embedded View injected into the
 * constructor of the directive using the `TemplateRef` Token. Alternatively you can query for the
 * `TemplateRef` from a Component or a Directive via {@link Query}.
 *
 * To instantiate Embedded Views based on a Template, use
 * {@link ViewContainerRef#createEmbeddedView}, which will create the View and attach it to the
 * View Container.
 */
var TemplateRef = (function () {
    function TemplateRef() {
    }
    return TemplateRef;
})();
exports.TemplateRef = TemplateRef;
var TemplateRef_ = (function (_super) {
    __extends(TemplateRef_, _super);
    function TemplateRef_(elementRef) {
        _super.call(this);
        this.elementRef = elementRef;
    }
    TemplateRef_.prototype._getProtoView = function () {
        var elementRef = this.elementRef;
        var parentView = view_ref_1.internalView(elementRef.parentView);
        return parentView.proto.elementBinders[elementRef.boundElementIndex - parentView.elementOffset]
            .nestedProtoView;
    };
    Object.defineProperty(TemplateRef_.prototype, "protoViewRef", {
        /**
         * Reference to the ProtoView used for creating Embedded Views that are based on the compiled
         * Embedded Template.
         */
        get: function () { return this._getProtoView().ref; },
        enumerable: true,
        configurable: true
    });
    TemplateRef_.prototype.hasLocal = function (name) {
        return this._getProtoView().templateVariableBindings.has(name);
    };
    return TemplateRef_;
})(TemplateRef);
exports.TemplateRef_ = TemplateRef_;
//# sourceMappingURL=template_ref.js.map