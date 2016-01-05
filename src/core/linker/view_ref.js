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
 * removing nested Views via a {@link ViewContainerRef}. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two {@link ProtoViewRef}s:
 *
 * Outer {@link ProtoViewRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ngFor var-item [ngForOf]="items"></template>
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
 *   <li *ngFor="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * Angular desugars and compiles the template into two ProtoViews:
 *
 * Outer ProtoView:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ngFor var-item [ngForOf]="items"></template>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOlsiaW50ZXJuYWxWaWV3IiwiaW50ZXJuYWxQcm90b1ZpZXciLCJWaWV3UmVmIiwiVmlld1JlZi5jb25zdHJ1Y3RvciIsIlZpZXdSZWYuY2hhbmdlRGV0ZWN0b3JSZWYiLCJWaWV3UmVmXyIsIlZpZXdSZWZfLmNvbnN0cnVjdG9yIiwiVmlld1JlZl8ucmVuZGVyIiwiVmlld1JlZl8ucmVuZGVyRnJhZ21lbnQiLCJWaWV3UmVmXy5jaGFuZ2VEZXRlY3RvclJlZiIsIlZpZXdSZWZfLnNldExvY2FsIiwiUHJvdG9WaWV3UmVmIiwiUHJvdG9WaWV3UmVmLmNvbnN0cnVjdG9yIiwiUHJvdG9WaWV3UmVmXyIsIlByb3RvVmlld1JlZl8uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFLN0QsMEVBQTBFO0FBQzFFLHNCQUE2QixPQUFnQjtJQUMzQ0EsTUFBTUEsQ0FBWUEsT0FBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDbkNBLENBQUNBO0FBRmUsb0JBQVksZUFFM0IsQ0FBQTtBQUVELDBFQUEwRTtBQUMxRSwyQkFBa0MsWUFBMEI7SUFDMURDLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFtQkEsWUFBYUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7QUFDbkZBLENBQUNBO0FBRmUseUJBQWlCLG9CQUVoQyxDQUFBO0FBbUJEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0RHO0FBQ0g7SUFBQUM7SUFVQUMsQ0FBQ0E7SUFKQ0Qsc0JBQUlBLHNDQUFpQkE7YUFBckJBLGNBQTZDRSxNQUFNQSxDQUFDQSwwQkFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7YUFDdEVGLFVBQXNCQSxLQUF3QkE7WUFDNUNFLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFFQSwwREFBMERBO1FBQzlFQSxDQUFDQTs7O09BSHFFRjtJQUl4RUEsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFWRCxJQVVDO0FBVnFCLGVBQU8sVUFVNUIsQ0FBQTtBQUVEO0lBQThCRyw0QkFBT0E7SUFJbkNBLGtCQUFZQSxLQUF5QkE7UUFDbkNDLGlCQUFPQSxDQUFDQTtRQUpGQSx1QkFBa0JBLEdBQXNCQSxJQUFJQSxDQUFDQTtRQUtuREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBS0RELHNCQUFJQSw0QkFBTUE7UUFIVkE7O1dBRUdBO2FBQ0hBLGNBQThCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBS3pEQSxzQkFBSUEsb0NBQWNBO1FBSGxCQTs7V0FFR0E7YUFDSEEsY0FBMENHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFLN0VBLHNCQUFJQSx1Q0FBaUJBO1FBSHJCQTs7V0FFR0E7YUFDSEE7WUFDRUksRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckNBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7WUFDMURBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7UUFDakNBLENBQUNBOzs7T0FBQUo7SUFFREEsMkJBQVFBLEdBQVJBLFVBQVNBLFlBQW9CQSxFQUFFQSxLQUFVQSxJQUFVSyxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoR0wsZUFBQ0E7QUFBREEsQ0FBQ0EsQUE5QkQsRUFBOEIsT0FBTyxFQThCcEM7QUE5QlksZ0JBQVEsV0E4QnBCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSDtJQUFBTTtJQUFvQ0MsQ0FBQ0E7SUFBREQsbUJBQUNBO0FBQURBLENBQUNBLEFBQXJDLElBQXFDO0FBQWYsb0JBQVksZUFBRyxDQUFBO0FBRXJDO0lBQW1DRSxpQ0FBWUE7SUFHN0NBLHVCQUFZQSxVQUFtQ0E7UUFDN0NDLGlCQUFPQSxDQUFDQTtRQUNSQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQTtJQUMvQkEsQ0FBQ0E7SUFDSEQsb0JBQUNBO0FBQURBLENBQUNBLEFBUEQsRUFBbUMsWUFBWSxFQU85QztBQVBZLHFCQUFhLGdCQU96QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyB2aWV3TW9kdWxlIGZyb20gJy4vdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtSZW5kZXJWaWV3UmVmLCBSZW5kZXJGcmFnbWVudFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5cbi8vIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciBwcml2YWN5IGluIERhcnQgYXMgd2UgZG9uJ3QgaGF2ZSBsaWJyYXJ5IHBhcnRzXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJuYWxWaWV3KHZpZXdSZWY6IFZpZXdSZWYpOiB2aWV3TW9kdWxlLkFwcFZpZXcge1xuICByZXR1cm4gKDxWaWV3UmVmXz52aWV3UmVmKS5fdmlldztcbn1cblxuLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHByaXZhY3kgaW4gRGFydCBhcyB3ZSBkb24ndCBoYXZlIGxpYnJhcnkgcGFydHNcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcm5hbFByb3RvVmlldyhwcm90b1ZpZXdSZWY6IFByb3RvVmlld1JlZik6IHZpZXdNb2R1bGUuQXBwUHJvdG9WaWV3IHtcbiAgcmV0dXJuIGlzUHJlc2VudChwcm90b1ZpZXdSZWYpID8gKDxQcm90b1ZpZXdSZWZfPnByb3RvVmlld1JlZikuX3Byb3RvVmlldyA6IG51bGw7XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgVmlldyBjb250YWluaW5nIGEgc2luZ2xlIEVsZW1lbnQgdGhhdCBpcyB0aGUgSG9zdCBFbGVtZW50IG9mIGEge0BsaW5rIENvbXBvbmVudH1cbiAqIGluc3RhbmNlLlxuICpcbiAqIEEgSG9zdCBWaWV3IGlzIGNyZWF0ZWQgZm9yIGV2ZXJ5IGR5bmFtaWNhbGx5IGNyZWF0ZWQgQ29tcG9uZW50IHRoYXQgd2FzIGNvbXBpbGVkIG9uIGl0cyBvd24gKGFzXG4gKiBvcHBvc2VkIHRvIGFzIGEgcGFydCBvZiBhbm90aGVyIENvbXBvbmVudCdzIFRlbXBsYXRlKSB2aWEge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9IG9yIG9uZVxuICogb2YgdGhlIGhpZ2hlci1sZXZlbCBBUElzOiB7QGxpbmsgQXBwVmlld01hbmFnZXIjY3JlYXRlUm9vdEhvc3RWaWV3fSxcbiAqIHtAbGluayBBcHBWaWV3TWFuYWdlciNjcmVhdGVIb3N0Vmlld0luQ29udGFpbmVyfSwge0BsaW5rIFZpZXdDb250YWluZXJSZWYjY3JlYXRlSG9zdFZpZXd9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RWaWV3UmVmIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBWaWV3LlxuICpcbiAqIDwhLS0gVE9ETzogbW92ZSB0aGUgbmV4dCB0d28gcGFyYWdyYXBocyB0byB0aGUgZGV2IGd1aWRlIC0tPlxuICogQSBWaWV3IGlzIGEgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2sgb2YgdGhlIGFwcGxpY2F0aW9uIFVJLiBJdCBpcyB0aGUgc21hbGxlc3QgZ3JvdXBpbmcgb2ZcbiAqIEVsZW1lbnRzIHdoaWNoIGFyZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgdG9nZXRoZXIuXG4gKlxuICogUHJvcGVydGllcyBvZiBlbGVtZW50cyBpbiBhIFZpZXcgY2FuIGNoYW5nZSwgYnV0IHRoZSBzdHJ1Y3R1cmUgKG51bWJlciBhbmQgb3JkZXIpIG9mIGVsZW1lbnRzIGluXG4gKiBhIFZpZXcgY2Fubm90LiBDaGFuZ2luZyB0aGUgc3RydWN0dXJlIG9mIEVsZW1lbnRzIGNhbiBvbmx5IGJlIGRvbmUgYnkgaW5zZXJ0aW5nLCBtb3Zpbmcgb3JcbiAqIHJlbW92aW5nIG5lc3RlZCBWaWV3cyB2aWEgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0uIEVhY2ggVmlldyBjYW4gY29udGFpbiBtYW55IFZpZXcgQ29udGFpbmVycy5cbiAqIDwhLS0gL1RPRE8gLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlLi4uXG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bGkgKm5nRm9yPVwidmFyIGl0ZW0gb2YgaXRlbXNcIj57e2l0ZW19fTwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogLi4uIHdlIGhhdmUgdHdvIHtAbGluayBQcm90b1ZpZXdSZWZ9czpcbiAqXG4gKiBPdXRlciB7QGxpbmsgUHJvdG9WaWV3UmVmfTpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIG5nRm9yIHZhci1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCI+PC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBJbm5lciB7QGxpbmsgUHJvdG9WaWV3UmVmfTpcbiAqIGBgYFxuICogICA8bGk+e3tpdGVtfX08L2xpPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIGlzIGJyb2tlbiBkb3duIGludG8gdHdvIHNlcGFyYXRlIHtAbGluayBQcm90b1ZpZXdSZWZ9cy5cbiAqXG4gKiBUaGUgb3V0ZXIvaW5uZXIge0BsaW5rIFByb3RvVmlld1JlZn1zIGFyZSB0aGVuIGFzc2VtYmxlZCBpbnRvIHZpZXdzIGxpa2Ugc286XG4gKlxuICogYGBgXG4gKiA8IS0tIFZpZXdSZWY6IG91dGVyLTAgLS0+XG4gKiBDb3VudDogMlxuICogPHVsPlxuICogICA8dGVtcGxhdGUgdmlldy1jb250YWluZXItcmVmPjwvdGVtcGxhdGU+XG4gKiAgIDwhLS0gVmlld1JlZjogaW5uZXItMSAtLT48bGk+Zmlyc3Q8L2xpPjwhLS0gL1ZpZXdSZWY6IGlubmVyLTEgLS0+XG4gKiAgIDwhLS0gVmlld1JlZjogaW5uZXItMiAtLT48bGk+c2Vjb25kPC9saT48IS0tIC9WaWV3UmVmOiBpbm5lci0yIC0tPlxuICogPC91bD5cbiAqIDwhLS0gL1ZpZXdSZWY6IG91dGVyLTAgLS0+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpZXdSZWYgaW1wbGVtZW50cyBIb3N0Vmlld1JlZiB7XG4gIC8qKlxuICAgKiBTZXRzIGB2YWx1ZWAgb2YgbG9jYWwgdmFyaWFibGUgY2FsbGVkIGB2YXJpYWJsZU5hbWVgIGluIHRoaXMgVmlldy5cbiAgICovXG4gIGFic3RyYWN0IHNldExvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZDtcblxuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG4gIHNldCBjaGFuZ2VEZXRlY3RvclJlZih2YWx1ZTogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICB1bmltcGxlbWVudGVkKCk7ICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzEyXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdSZWZfIGV4dGVuZHMgVmlld1JlZiB7XG4gIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZiA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF92aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXc7XG4gIGNvbnN0cnVjdG9yKF92aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3ZpZXcgPSBfdmlldztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYFJlbmRlclZpZXdSZWZgXG4gICAqL1xuICBnZXQgcmVuZGVyKCk6IFJlbmRlclZpZXdSZWYgeyByZXR1cm4gdGhpcy5fdmlldy5yZW5kZXI7IH1cblxuICAvKipcbiAgICogUmV0dXJuIGBSZW5kZXJGcmFnbWVudFJlZmBcbiAgICovXG4gIGdldCByZW5kZXJGcmFnbWVudCgpOiBSZW5kZXJGcmFnbWVudFJlZiB7IHJldHVybiB0aGlzLl92aWV3LnJlbmRlckZyYWdtZW50OyB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBgQ2hhbmdlRGV0ZWN0b3JSZWZgXG4gICAqL1xuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYge1xuICAgIGlmICh0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYgPSB0aGlzLl92aWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmO1xuICB9XG5cbiAgc2V0TG9jYWwodmFyaWFibGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHsgdGhpcy5fdmlldy5zZXRMb2NhbCh2YXJpYWJsZU5hbWUsIHZhbHVlKTsgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBQcm90b1ZpZXcuXG4gKlxuICogQSBQcm90b1ZpZXcgaXMgYSBwcm90b3R5cGljYWwge0BsaW5rIFZpZXdSZWYgVmlld30gdGhhdCBpcyB0aGUgcmVzdWx0IG9mIFRlbXBsYXRlIGNvbXBpbGF0aW9uIGFuZFxuICogaXMgdXNlZCBieSBBbmd1bGFyIHRvIGVmZmljaWVudGx5IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGlzIFZpZXcgYmFzZWQgb24gdGhlIGNvbXBpbGVkIFRlbXBsYXRlLlxuICpcbiAqIE1vc3QgUHJvdG9WaWV3cyBhcmUgY3JlYXRlZCBhbmQgdXNlZCBpbnRlcm5hbGx5IGJ5IEFuZ3VsYXIgYW5kIHlvdSBkb24ndCBuZWVkIHRvIGtub3cgYWJvdXQgdGhlbSxcbiAqIGV4Y2VwdCBpbiBhZHZhbmNlZCB1c2UtY2FzZXMgd2hlcmUgeW91IGNvbXBpbGUgY29tcG9uZW50cyB5b3Vyc2VsZiB2aWEgdGhlIGxvdy1sZXZlbFxuICoge0BsaW5rIENvbXBpbGVyI2NvbXBpbGVJbkhvc3R9IEFQSS5cbiAqXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlOlxuICpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPGxpICpuZ0Zvcj1cInZhciBpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIEFuZ3VsYXIgZGVzdWdhcnMgYW5kIGNvbXBpbGVzIHRoZSB0ZW1wbGF0ZSBpbnRvIHR3byBQcm90b1ZpZXdzOlxuICpcbiAqIE91dGVyIFByb3RvVmlldzpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIG5nRm9yIHZhci1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCI+PC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBJbm5lciBQcm90b1ZpZXc6XG4gKiBgYGBcbiAqICAgPGxpPnt7aXRlbX19PC9saT5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBpcyBicm9rZW4gZG93biBpbnRvIHR3byBzZXBhcmF0ZSBQcm90b1ZpZXdzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUHJvdG9WaWV3UmVmIHt9XG5cbmV4cG9ydCBjbGFzcyBQcm90b1ZpZXdSZWZfIGV4dGVuZHMgUHJvdG9WaWV3UmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3Byb3RvVmlldzogdmlld01vZHVsZS5BcHBQcm90b1ZpZXc7XG4gIGNvbnN0cnVjdG9yKF9wcm90b1ZpZXc6IHZpZXdNb2R1bGUuQXBwUHJvdG9WaWV3KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9wcm90b1ZpZXcgPSBfcHJvdG9WaWV3O1xuICB9XG59XG4iXX0=