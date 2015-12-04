'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
// This is a workaround for privacy in Dart as we don't have library parts
function internalView(viewRef) {
    return viewRef._view;
}
exports.internalView = internalView;
// This is a workaround for privacy in Dart as we don't have library parts
function internalProtoView(protoViewRef) {
    return lang_1.isPresent(protoViewRef) ? protoViewRef._protoView : null;
}
exports.internalProtoView = internalProtoView;
/**
 * Represents an Angular View.
 *
 * <!-- TODO: move the next two paragraphs to the dev guide -->
 * A View is a fundamental building block of the application UI. It is the smallest grouping of
 * Elements which are created and destroyed together.
 *
 * Properties of elements in a View can change, but the structure (number and order) of elements in
 * a View cannot. Changing the structure of Elements can only be done by inserting, moving or
 * removing nested Views via a {@link ViewContainer}. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ng-for="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two {@link ProtoViewRef}s:
 *
 * Outer {@link ProtoViewRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ng-for var-item [ng-for-of]="items"></template>
 * </ul>
 * ```
 *
 * Inner {@link ProtoViewRef}:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate {@link ProtoViewRef}s.
 *
 * The outer/inner {@link ProtoViewRef}s are then assembled into views like so:
 *
 * ```
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <template view-container-ref></template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 */
var ViewRef = (function () {
    function ViewRef() {
    }
    Object.defineProperty(ViewRef.prototype, "changeDetectorRef", {
        get: function () { return exceptions_1.unimplemented(); },
        set: function (value) {
            exceptions_1.unimplemented(); // TODO: https://github.com/Microsoft/TypeScript/issues/12
        },
        enumerable: true,
        configurable: true
    });
    return ViewRef;
})();
exports.ViewRef = ViewRef;
var ViewRef_ = (function (_super) {
    __extends(ViewRef_, _super);
    function ViewRef_(_view) {
        _super.call(this);
        this._changeDetectorRef = null;
        this._view = _view;
    }
    Object.defineProperty(ViewRef_.prototype, "render", {
        /**
         * Return `RenderViewRef`
         */
        get: function () { return this._view.render; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "renderFragment", {
        /**
         * Return `RenderFragmentRef`
         */
        get: function () { return this._view.renderFragment; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "changeDetectorRef", {
        /**
         * Return `ChangeDetectorRef`
         */
        get: function () {
            if (this._changeDetectorRef === null) {
                this._changeDetectorRef = this._view.changeDetector.ref;
            }
            return this._changeDetectorRef;
        },
        enumerable: true,
        configurable: true
    });
    ViewRef_.prototype.setLocal = function (variableName, value) { this._view.setLocal(variableName, value); };
    return ViewRef_;
})(ViewRef);
exports.ViewRef_ = ViewRef_;
/**
 * Represents an Angular ProtoView.
 *
 * A ProtoView is a prototypical {@link ViewRef View} that is the result of Template compilation and
 * is used by Angular to efficiently create an instance of this View based on the compiled Template.
 *
 * Most ProtoViews are created and used internally by Angular and you don't need to know about them,
 * except in advanced use-cases where you compile components yourself via the low-level
 * {@link Compiler#compileInHost} API.
 *
 *
 * ### Example
 *
 * Given this template:
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ng-for="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * Angular desugars and compiles the template into two ProtoViews:
 *
 * Outer ProtoView:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ng-for var-item [ng-for-of]="items"></template>
 * </ul>
 * ```
 *
 * Inner ProtoView:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate ProtoViews.
 */
var ProtoViewRef = (function () {
    function ProtoViewRef() {
    }
    return ProtoViewRef;
})();
exports.ProtoViewRef = ProtoViewRef;
var ProtoViewRef_ = (function (_super) {
    __extends(ProtoViewRef_, _super);
    function ProtoViewRef_(_protoView) {
        _super.call(this);
        this._protoView = _protoView;
    }
    return ProtoViewRef_;
})(ProtoViewRef);
exports.ProtoViewRef_ = ProtoViewRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOlsiaW50ZXJuYWxWaWV3IiwiaW50ZXJuYWxQcm90b1ZpZXciLCJWaWV3UmVmIiwiVmlld1JlZi5jb25zdHJ1Y3RvciIsIlZpZXdSZWYuY2hhbmdlRGV0ZWN0b3JSZWYiLCJWaWV3UmVmXyIsIlZpZXdSZWZfLmNvbnN0cnVjdG9yIiwiVmlld1JlZl8ucmVuZGVyIiwiVmlld1JlZl8ucmVuZGVyRnJhZ21lbnQiLCJWaWV3UmVmXy5jaGFuZ2VEZXRlY3RvclJlZiIsIlZpZXdSZWZfLnNldExvY2FsIiwiUHJvdG9WaWV3UmVmIiwiUHJvdG9WaWV3UmVmLmNvbnN0cnVjdG9yIiwiUHJvdG9WaWV3UmVmXyIsIlByb3RvVmlld1JlZl8uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFLN0QsMEVBQTBFO0FBQzFFLHNCQUE2QixPQUFnQjtJQUMzQ0EsTUFBTUEsQ0FBWUEsT0FBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDbkNBLENBQUNBO0FBRmUsb0JBQVksZUFFM0IsQ0FBQTtBQUVELDBFQUEwRTtBQUMxRSwyQkFBa0MsWUFBMEI7SUFDMURDLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFtQkEsWUFBYUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7QUFDbkZBLENBQUNBO0FBRmUseUJBQWlCLG9CQUVoQyxDQUFBO0FBbUJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0RHO0FBQ0g7SUFBQUM7SUFVQUMsQ0FBQ0E7SUFKQ0Qsc0JBQUlBLHNDQUFpQkE7YUFBckJBLGNBQTZDRSxNQUFNQSxDQUFDQSwwQkFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7YUFDdEVGLFVBQXNCQSxLQUF3QkE7WUFDNUNFLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFFQSwwREFBMERBO1FBQzlFQSxDQUFDQTs7O09BSHFFRjtJQUl4RUEsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFWRCxJQVVDO0FBVnFCLGVBQU8sVUFVNUIsQ0FBQTtBQUVEO0lBQThCRyw0QkFBT0E7SUFJbkNBLGtCQUFZQSxLQUF5QkE7UUFDbkNDLGlCQUFPQSxDQUFDQTtRQUpGQSx1QkFBa0JBLEdBQXNCQSxJQUFJQSxDQUFDQTtRQUtuREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBS0RELHNCQUFJQSw0QkFBTUE7UUFIVkE7O1dBRUdBO2FBQ0hBLGNBQThCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBS3pEQSxzQkFBSUEsb0NBQWNBO1FBSGxCQTs7V0FFR0E7YUFDSEEsY0FBMENHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFLN0VBLHNCQUFJQSx1Q0FBaUJBO1FBSHJCQTs7V0FFR0E7YUFDSEE7WUFDRUksRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckNBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7WUFDMURBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7UUFDakNBLENBQUNBOzs7T0FBQUo7SUFFREEsMkJBQVFBLEdBQVJBLFVBQVNBLFlBQW9CQSxFQUFFQSxLQUFVQSxJQUFVSyxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoR0wsZUFBQ0E7QUFBREEsQ0FBQ0EsQUE5QkQsRUFBOEIsT0FBTyxFQThCcEM7QUE5QlksZ0JBQVEsV0E4QnBCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSDtJQUFBTTtJQUFvQ0MsQ0FBQ0E7SUFBREQsbUJBQUNBO0FBQURBLENBQUNBLEFBQXJDLElBQXFDO0FBQWYsb0JBQVksZUFBRyxDQUFBO0FBRXJDO0lBQW1DRSxpQ0FBWUE7SUFHN0NBLHVCQUFZQSxVQUFtQ0E7UUFDN0NDLGlCQUFPQSxDQUFDQTtRQUNSQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQTtJQUMvQkEsQ0FBQ0E7SUFDSEQsb0JBQUNBO0FBQURBLENBQUNBLEFBUEQsRUFBbUMsWUFBWSxFQU85QztBQVBZLHFCQUFhLGdCQU96QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyB2aWV3TW9kdWxlIGZyb20gJy4vdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtSZW5kZXJWaWV3UmVmLCBSZW5kZXJGcmFnbWVudFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5cbi8vIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciBwcml2YWN5IGluIERhcnQgYXMgd2UgZG9uJ3QgaGF2ZSBsaWJyYXJ5IHBhcnRzXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJuYWxWaWV3KHZpZXdSZWY6IFZpZXdSZWYpOiB2aWV3TW9kdWxlLkFwcFZpZXcge1xuICByZXR1cm4gKDxWaWV3UmVmXz52aWV3UmVmKS5fdmlldztcbn1cblxuLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHByaXZhY3kgaW4gRGFydCBhcyB3ZSBkb24ndCBoYXZlIGxpYnJhcnkgcGFydHNcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcm5hbFByb3RvVmlldyhwcm90b1ZpZXdSZWY6IFByb3RvVmlld1JlZik6IHZpZXdNb2R1bGUuQXBwUHJvdG9WaWV3IHtcbiAgcmV0dXJuIGlzUHJlc2VudChwcm90b1ZpZXdSZWYpID8gKDxQcm90b1ZpZXdSZWZfPnByb3RvVmlld1JlZikuX3Byb3RvVmlldyA6IG51bGw7XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgVmlldyBjb250YWluaW5nIGEgc2luZ2xlIEVsZW1lbnQgdGhhdCBpcyB0aGUgSG9zdCBFbGVtZW50IG9mIGEge0BsaW5rIENvbXBvbmVudH1cbiAqIGluc3RhbmNlLlxuICpcbiAqIEEgSG9zdCBWaWV3IGlzIGNyZWF0ZWQgZm9yIGV2ZXJ5IGR5bmFtaWNhbGx5IGNyZWF0ZWQgQ29tcG9uZW50IHRoYXQgd2FzIGNvbXBpbGVkIG9uIGl0cyBvd24gKGFzXG4gKiBvcHBvc2VkIHRvIGFzIGEgcGFydCBvZiBhbm90aGVyIENvbXBvbmVudCdzIFRlbXBsYXRlKSB2aWEge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9IG9yIG9uZVxuICogb2YgdGhlIGhpZ2hlci1sZXZlbCBBUElzOiB7QGxpbmsgQXBwVmlld01hbmFnZXIjY3JlYXRlUm9vdEhvc3RWaWV3fSxcbiAqIHtAbGluayBBcHBWaWV3TWFuYWdlciNjcmVhdGVIb3N0Vmlld0luQ29udGFpbmVyfSwge0BsaW5rIFZpZXdDb250YWluZXJSZWYjY3JlYXRlSG9zdFZpZXd9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RWaWV3UmVmIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBWaWV3LlxuICpcbiAqIDwhLS0gVE9ETzogbW92ZSB0aGUgbmV4dCB0d28gcGFyYWdyYXBocyB0byB0aGUgZGV2IGd1aWRlIC0tPlxuICogQSBWaWV3IGlzIGEgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2sgb2YgdGhlIGFwcGxpY2F0aW9uIFVJLiBJdCBpcyB0aGUgc21hbGxlc3QgZ3JvdXBpbmcgb2ZcbiAqIEVsZW1lbnRzIHdoaWNoIGFyZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgdG9nZXRoZXIuXG4gKlxuICogUHJvcGVydGllcyBvZiBlbGVtZW50cyBpbiBhIFZpZXcgY2FuIGNoYW5nZSwgYnV0IHRoZSBzdHJ1Y3R1cmUgKG51bWJlciBhbmQgb3JkZXIpIG9mIGVsZW1lbnRzIGluXG4gKiBhIFZpZXcgY2Fubm90LiBDaGFuZ2luZyB0aGUgc3RydWN0dXJlIG9mIEVsZW1lbnRzIGNhbiBvbmx5IGJlIGRvbmUgYnkgaW5zZXJ0aW5nLCBtb3Zpbmcgb3JcbiAqIHJlbW92aW5nIG5lc3RlZCBWaWV3cyB2aWEgYSB7QGxpbmsgVmlld0NvbnRhaW5lcn0uIEVhY2ggVmlldyBjYW4gY29udGFpbiBtYW55IFZpZXcgQ29udGFpbmVycy5cbiAqIDwhLS0gL1RPRE8gLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlLi4uXG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bGkgKm5nLWZvcj1cInZhciBpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIC4uLiB3ZSBoYXZlIHR3byB7QGxpbmsgUHJvdG9WaWV3UmVmfXM6XG4gKlxuICogT3V0ZXIge0BsaW5rIFByb3RvVmlld1JlZn06XG4gKiBgYGBcbiAqIENvdW50OiB7e2l0ZW1zLmxlbmd0aH19XG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBuZy1mb3IgdmFyLWl0ZW0gW25nLWZvci1vZl09XCJpdGVtc1wiPjwvdGVtcGxhdGU+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogSW5uZXIge0BsaW5rIFByb3RvVmlld1JlZn06XG4gKiBgYGBcbiAqICAgPGxpPnt7aXRlbX19PC9saT5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBpcyBicm9rZW4gZG93biBpbnRvIHR3byBzZXBhcmF0ZSB7QGxpbmsgUHJvdG9WaWV3UmVmfXMuXG4gKlxuICogVGhlIG91dGVyL2lubmVyIHtAbGluayBQcm90b1ZpZXdSZWZ9cyBhcmUgdGhlbiBhc3NlbWJsZWQgaW50byB2aWV3cyBsaWtlIHNvOlxuICpcbiAqIGBgYFxuICogPCEtLSBWaWV3UmVmOiBvdXRlci0wIC0tPlxuICogQ291bnQ6IDJcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIHZpZXctY29udGFpbmVyLXJlZj48L3RlbXBsYXRlPlxuICogICA8IS0tIFZpZXdSZWY6IGlubmVyLTEgLS0+PGxpPmZpcnN0PC9saT48IS0tIC9WaWV3UmVmOiBpbm5lci0xIC0tPlxuICogICA8IS0tIFZpZXdSZWY6IGlubmVyLTIgLS0+PGxpPnNlY29uZDwvbGk+PCEtLSAvVmlld1JlZjogaW5uZXItMiAtLT5cbiAqIDwvdWw+XG4gKiA8IS0tIC9WaWV3UmVmOiBvdXRlci0wIC0tPlxuICogYGBgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3UmVmIGltcGxlbWVudHMgSG9zdFZpZXdSZWYge1xuICAvKipcbiAgICogU2V0cyBgdmFsdWVgIG9mIGxvY2FsIHZhcmlhYmxlIGNhbGxlZCBgdmFyaWFibGVOYW1lYCBpbiB0aGlzIFZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQ7XG5cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfVxuICBzZXQgY2hhbmdlRGV0ZWN0b3JSZWYodmFsdWU6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgdW5pbXBsZW1lbnRlZCgpOyAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xMlxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3UmVmXyBleHRlbmRzIFZpZXdSZWYge1xuICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfdmlldzogdmlld01vZHVsZS5BcHBWaWV3O1xuICBjb25zdHJ1Y3Rvcihfdmlldzogdmlld01vZHVsZS5BcHBWaWV3KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl92aWV3ID0gX3ZpZXc7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGBSZW5kZXJWaWV3UmVmYFxuICAgKi9cbiAgZ2V0IHJlbmRlcigpOiBSZW5kZXJWaWV3UmVmIHsgcmV0dXJuIHRoaXMuX3ZpZXcucmVuZGVyOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBgUmVuZGVyRnJhZ21lbnRSZWZgXG4gICAqL1xuICBnZXQgcmVuZGVyRnJhZ21lbnQoKTogUmVuZGVyRnJhZ21lbnRSZWYgeyByZXR1cm4gdGhpcy5fdmlldy5yZW5kZXJGcmFnbWVudDsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYENoYW5nZURldGVjdG9yUmVmYFxuICAgKi9cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHtcbiAgICBpZiAodGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmID0gdGhpcy5fdmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZjtcbiAgfVxuXG4gIHNldExvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7IHRoaXMuX3ZpZXcuc2V0TG9jYWwodmFyaWFibGVOYW1lLCB2YWx1ZSk7IH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIEFuZ3VsYXIgUHJvdG9WaWV3LlxuICpcbiAqIEEgUHJvdG9WaWV3IGlzIGEgcHJvdG90eXBpY2FsIHtAbGluayBWaWV3UmVmIFZpZXd9IHRoYXQgaXMgdGhlIHJlc3VsdCBvZiBUZW1wbGF0ZSBjb21waWxhdGlvbiBhbmRcbiAqIGlzIHVzZWQgYnkgQW5ndWxhciB0byBlZmZpY2llbnRseSBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhpcyBWaWV3IGJhc2VkIG9uIHRoZSBjb21waWxlZCBUZW1wbGF0ZS5cbiAqXG4gKiBNb3N0IFByb3RvVmlld3MgYXJlIGNyZWF0ZWQgYW5kIHVzZWQgaW50ZXJuYWxseSBieSBBbmd1bGFyIGFuZCB5b3UgZG9uJ3QgbmVlZCB0byBrbm93IGFib3V0IHRoZW0sXG4gKiBleGNlcHQgaW4gYWR2YW5jZWQgdXNlLWNhc2VzIHdoZXJlIHlvdSBjb21waWxlIGNvbXBvbmVudHMgeW91cnNlbGYgdmlhIHRoZSBsb3ctbGV2ZWxcbiAqIHtAbGluayBDb21waWxlciNjb21waWxlSW5Ib3N0fSBBUEkuXG4gKlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogR2l2ZW4gdGhpcyB0ZW1wbGF0ZTpcbiAqXG4gKiBgYGBcbiAqIENvdW50OiB7e2l0ZW1zLmxlbmd0aH19XG4gKiA8dWw+XG4gKiAgIDxsaSAqbmctZm9yPVwidmFyIGl0ZW0gb2YgaXRlbXNcIj57e2l0ZW19fTwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogQW5ndWxhciBkZXN1Z2FycyBhbmQgY29tcGlsZXMgdGhlIHRlbXBsYXRlIGludG8gdHdvIFByb3RvVmlld3M6XG4gKlxuICogT3V0ZXIgUHJvdG9WaWV3OlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8dGVtcGxhdGUgbmctZm9yIHZhci1pdGVtIFtuZy1mb3Itb2ZdPVwiaXRlbXNcIj48L3RlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIElubmVyIFByb3RvVmlldzpcbiAqIGBgYFxuICogICA8bGk+e3tpdGVtfX08L2xpPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIGlzIGJyb2tlbiBkb3duIGludG8gdHdvIHNlcGFyYXRlIFByb3RvVmlld3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQcm90b1ZpZXdSZWYge31cblxuZXhwb3J0IGNsYXNzIFByb3RvVmlld1JlZl8gZXh0ZW5kcyBQcm90b1ZpZXdSZWYge1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfcHJvdG9WaWV3OiB2aWV3TW9kdWxlLkFwcFByb3RvVmlldztcbiAgY29uc3RydWN0b3IoX3Byb3RvVmlldzogdmlld01vZHVsZS5BcHBQcm90b1ZpZXcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3Byb3RvVmlldyA9IF9wcm90b1ZpZXc7XG4gIH1cbn1cbiJdfQ==