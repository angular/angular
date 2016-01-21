'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    Object.defineProperty(TemplateRef.prototype, "elementRef", {
        /**
         * The location in the View where the Embedded View logically belongs to.
         *
         * The data-binding and injection contexts of Embedded Views created from this `TemplateRef`
         * inherit from the contexts of this location.
         *
         * Typically new Embedded Views are attached to the View Container of this location, but in
         * advanced use-cases, the View can be attached to a different container while keeping the
         * data-binding and injection context from the original location.
         *
         */
        // TODO(i): rename to anchor or location
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    return TemplateRef;
})();
exports.TemplateRef = TemplateRef;
var TemplateRef_ = (function (_super) {
    __extends(TemplateRef_, _super);
    function TemplateRef_(_elementRef) {
        _super.call(this);
        this._elementRef = _elementRef;
    }
    Object.defineProperty(TemplateRef_.prototype, "elementRef", {
        get: function () { return this._elementRef; },
        enumerable: true,
        configurable: true
    });
    return TemplateRef_;
})(TemplateRef);
exports.TemplateRef_ = TemplateRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3RlbXBsYXRlX3JlZi50cyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVJlZiIsIlRlbXBsYXRlUmVmLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVSZWYuZWxlbWVudFJlZiIsIlRlbXBsYXRlUmVmXyIsIlRlbXBsYXRlUmVmXy5jb25zdHJ1Y3RvciIsIlRlbXBsYXRlUmVmXy5lbGVtZW50UmVmIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOzs7Ozs7Ozs7OztHQVdHO0FBQ0g7SUFBQUE7SUFjQUMsQ0FBQ0E7SUFEQ0Qsc0JBQUlBLG1DQUFVQTtRQVpkQTs7Ozs7Ozs7OztXQVVHQTtRQUNIQSx3Q0FBd0NBO2FBQ3hDQSxjQUErQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUMvQ0Esa0JBQUNBO0FBQURBLENBQUNBLEFBZEQsSUFjQztBQWRxQixtQkFBVyxjQWNoQyxDQUFBO0FBRUQ7SUFBa0NHLGdDQUFXQTtJQUMzQ0Esc0JBQW9CQSxXQUF3QkE7UUFBSUMsaUJBQU9BLENBQUNBO1FBQXBDQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBYUE7SUFBYUEsQ0FBQ0E7SUFFMURELHNCQUFJQSxvQ0FBVUE7YUFBZEEsY0FBZ0NFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFDNURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQUpELEVBQWtDLFdBQVcsRUFJNUM7QUFKWSxvQkFBWSxlQUl4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbGVtZW50UmVmLCBFbGVtZW50UmVmX30gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBFbWJlZGRlZCBUZW1wbGF0ZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIEVtYmVkZGVkIFZpZXdzLlxuICpcbiAqIFlvdSBjYW4gYWNjZXNzIGEgYFRlbXBsYXRlUmVmYCwgaW4gdHdvIHdheXMuIFZpYSBhIGRpcmVjdGl2ZSBwbGFjZWQgb24gYSBgPHRlbXBsYXRlPmAgZWxlbWVudCAob3JcbiAqIGRpcmVjdGl2ZSBwcmVmaXhlZCB3aXRoIGAqYCkgYW5kIGhhdmUgdGhlIGBUZW1wbGF0ZVJlZmAgZm9yIHRoaXMgRW1iZWRkZWQgVmlldyBpbmplY3RlZCBpbnRvIHRoZVxuICogY29uc3RydWN0b3Igb2YgdGhlIGRpcmVjdGl2ZSB1c2luZyB0aGUgYFRlbXBsYXRlUmVmYCBUb2tlbi4gQWx0ZXJuYXRpdmVseSB5b3UgY2FuIHF1ZXJ5IGZvciB0aGVcbiAqIGBUZW1wbGF0ZVJlZmAgZnJvbSBhIENvbXBvbmVudCBvciBhIERpcmVjdGl2ZSB2aWEge0BsaW5rIFF1ZXJ5fS5cbiAqXG4gKiBUbyBpbnN0YW50aWF0ZSBFbWJlZGRlZCBWaWV3cyBiYXNlZCBvbiBhIFRlbXBsYXRlLCB1c2VcbiAqIHtAbGluayBWaWV3Q29udGFpbmVyUmVmI2NyZWF0ZUVtYmVkZGVkVmlld30sIHdoaWNoIHdpbGwgY3JlYXRlIHRoZSBWaWV3IGFuZCBhdHRhY2ggaXQgdG8gdGhlXG4gKiBWaWV3IENvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRlbXBsYXRlUmVmIHtcbiAgLyoqXG4gICAqIFRoZSBsb2NhdGlvbiBpbiB0aGUgVmlldyB3aGVyZSB0aGUgRW1iZWRkZWQgVmlldyBsb2dpY2FsbHkgYmVsb25ncyB0by5cbiAgICpcbiAgICogVGhlIGRhdGEtYmluZGluZyBhbmQgaW5qZWN0aW9uIGNvbnRleHRzIG9mIEVtYmVkZGVkIFZpZXdzIGNyZWF0ZWQgZnJvbSB0aGlzIGBUZW1wbGF0ZVJlZmBcbiAgICogaW5oZXJpdCBmcm9tIHRoZSBjb250ZXh0cyBvZiB0aGlzIGxvY2F0aW9uLlxuICAgKlxuICAgKiBUeXBpY2FsbHkgbmV3IEVtYmVkZGVkIFZpZXdzIGFyZSBhdHRhY2hlZCB0byB0aGUgVmlldyBDb250YWluZXIgb2YgdGhpcyBsb2NhdGlvbiwgYnV0IGluXG4gICAqIGFkdmFuY2VkIHVzZS1jYXNlcywgdGhlIFZpZXcgY2FuIGJlIGF0dGFjaGVkIHRvIGEgZGlmZmVyZW50IGNvbnRhaW5lciB3aGlsZSBrZWVwaW5nIHRoZVxuICAgKiBkYXRhLWJpbmRpbmcgYW5kIGluamVjdGlvbiBjb250ZXh0IGZyb20gdGhlIG9yaWdpbmFsIGxvY2F0aW9uLlxuICAgKlxuICAgKi9cbiAgLy8gVE9ETyhpKTogcmVuYW1lIHRvIGFuY2hvciBvciBsb2NhdGlvblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIG51bGw7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVmXyBleHRlbmRzIFRlbXBsYXRlUmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZl8pIHsgc3VwZXIoKTsgfVxuXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWZfIHsgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWY7IH1cbn1cbiJdfQ==