'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var EMPTY_CONTEXT = new Object();
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
}());
exports.TemplateRef = TemplateRef;
var TemplateRef_ = (function (_super) {
    __extends(TemplateRef_, _super);
    function TemplateRef_(_appElement, _viewFactory) {
        _super.call(this);
        this._appElement = _appElement;
        this._viewFactory = _viewFactory;
    }
    TemplateRef_.prototype.createEmbeddedView = function (context) {
        var view = this._viewFactory(this._appElement.parentView.viewUtils, this._appElement.parentInjector, this._appElement);
        if (lang_1.isBlank(context)) {
            context = EMPTY_CONTEXT;
        }
        view.create(context, null, null);
        return view.ref;
    };
    Object.defineProperty(TemplateRef_.prototype, "elementRef", {
        get: function () { return this._appElement.elementRef; },
        enumerable: true,
        configurable: true
    });
    return TemplateRef_;
}(TemplateRef));
exports.TemplateRef_ = TemplateRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3RlbXBsYXRlX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxQkFBc0IsMEJBQTBCLENBQUMsQ0FBQTtBQU1qRCxJQUFNLGFBQWEsR0FBc0IsSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUV0RDs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBQUE7SUFnQkEsQ0FBQztJQUhDLHNCQUFJLG1DQUFVO1FBWmQ7Ozs7Ozs7Ozs7V0FVRztRQUNILHdDQUF3QzthQUN4QyxjQUErQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFHL0Msa0JBQUM7QUFBRCxDQUFDLEFBaEJELElBZ0JDO0FBaEJxQixtQkFBVyxjQWdCaEMsQ0FBQTtBQUVEO0lBQXFDLGdDQUFjO0lBQ2pELHNCQUFvQixXQUF1QixFQUFVLFlBQXNCO1FBQUksaUJBQU8sQ0FBQztRQUFuRSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFVO0lBQWEsQ0FBQztJQUV6Rix5Q0FBa0IsR0FBbEIsVUFBbUIsT0FBVTtRQUMzQixJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVGLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsT0FBTyxHQUFRLGFBQWEsQ0FBQztRQUMvQixDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxzQkFBSSxvQ0FBVTthQUFkLGNBQStCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQ3RFLG1CQUFDO0FBQUQsQ0FBQyxBQWRELENBQXFDLFdBQVcsR0FjL0M7QUFkWSxvQkFBWSxlQWN4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7QXBwRWxlbWVudH0gZnJvbSAnLi9lbGVtZW50JztcbmltcG9ydCB7QXBwVmlld30gZnJvbSAnLi92aWV3JztcbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmfSBmcm9tICcuL3ZpZXdfcmVmJztcblxuY29uc3QgRU1QVFlfQ09OVEVYVCA9IC8qQHRzMmRhcnRfY29uc3QqLyBuZXcgT2JqZWN0KCk7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBFbWJlZGRlZCBUZW1wbGF0ZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIEVtYmVkZGVkIFZpZXdzLlxuICpcbiAqIFlvdSBjYW4gYWNjZXNzIGEgYFRlbXBsYXRlUmVmYCwgaW4gdHdvIHdheXMuIFZpYSBhIGRpcmVjdGl2ZSBwbGFjZWQgb24gYSBgPHRlbXBsYXRlPmAgZWxlbWVudCAob3JcbiAqIGRpcmVjdGl2ZSBwcmVmaXhlZCB3aXRoIGAqYCkgYW5kIGhhdmUgdGhlIGBUZW1wbGF0ZVJlZmAgZm9yIHRoaXMgRW1iZWRkZWQgVmlldyBpbmplY3RlZCBpbnRvIHRoZVxuICogY29uc3RydWN0b3Igb2YgdGhlIGRpcmVjdGl2ZSB1c2luZyB0aGUgYFRlbXBsYXRlUmVmYCBUb2tlbi4gQWx0ZXJuYXRpdmVseSB5b3UgY2FuIHF1ZXJ5IGZvciB0aGVcbiAqIGBUZW1wbGF0ZVJlZmAgZnJvbSBhIENvbXBvbmVudCBvciBhIERpcmVjdGl2ZSB2aWEge0BsaW5rIFF1ZXJ5fS5cbiAqXG4gKiBUbyBpbnN0YW50aWF0ZSBFbWJlZGRlZCBWaWV3cyBiYXNlZCBvbiBhIFRlbXBsYXRlLCB1c2VcbiAqIHtAbGluayBWaWV3Q29udGFpbmVyUmVmI2NyZWF0ZUVtYmVkZGVkVmlld30sIHdoaWNoIHdpbGwgY3JlYXRlIHRoZSBWaWV3IGFuZCBhdHRhY2ggaXQgdG8gdGhlXG4gKiBWaWV3IENvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRlbXBsYXRlUmVmPEM+IHtcbiAgLyoqXG4gICAqIFRoZSBsb2NhdGlvbiBpbiB0aGUgVmlldyB3aGVyZSB0aGUgRW1iZWRkZWQgVmlldyBsb2dpY2FsbHkgYmVsb25ncyB0by5cbiAgICpcbiAgICogVGhlIGRhdGEtYmluZGluZyBhbmQgaW5qZWN0aW9uIGNvbnRleHRzIG9mIEVtYmVkZGVkIFZpZXdzIGNyZWF0ZWQgZnJvbSB0aGlzIGBUZW1wbGF0ZVJlZmBcbiAgICogaW5oZXJpdCBmcm9tIHRoZSBjb250ZXh0cyBvZiB0aGlzIGxvY2F0aW9uLlxuICAgKlxuICAgKiBUeXBpY2FsbHkgbmV3IEVtYmVkZGVkIFZpZXdzIGFyZSBhdHRhY2hlZCB0byB0aGUgVmlldyBDb250YWluZXIgb2YgdGhpcyBsb2NhdGlvbiwgYnV0IGluXG4gICAqIGFkdmFuY2VkIHVzZS1jYXNlcywgdGhlIFZpZXcgY2FuIGJlIGF0dGFjaGVkIHRvIGEgZGlmZmVyZW50IGNvbnRhaW5lciB3aGlsZSBrZWVwaW5nIHRoZVxuICAgKiBkYXRhLWJpbmRpbmcgYW5kIGluamVjdGlvbiBjb250ZXh0IGZyb20gdGhlIG9yaWdpbmFsIGxvY2F0aW9uLlxuICAgKlxuICAgKi9cbiAgLy8gVE9ETyhpKTogcmVuYW1lIHRvIGFuY2hvciBvciBsb2NhdGlvblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIG51bGw7IH1cblxuICBhYnN0cmFjdCBjcmVhdGVFbWJlZGRlZFZpZXcoY29udGV4dDogQyk6IEVtYmVkZGVkVmlld1JlZjxDPjtcbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVmXzxDPiBleHRlbmRzIFRlbXBsYXRlUmVmPEM+IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfYXBwRWxlbWVudDogQXBwRWxlbWVudCwgcHJpdmF0ZSBfdmlld0ZhY3Rvcnk6IEZ1bmN0aW9uKSB7IHN1cGVyKCk7IH1cblxuICBjcmVhdGVFbWJlZGRlZFZpZXcoY29udGV4dDogQyk6IEVtYmVkZGVkVmlld1JlZjxDPiB7XG4gICAgdmFyIHZpZXc6IEFwcFZpZXc8Qz4gPSB0aGlzLl92aWV3RmFjdG9yeSh0aGlzLl9hcHBFbGVtZW50LnBhcmVudFZpZXcudmlld1V0aWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXBwRWxlbWVudC5wYXJlbnRJbmplY3RvciwgdGhpcy5fYXBwRWxlbWVudCk7XG4gICAgaWYgKGlzQmxhbmsoY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSA8YW55PkVNUFRZX0NPTlRFWFQ7XG4gICAgfVxuICAgIHZpZXcuY3JlYXRlKGNvbnRleHQsIG51bGwsIG51bGwpO1xuICAgIHJldHVybiB2aWV3LnJlZjtcbiAgfVxuXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdGhpcy5fYXBwRWxlbWVudC5lbGVtZW50UmVmOyB9XG59XG4iXX0=