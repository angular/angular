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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3RlbXBsYXRlX3JlZi50cyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVJlZiIsIlRlbXBsYXRlUmVmLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVSZWZfIiwiVGVtcGxhdGVSZWZfLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVSZWZfLl9nZXRQcm90b1ZpZXciLCJUZW1wbGF0ZVJlZl8ucHJvdG9WaWV3UmVmIiwiVGVtcGxhdGVSZWZfLmhhc0xvY2FsIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHlCQUF5QyxZQUFZLENBQUMsQ0FBQTtBQUl0RDs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBQUFBO0lBbUJBQyxDQUFDQTtJQUFERCxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFuQkQsSUFtQkM7QUFuQnFCLG1CQUFXLGNBbUJoQyxDQUFBO0FBRUQ7SUFBa0NFLGdDQUFXQTtJQUMzQ0Esc0JBQVlBLFVBQXNCQTtRQUNoQ0MsaUJBQU9BLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBO0lBQy9CQSxDQUFDQTtJQUVPRCxvQ0FBYUEsR0FBckJBO1FBQ0VFLElBQUlBLFVBQVVBLEdBQWdCQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUM5Q0EsSUFBSUEsVUFBVUEsR0FBR0EsdUJBQVlBLENBQUNBLFVBQVVBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBQ3JEQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxjQUFjQSxDQUFDQSxVQUFVQSxDQUFDQSxpQkFBaUJBLEdBQUdBLFVBQVVBLENBQUNBLGFBQWFBLENBQUNBO2FBQzFGQSxlQUFlQSxDQUFDQTtJQUN2QkEsQ0FBQ0E7SUFNREYsc0JBQUlBLHNDQUFZQTtRQUpoQkE7OztXQUdHQTthQUNIQSxjQUFtQ0csTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUVyRUEsK0JBQVFBLEdBQVJBLFVBQVNBLElBQVlBO1FBQ25CSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQSx3QkFBd0JBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQ2pFQSxDQUFDQTtJQUNISixtQkFBQ0E7QUFBREEsQ0FBQ0EsQUF0QkQsRUFBa0MsV0FBVyxFQXNCNUM7QUF0Qlksb0JBQVksZUFzQnhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2ludGVybmFsVmlldywgUHJvdG9WaWV3UmVmfSBmcm9tICcuL3ZpZXdfcmVmJztcbmltcG9ydCB7RWxlbWVudFJlZiwgRWxlbWVudFJlZl99IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0ICogYXMgdmlld01vZHVsZSBmcm9tICcuL3ZpZXcnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gRW1iZWRkZWQgVGVtcGxhdGUgdGhhdCBjYW4gYmUgdXNlZCB0byBpbnN0YW50aWF0ZSBFbWJlZGRlZCBWaWV3cy5cbiAqXG4gKiBZb3UgY2FuIGFjY2VzcyBhIGBUZW1wbGF0ZVJlZmAsIGluIHR3byB3YXlzLiBWaWEgYSBkaXJlY3RpdmUgcGxhY2VkIG9uIGEgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgKG9yXG4gKiBkaXJlY3RpdmUgcHJlZml4ZWQgd2l0aCBgKmApIGFuZCBoYXZlIHRoZSBgVGVtcGxhdGVSZWZgIGZvciB0aGlzIEVtYmVkZGVkIFZpZXcgaW5qZWN0ZWQgaW50byB0aGVcbiAqIGNvbnN0cnVjdG9yIG9mIHRoZSBkaXJlY3RpdmUgdXNpbmcgdGhlIGBUZW1wbGF0ZVJlZmAgVG9rZW4uIEFsdGVybmF0aXZlbHkgeW91IGNhbiBxdWVyeSBmb3IgdGhlXG4gKiBgVGVtcGxhdGVSZWZgIGZyb20gYSBDb21wb25lbnQgb3IgYSBEaXJlY3RpdmUgdmlhIHtAbGluayBRdWVyeX0uXG4gKlxuICogVG8gaW5zdGFudGlhdGUgRW1iZWRkZWQgVmlld3MgYmFzZWQgb24gYSBUZW1wbGF0ZSwgdXNlXG4gKiB7QGxpbmsgVmlld0NvbnRhaW5lclJlZiNjcmVhdGVFbWJlZGRlZFZpZXd9LCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgVmlldyBhbmQgYXR0YWNoIGl0IHRvIHRoZVxuICogVmlldyBDb250YWluZXIuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUZW1wbGF0ZVJlZiB7XG4gIC8qKlxuICAgKiBUaGUgbG9jYXRpb24gaW4gdGhlIFZpZXcgd2hlcmUgdGhlIEVtYmVkZGVkIFZpZXcgbG9naWNhbGx5IGJlbG9uZ3MgdG8uXG4gICAqXG4gICAqIFRoZSBkYXRhLWJpbmRpbmcgYW5kIGluamVjdGlvbiBjb250ZXh0cyBvZiBFbWJlZGRlZCBWaWV3cyBjcmVhdGVkIGZyb20gdGhpcyBgVGVtcGxhdGVSZWZgXG4gICAqIGluaGVyaXQgZnJvbSB0aGUgY29udGV4dHMgb2YgdGhpcyBsb2NhdGlvbi5cbiAgICpcbiAgICogVHlwaWNhbGx5IG5ldyBFbWJlZGRlZCBWaWV3cyBhcmUgYXR0YWNoZWQgdG8gdGhlIFZpZXcgQ29udGFpbmVyIG9mIHRoaXMgbG9jYXRpb24sIGJ1dCBpblxuICAgKiBhZHZhbmNlZCB1c2UtY2FzZXMsIHRoZSBWaWV3IGNhbiBiZSBhdHRhY2hlZCB0byBhIGRpZmZlcmVudCBjb250YWluZXIgd2hpbGUga2VlcGluZyB0aGVcbiAgICogZGF0YS1iaW5kaW5nIGFuZCBpbmplY3Rpb24gY29udGV4dCBmcm9tIHRoZSBvcmlnaW5hbCBsb2NhdGlvbi5cbiAgICpcbiAgICovXG4gIC8vIFRPRE8oaSk6IHJlbmFtZSB0byBhbmNob3Igb3IgbG9jYXRpb25cbiAgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogQWxsb3dzIHlvdSB0byBjaGVjayBpZiB0aGlzIEVtYmVkZGVkIFRlbXBsYXRlIGRlZmluZXMgTG9jYWwgVmFyaWFibGUgd2l0aCBuYW1lIG1hdGNoaW5nIGBuYW1lYC5cbiAgICovXG4gIGFic3RyYWN0IGhhc0xvY2FsKG5hbWU6IHN0cmluZyk6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlZl8gZXh0ZW5kcyBUZW1wbGF0ZVJlZiB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZWxlbWVudFJlZiA9IGVsZW1lbnRSZWY7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQcm90b1ZpZXcoKTogdmlld01vZHVsZS5BcHBQcm90b1ZpZXcge1xuICAgIGxldCBlbGVtZW50UmVmID0gPEVsZW1lbnRSZWZfPnRoaXMuZWxlbWVudFJlZjtcbiAgICB2YXIgcGFyZW50VmlldyA9IGludGVybmFsVmlldyhlbGVtZW50UmVmLnBhcmVudFZpZXcpO1xuICAgIHJldHVybiBwYXJlbnRWaWV3LnByb3RvLmVsZW1lbnRCaW5kZXJzW2VsZW1lbnRSZWYuYm91bmRFbGVtZW50SW5kZXggLSBwYXJlbnRWaWV3LmVsZW1lbnRPZmZzZXRdXG4gICAgICAgIC5uZXN0ZWRQcm90b1ZpZXc7XG4gIH1cblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBQcm90b1ZpZXcgdXNlZCBmb3IgY3JlYXRpbmcgRW1iZWRkZWQgVmlld3MgdGhhdCBhcmUgYmFzZWQgb24gdGhlIGNvbXBpbGVkXG4gICAqIEVtYmVkZGVkIFRlbXBsYXRlLlxuICAgKi9cbiAgZ2V0IHByb3RvVmlld1JlZigpOiBQcm90b1ZpZXdSZWYgeyByZXR1cm4gdGhpcy5fZ2V0UHJvdG9WaWV3KCkucmVmOyB9XG5cbiAgaGFzTG9jYWwobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFByb3RvVmlldygpLnRlbXBsYXRlVmFyaWFibGVCaW5kaW5ncy5oYXMobmFtZSk7XG4gIH1cbn1cbiJdfQ==