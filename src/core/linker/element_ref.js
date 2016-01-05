'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * Represents a location in a View that has an injection, change-detection and render context
 * associated with it.
 *
 * An `ElementRef` is created for each element in the Template that contains a Directive, Component
 * or data-binding.
 *
 * An `ElementRef` is backed by a render-specific element. In the browser, this is usually a DOM
 * element.
 */
var ElementRef = (function () {
    function ElementRef() {
    }
    Object.defineProperty(ElementRef.prototype, "nativeElement", {
        /**
         * The underlying native element or `null` if direct access to native elements is not supported
         * (e.g. when the application runs in a web worker).
         *
         * <div class="callout is-critical">
         *   <header>Use with caution</header>
         *   <p>
         *    Use this API as the last resort when direct access to DOM is needed. Use templating and
         *    data-binding provided by Angular instead. Alternatively you take a look at {@link Renderer}
         *    which provides API that can safely be used even when direct access to native elements is not
         *    supported.
         *   </p>
         *   <p>
         *    Relying on direct DOM access creates tight coupling between your application and rendering
         *    layers which will make it impossible to separate the two and deploy your application into a
         *    web worker.
         *   </p>
         * </div>
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ElementRef.prototype, "renderView", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return ElementRef;
})();
exports.ElementRef = ElementRef;
var ElementRef_ = (function (_super) {
    __extends(ElementRef_, _super);
    function ElementRef_(parentView, 
        /**
         * Index of the element inside the {@link ViewRef}.
         *
         * This is used internally by the Angular framework to locate elements.
         */
        boundElementIndex, _renderer) {
        _super.call(this);
        this.parentView = parentView;
        this.boundElementIndex = boundElementIndex;
        this._renderer = _renderer;
    }
    Object.defineProperty(ElementRef_.prototype, "renderView", {
        get: function () { return this.parentView.render; },
        set: function (value) { exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ElementRef_.prototype, "nativeElement", {
        get: function () { return this._renderer.getNativeElementSync(this); },
        enumerable: true,
        configurable: true
    });
    return ElementRef_;
})(ElementRef);
exports.ElementRef_ = ElementRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9yZWYudHMiXSwibmFtZXMiOlsiRWxlbWVudFJlZiIsIkVsZW1lbnRSZWYuY29uc3RydWN0b3IiLCJFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQiLCJFbGVtZW50UmVmLnJlbmRlclZpZXciLCJFbGVtZW50UmVmXyIsIkVsZW1lbnRSZWZfLmNvbnN0cnVjdG9yIiwiRWxlbWVudFJlZl8ucmVuZGVyVmlldyIsIkVsZW1lbnRSZWZfLm5hdGl2ZUVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFJNUU7Ozs7Ozs7OztHQVNHO0FBQ0g7SUFBQUE7SUF1Q0FDLENBQUNBO0lBSENELHNCQUFJQSxxQ0FBYUE7UUFuQmpCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBa0JHQTthQUNIQSxjQUEyQkUsTUFBTUEsQ0FBQ0EsMEJBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7O0lBRXBEQSxzQkFBSUEsa0NBQVVBO2FBQWRBLGNBQWtDRyxNQUFNQSxDQUFDQSwwQkFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUM3REEsaUJBQUNBO0FBQURBLENBQUNBLEFBdkNELElBdUNDO0FBdkNxQixrQkFBVSxhQXVDL0IsQ0FBQTtBQUVEO0lBQWlDSSwrQkFBVUE7SUFDekNBLHFCQUFtQkEsVUFBbUJBO1FBRTFCQTs7OztXQUlHQTtRQUNJQSxpQkFBeUJBLEVBQVVBLFNBQW1CQTtRQUN2RUMsaUJBQU9BLENBQUNBO1FBUlNBLGVBQVVBLEdBQVZBLFVBQVVBLENBQVNBO1FBT25CQSxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQVFBO1FBQVVBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO0lBRXpFQSxDQUFDQTtJQUVERCxzQkFBSUEsbUNBQVVBO2FBQWRBLGNBQWtDRSxNQUFNQSxDQUFZQSxJQUFJQSxDQUFDQSxVQUFXQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTthQUM5RUYsVUFBZUEsS0FBS0EsSUFBSUUsMEJBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzs7T0FEb0NGO0lBRTlFQSxzQkFBSUEsc0NBQWFBO2FBQWpCQSxjQUEyQkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFIO0lBQ2hGQSxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFmRCxFQUFpQyxVQUFVLEVBZTFDO0FBZlksbUJBQVcsY0FldkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgdW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Vmlld1JlZiwgVmlld1JlZl99IGZyb20gJy4vdmlld19yZWYnO1xuaW1wb3J0IHtSZW5kZXJWaWV3UmVmLCBSZW5kZXJFbGVtZW50UmVmLCBSZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGxvY2F0aW9uIGluIGEgVmlldyB0aGF0IGhhcyBhbiBpbmplY3Rpb24sIGNoYW5nZS1kZXRlY3Rpb24gYW5kIHJlbmRlciBjb250ZXh0XG4gKiBhc3NvY2lhdGVkIHdpdGggaXQuXG4gKlxuICogQW4gYEVsZW1lbnRSZWZgIGlzIGNyZWF0ZWQgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgVGVtcGxhdGUgdGhhdCBjb250YWlucyBhIERpcmVjdGl2ZSwgQ29tcG9uZW50XG4gKiBvciBkYXRhLWJpbmRpbmcuXG4gKlxuICogQW4gYEVsZW1lbnRSZWZgIGlzIGJhY2tlZCBieSBhIHJlbmRlci1zcGVjaWZpYyBlbGVtZW50LiBJbiB0aGUgYnJvd3NlciwgdGhpcyBpcyB1c3VhbGx5IGEgRE9NXG4gKiBlbGVtZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRWxlbWVudFJlZiBpbXBsZW1lbnRzIFJlbmRlckVsZW1lbnRSZWYge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUge0BsaW5rIFZpZXdSZWZ9IHRoYXQgdGhpcyBgRWxlbWVudFJlZmAgaXMgcGFydCBvZi5cbiAgICovXG4gIHBhcmVudFZpZXc6IFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKlxuICAgKiBJbmRleCBvZiB0aGUgZWxlbWVudCBpbnNpZGUgdGhlIHtAbGluayBWaWV3UmVmfS5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VkIGludGVybmFsbHkgYnkgdGhlIEFuZ3VsYXIgZnJhbWV3b3JrIHRvIGxvY2F0ZSBlbGVtZW50cy5cbiAgICovXG4gIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSB1bmRlcmx5aW5nIG5hdGl2ZSBlbGVtZW50IG9yIGBudWxsYCBpZiBkaXJlY3QgYWNjZXNzIHRvIG5hdGl2ZSBlbGVtZW50cyBpcyBub3Qgc3VwcG9ydGVkXG4gICAqIChlLmcuIHdoZW4gdGhlIGFwcGxpY2F0aW9uIHJ1bnMgaW4gYSB3ZWIgd29ya2VyKS5cbiAgICpcbiAgICogPGRpdiBjbGFzcz1cImNhbGxvdXQgaXMtY3JpdGljYWxcIj5cbiAgICogICA8aGVhZGVyPlVzZSB3aXRoIGNhdXRpb248L2hlYWRlcj5cbiAgICogICA8cD5cbiAgICogICAgVXNlIHRoaXMgQVBJIGFzIHRoZSBsYXN0IHJlc29ydCB3aGVuIGRpcmVjdCBhY2Nlc3MgdG8gRE9NIGlzIG5lZWRlZC4gVXNlIHRlbXBsYXRpbmcgYW5kXG4gICAqICAgIGRhdGEtYmluZGluZyBwcm92aWRlZCBieSBBbmd1bGFyIGluc3RlYWQuIEFsdGVybmF0aXZlbHkgeW91IHRha2UgYSBsb29rIGF0IHtAbGluayBSZW5kZXJlcn1cbiAgICogICAgd2hpY2ggcHJvdmlkZXMgQVBJIHRoYXQgY2FuIHNhZmVseSBiZSB1c2VkIGV2ZW4gd2hlbiBkaXJlY3QgYWNjZXNzIHRvIG5hdGl2ZSBlbGVtZW50cyBpcyBub3RcbiAgICogICAgc3VwcG9ydGVkLlxuICAgKiAgIDwvcD5cbiAgICogICA8cD5cbiAgICogICAgUmVseWluZyBvbiBkaXJlY3QgRE9NIGFjY2VzcyBjcmVhdGVzIHRpZ2h0IGNvdXBsaW5nIGJldHdlZW4geW91ciBhcHBsaWNhdGlvbiBhbmQgcmVuZGVyaW5nXG4gICAqICAgIGxheWVycyB3aGljaCB3aWxsIG1ha2UgaXQgaW1wb3NzaWJsZSB0byBzZXBhcmF0ZSB0aGUgdHdvIGFuZCBkZXBsb3kgeW91ciBhcHBsaWNhdGlvbiBpbnRvIGFcbiAgICogICAgd2ViIHdvcmtlci5cbiAgICogICA8L3A+XG4gICAqIDwvZGl2PlxuICAgKi9cbiAgZ2V0IG5hdGl2ZUVsZW1lbnQoKTogYW55IHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICBnZXQgcmVuZGVyVmlldygpOiBSZW5kZXJWaWV3UmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudFJlZl8gZXh0ZW5kcyBFbGVtZW50UmVmIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmVudFZpZXc6IFZpZXdSZWYsXG5cbiAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAqIEluZGV4IG9mIHRoZSBlbGVtZW50IGluc2lkZSB0aGUge0BsaW5rIFZpZXdSZWZ9LlxuICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgKiBUaGlzIGlzIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgQW5ndWxhciBmcmFtZXdvcmsgdG8gbG9jYXRlIGVsZW1lbnRzLlxuICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgcHVibGljIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBnZXQgcmVuZGVyVmlldygpOiBSZW5kZXJWaWV3UmVmIHsgcmV0dXJuICg8Vmlld1JlZl8+dGhpcy5wYXJlbnRWaWV3KS5yZW5kZXI7IH1cbiAgc2V0IHJlbmRlclZpZXcodmFsdWUpIHsgdW5pbXBsZW1lbnRlZCgpOyB9XG4gIGdldCBuYXRpdmVFbGVtZW50KCk6IGFueSB7IHJldHVybiB0aGlzLl9yZW5kZXJlci5nZXROYXRpdmVFbGVtZW50U3luYyh0aGlzKTsgfVxufVxuIl19