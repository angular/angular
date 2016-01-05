'use strict';var exceptions_1 = require('angular2/src/facade/exceptions');
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
    return ElementRef;
})();
exports.ElementRef = ElementRef;
var ElementRef_ = (function () {
    function ElementRef_(_appElement) {
        this._appElement = _appElement;
    }
    Object.defineProperty(ElementRef_.prototype, "internalElement", {
        get: function () { return this._appElement; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ElementRef_.prototype, "nativeElement", {
        get: function () { return this._appElement.nativeElement; },
        enumerable: true,
        configurable: true
    });
    return ElementRef_;
})();
exports.ElementRef_ = ElementRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9yZWYudHMiXSwibmFtZXMiOlsiRWxlbWVudFJlZiIsIkVsZW1lbnRSZWYuY29uc3RydWN0b3IiLCJFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQiLCJFbGVtZW50UmVmXyIsIkVsZW1lbnRSZWZfLmNvbnN0cnVjdG9yIiwiRWxlbWVudFJlZl8uaW50ZXJuYWxFbGVtZW50IiwiRWxlbWVudFJlZl8ubmF0aXZlRWxlbWVudCJdLCJtYXBwaW5ncyI6IkFBQUEsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFHN0Q7Ozs7Ozs7OztHQVNHO0FBQ0g7SUFBQUE7SUFxQkFDLENBQUNBO0lBRENELHNCQUFJQSxxQ0FBYUE7UUFuQmpCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBa0JHQTthQUNIQSxjQUEyQkUsTUFBTUEsQ0FBQ0EsMEJBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFDdERBLGlCQUFDQTtBQUFEQSxDQUFDQSxBQXJCRCxJQXFCQztBQXJCcUIsa0JBQVUsYUFxQi9CLENBQUE7QUFFRDtJQUNFRyxxQkFBb0JBLFdBQXVCQTtRQUF2QkMsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO0lBQUdBLENBQUNBO0lBRS9DRCxzQkFBSUEsd0NBQWVBO2FBQW5CQSxjQUFvQ0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUU5REEsc0JBQUlBLHNDQUFhQTthQUFqQkEsY0FBc0JHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFDaEVBLGtCQUFDQTtBQUFEQSxDQUFDQSxBQU5ELElBTUM7QUFOWSxtQkFBVyxjQU12QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtBcHBFbGVtZW50fSBmcm9tICcuL2VsZW1lbnQnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBsb2NhdGlvbiBpbiBhIFZpZXcgdGhhdCBoYXMgYW4gaW5qZWN0aW9uLCBjaGFuZ2UtZGV0ZWN0aW9uIGFuZCByZW5kZXIgY29udGV4dFxuICogYXNzb2NpYXRlZCB3aXRoIGl0LlxuICpcbiAqIEFuIGBFbGVtZW50UmVmYCBpcyBjcmVhdGVkIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIFRlbXBsYXRlIHRoYXQgY29udGFpbnMgYSBEaXJlY3RpdmUsIENvbXBvbmVudFxuICogb3IgZGF0YS1iaW5kaW5nLlxuICpcbiAqIEFuIGBFbGVtZW50UmVmYCBpcyBiYWNrZWQgYnkgYSByZW5kZXItc3BlY2lmaWMgZWxlbWVudC4gSW4gdGhlIGJyb3dzZXIsIHRoaXMgaXMgdXN1YWxseSBhIERPTVxuICogZWxlbWVudC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVsZW1lbnRSZWYge1xuICAvKipcbiAgICogVGhlIHVuZGVybHlpbmcgbmF0aXZlIGVsZW1lbnQgb3IgYG51bGxgIGlmIGRpcmVjdCBhY2Nlc3MgdG8gbmF0aXZlIGVsZW1lbnRzIGlzIG5vdCBzdXBwb3J0ZWRcbiAgICogKGUuZy4gd2hlbiB0aGUgYXBwbGljYXRpb24gcnVucyBpbiBhIHdlYiB3b3JrZXIpLlxuICAgKlxuICAgKiA8ZGl2IGNsYXNzPVwiY2FsbG91dCBpcy1jcml0aWNhbFwiPlxuICAgKiAgIDxoZWFkZXI+VXNlIHdpdGggY2F1dGlvbjwvaGVhZGVyPlxuICAgKiAgIDxwPlxuICAgKiAgICBVc2UgdGhpcyBBUEkgYXMgdGhlIGxhc3QgcmVzb3J0IHdoZW4gZGlyZWN0IGFjY2VzcyB0byBET00gaXMgbmVlZGVkLiBVc2UgdGVtcGxhdGluZyBhbmRcbiAgICogICAgZGF0YS1iaW5kaW5nIHByb3ZpZGVkIGJ5IEFuZ3VsYXIgaW5zdGVhZC4gQWx0ZXJuYXRpdmVseSB5b3UgdGFrZSBhIGxvb2sgYXQge0BsaW5rIFJlbmRlcmVyfVxuICAgKiAgICB3aGljaCBwcm92aWRlcyBBUEkgdGhhdCBjYW4gc2FmZWx5IGJlIHVzZWQgZXZlbiB3aGVuIGRpcmVjdCBhY2Nlc3MgdG8gbmF0aXZlIGVsZW1lbnRzIGlzIG5vdFxuICAgKiAgICBzdXBwb3J0ZWQuXG4gICAqICAgPC9wPlxuICAgKiAgIDxwPlxuICAgKiAgICBSZWx5aW5nIG9uIGRpcmVjdCBET00gYWNjZXNzIGNyZWF0ZXMgdGlnaHQgY291cGxpbmcgYmV0d2VlbiB5b3VyIGFwcGxpY2F0aW9uIGFuZCByZW5kZXJpbmdcbiAgICogICAgbGF5ZXJzIHdoaWNoIHdpbGwgbWFrZSBpdCBpbXBvc3NpYmxlIHRvIHNlcGFyYXRlIHRoZSB0d28gYW5kIGRlcGxveSB5b3VyIGFwcGxpY2F0aW9uIGludG8gYVxuICAgKiAgICB3ZWIgd29ya2VyLlxuICAgKiAgIDwvcD5cbiAgICogPC9kaXY+XG4gICAqL1xuICBnZXQgbmF0aXZlRWxlbWVudCgpOiBhbnkgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50UmVmXyBpbXBsZW1lbnRzIEVsZW1lbnRSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9hcHBFbGVtZW50OiBBcHBFbGVtZW50KSB7fVxuXG4gIGdldCBpbnRlcm5hbEVsZW1lbnQoKTogQXBwRWxlbWVudCB7IHJldHVybiB0aGlzLl9hcHBFbGVtZW50OyB9XG5cbiAgZ2V0IG5hdGl2ZUVsZW1lbnQoKSB7IHJldHVybiB0aGlzLl9hcHBFbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7IH1cbn1cbiJdfQ==