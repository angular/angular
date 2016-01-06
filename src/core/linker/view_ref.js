'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require('angular2/src/facade/exceptions');
var ViewRef = (function () {
    function ViewRef() {
    }
    Object.defineProperty(ViewRef.prototype, "changeDetectorRef", {
        /**
         * @internal
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ViewRef.prototype, "destroyed", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return ViewRef;
})();
exports.ViewRef = ViewRef;
/**
 * Represents a View containing a single Element that is the Host Element of a {@link Component}
 * instance.
 *
 * A Host View is created for every dynamically created Component that was compiled on its own (as
 * opposed to as a part of another Component's Template) via {@link Compiler#compileInHost} or one
 * of the higher-level APIs: {@link AppViewManager#createRootHostView},
 * {@link AppViewManager#createHostViewInContainer}, {@link ViewContainerRef#createHostView}.
 */
var HostViewRef = (function (_super) {
    __extends(HostViewRef, _super);
    function HostViewRef() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(HostViewRef.prototype, "rootNodes", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return HostViewRef;
})(ViewRef);
exports.HostViewRef = HostViewRef;
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
var EmbeddedViewRef = (function (_super) {
    __extends(EmbeddedViewRef, _super);
    function EmbeddedViewRef() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(EmbeddedViewRef.prototype, "rootNodes", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return EmbeddedViewRef;
})(ViewRef);
exports.EmbeddedViewRef = EmbeddedViewRef;
var ViewRef_ = (function () {
    function ViewRef_(_view) {
        this._view = _view;
        this._view = _view;
    }
    Object.defineProperty(ViewRef_.prototype, "internalView", {
        get: function () { return this._view; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "changeDetectorRef", {
        /**
         * Return `ChangeDetectorRef`
         */
        get: function () { return this._view.changeDetector.ref; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "rootNodes", {
        get: function () { return this._view.flatRootNodes; },
        enumerable: true,
        configurable: true
    });
    ViewRef_.prototype.setLocal = function (variableName, value) { this._view.setLocal(variableName, value); };
    ViewRef_.prototype.hasLocal = function (variableName) { return this._view.hasLocal(variableName); };
    Object.defineProperty(ViewRef_.prototype, "destroyed", {
        get: function () { return this._view.destroyed; },
        enumerable: true,
        configurable: true
    });
    return ViewRef_;
})();
exports.ViewRef_ = ViewRef_;
var HostViewFactoryRef = (function () {
    function HostViewFactoryRef() {
    }
    return HostViewFactoryRef;
})();
exports.HostViewFactoryRef = HostViewFactoryRef;
var HostViewFactoryRef_ = (function () {
    function HostViewFactoryRef_(_hostViewFactory) {
        this._hostViewFactory = _hostViewFactory;
    }
    Object.defineProperty(HostViewFactoryRef_.prototype, "internalHostViewFactory", {
        get: function () { return this._hostViewFactory; },
        enumerable: true,
        configurable: true
    });
    return HostViewFactoryRef_;
})();
exports.HostViewFactoryRef_ = HostViewFactoryRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOlsiVmlld1JlZiIsIlZpZXdSZWYuY29uc3RydWN0b3IiLCJWaWV3UmVmLmNoYW5nZURldGVjdG9yUmVmIiwiVmlld1JlZi5kZXN0cm95ZWQiLCJIb3N0Vmlld1JlZiIsIkhvc3RWaWV3UmVmLmNvbnN0cnVjdG9yIiwiSG9zdFZpZXdSZWYucm9vdE5vZGVzIiwiRW1iZWRkZWRWaWV3UmVmIiwiRW1iZWRkZWRWaWV3UmVmLmNvbnN0cnVjdG9yIiwiRW1iZWRkZWRWaWV3UmVmLnJvb3ROb2RlcyIsIlZpZXdSZWZfIiwiVmlld1JlZl8uY29uc3RydWN0b3IiLCJWaWV3UmVmXy5pbnRlcm5hbFZpZXciLCJWaWV3UmVmXy5jaGFuZ2VEZXRlY3RvclJlZiIsIlZpZXdSZWZfLnJvb3ROb2RlcyIsIlZpZXdSZWZfLnNldExvY2FsIiwiVmlld1JlZl8uaGFzTG9jYWwiLCJWaWV3UmVmXy5kZXN0cm95ZWQiLCJIb3N0Vmlld0ZhY3RvcnlSZWYiLCJIb3N0Vmlld0ZhY3RvcnlSZWYuY29uc3RydWN0b3IiLCJIb3N0Vmlld0ZhY3RvcnlSZWZfIiwiSG9zdFZpZXdGYWN0b3J5UmVmXy5jb25zdHJ1Y3RvciIsIkhvc3RWaWV3RmFjdG9yeVJlZl8uaW50ZXJuYWxIb3N0Vmlld0ZhY3RvcnkiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFJN0Q7SUFBQUE7SUFPQUMsQ0FBQ0E7SUFIQ0Qsc0JBQUlBLHNDQUFpQkE7UUFIckJBOztXQUVHQTthQUNIQSxjQUE2Q0UsTUFBTUEsQ0FBQ0EsMEJBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7O0lBRXRFQSxzQkFBSUEsOEJBQVNBO2FBQWJBLGNBQTJCRyxNQUFNQSxDQUFDQSwwQkFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUN0REEsY0FBQ0E7QUFBREEsQ0FBQ0EsQUFQRCxJQU9DO0FBUHFCLGVBQU8sVUFPNUIsQ0FBQTtBQUVEOzs7Ozs7OztHQVFHO0FBQ0g7SUFBMENJLCtCQUFPQTtJQUFqREE7UUFBMENDLDhCQUFPQTtJQUVqREEsQ0FBQ0E7SUFEQ0Qsc0JBQUlBLGtDQUFTQTthQUFiQSxjQUF5QkUsTUFBTUEsQ0FBQ0EsMEJBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7O0lBQ3BEQSxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxFQUEwQyxPQUFPLEVBRWhEO0FBRnFCLG1CQUFXLGNBRWhDLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9ERztBQUNIO0lBQThDRyxtQ0FBT0E7SUFBckRBO1FBQThDQyw4QkFBT0E7SUFZckRBLENBQUNBO0lBRENELHNCQUFJQSxzQ0FBU0E7YUFBYkEsY0FBeUJFLE1BQU1BLENBQUNBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGOztJQUNwREEsc0JBQUNBO0FBQURBLENBQUNBLEFBWkQsRUFBOEMsT0FBTyxFQVlwRDtBQVpxQix1QkFBZSxrQkFZcEMsQ0FBQTtBQUVEO0lBQ0VHLGtCQUFvQkEsS0FBY0E7UUFBZEMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBU0E7UUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFM0RELHNCQUFJQSxrQ0FBWUE7YUFBaEJBLGNBQThCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBS2xEQSxzQkFBSUEsdUNBQWlCQTtRQUhyQkE7O1dBRUdBO2FBQ0hBLGNBQTZDRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFIO0lBRXBGQSxzQkFBSUEsK0JBQVNBO2FBQWJBLGNBQXlCSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFKO0lBRTNEQSwyQkFBUUEsR0FBUkEsVUFBU0EsWUFBb0JBLEVBQUVBLEtBQVVBLElBQVVLLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTlGTCwyQkFBUUEsR0FBUkEsVUFBU0EsWUFBb0JBLElBQWFNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXJGTixzQkFBSUEsK0JBQVNBO2FBQWJBLGNBQTJCTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFQO0lBQzNEQSxlQUFDQTtBQUFEQSxDQUFDQSxBQWpCRCxJQWlCQztBQWpCWSxnQkFBUSxXQWlCcEIsQ0FBQTtBQUVEO0lBQUFRO0lBQTBDQyxDQUFDQTtJQUFERCx5QkFBQ0E7QUFBREEsQ0FBQ0EsQUFBM0MsSUFBMkM7QUFBckIsMEJBQWtCLHFCQUFHLENBQUE7QUFFM0M7SUFDRUUsNkJBQW9CQSxnQkFBaUNBO1FBQWpDQyxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWlCQTtJQUFHQSxDQUFDQTtJQUV6REQsc0JBQUlBLHdEQUF1QkE7YUFBM0JBLGNBQWlERSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFDbEZBLDBCQUFDQTtBQUFEQSxDQUFDQSxBQUpELElBSUM7QUFKWSwyQkFBbUIsc0JBSS9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtBcHBWaWV3LCBIb3N0Vmlld0ZhY3Rvcnl9IGZyb20gJy4vdmlldyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3UmVmIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICBnZXQgZGVzdHJveWVkKCk6IGJvb2xlYW4geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIFZpZXcgY29udGFpbmluZyBhIHNpbmdsZSBFbGVtZW50IHRoYXQgaXMgdGhlIEhvc3QgRWxlbWVudCBvZiBhIHtAbGluayBDb21wb25lbnR9XG4gKiBpbnN0YW5jZS5cbiAqXG4gKiBBIEhvc3QgVmlldyBpcyBjcmVhdGVkIGZvciBldmVyeSBkeW5hbWljYWxseSBjcmVhdGVkIENvbXBvbmVudCB0aGF0IHdhcyBjb21waWxlZCBvbiBpdHMgb3duIChhc1xuICogb3Bwb3NlZCB0byBhcyBhIHBhcnQgb2YgYW5vdGhlciBDb21wb25lbnQncyBUZW1wbGF0ZSkgdmlhIHtAbGluayBDb21waWxlciNjb21waWxlSW5Ib3N0fSBvciBvbmVcbiAqIG9mIHRoZSBoaWdoZXItbGV2ZWwgQVBJczoge0BsaW5rIEFwcFZpZXdNYW5hZ2VyI2NyZWF0ZVJvb3RIb3N0Vmlld30sXG4gKiB7QGxpbmsgQXBwVmlld01hbmFnZXIjY3JlYXRlSG9zdFZpZXdJbkNvbnRhaW5lcn0sIHtAbGluayBWaWV3Q29udGFpbmVyUmVmI2NyZWF0ZUhvc3RWaWV3fS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhvc3RWaWV3UmVmIGV4dGVuZHMgVmlld1JlZiB7XG4gIGdldCByb290Tm9kZXMoKTogYW55W10geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBWaWV3LlxuICpcbiAqIDwhLS0gVE9ETzogbW92ZSB0aGUgbmV4dCB0d28gcGFyYWdyYXBocyB0byB0aGUgZGV2IGd1aWRlIC0tPlxuICogQSBWaWV3IGlzIGEgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2sgb2YgdGhlIGFwcGxpY2F0aW9uIFVJLiBJdCBpcyB0aGUgc21hbGxlc3QgZ3JvdXBpbmcgb2ZcbiAqIEVsZW1lbnRzIHdoaWNoIGFyZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgdG9nZXRoZXIuXG4gKlxuICogUHJvcGVydGllcyBvZiBlbGVtZW50cyBpbiBhIFZpZXcgY2FuIGNoYW5nZSwgYnV0IHRoZSBzdHJ1Y3R1cmUgKG51bWJlciBhbmQgb3JkZXIpIG9mIGVsZW1lbnRzIGluXG4gKiBhIFZpZXcgY2Fubm90LiBDaGFuZ2luZyB0aGUgc3RydWN0dXJlIG9mIEVsZW1lbnRzIGNhbiBvbmx5IGJlIGRvbmUgYnkgaW5zZXJ0aW5nLCBtb3Zpbmcgb3JcbiAqIHJlbW92aW5nIG5lc3RlZCBWaWV3cyB2aWEgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0uIEVhY2ggVmlldyBjYW4gY29udGFpbiBtYW55IFZpZXcgQ29udGFpbmVycy5cbiAqIDwhLS0gL1RPRE8gLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlLi4uXG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bGkgKm5nRm9yPVwidmFyIGl0ZW0gb2YgaXRlbXNcIj57e2l0ZW19fTwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogLi4uIHdlIGhhdmUgdHdvIHtAbGluayBQcm90b1ZpZXdSZWZ9czpcbiAqXG4gKiBPdXRlciB7QGxpbmsgUHJvdG9WaWV3UmVmfTpcbiAqIGBgYFxuICogQ291bnQ6IHt7aXRlbXMubGVuZ3RofX1cbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIG5nRm9yIHZhci1pdGVtIFtuZ0Zvck9mXT1cIml0ZW1zXCI+PC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBJbm5lciB7QGxpbmsgUHJvdG9WaWV3UmVmfTpcbiAqIGBgYFxuICogICA8bGk+e3tpdGVtfX08L2xpPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIGlzIGJyb2tlbiBkb3duIGludG8gdHdvIHNlcGFyYXRlIHtAbGluayBQcm90b1ZpZXdSZWZ9cy5cbiAqXG4gKiBUaGUgb3V0ZXIvaW5uZXIge0BsaW5rIFByb3RvVmlld1JlZn1zIGFyZSB0aGVuIGFzc2VtYmxlZCBpbnRvIHZpZXdzIGxpa2Ugc286XG4gKlxuICogYGBgXG4gKiA8IS0tIFZpZXdSZWY6IG91dGVyLTAgLS0+XG4gKiBDb3VudDogMlxuICogPHVsPlxuICogICA8dGVtcGxhdGUgdmlldy1jb250YWluZXItcmVmPjwvdGVtcGxhdGU+XG4gKiAgIDwhLS0gVmlld1JlZjogaW5uZXItMSAtLT48bGk+Zmlyc3Q8L2xpPjwhLS0gL1ZpZXdSZWY6IGlubmVyLTEgLS0+XG4gKiAgIDwhLS0gVmlld1JlZjogaW5uZXItMiAtLT48bGk+c2Vjb25kPC9saT48IS0tIC9WaWV3UmVmOiBpbm5lci0yIC0tPlxuICogPC91bD5cbiAqIDwhLS0gL1ZpZXdSZWY6IG91dGVyLTAgLS0+XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVtYmVkZGVkVmlld1JlZiBleHRlbmRzIFZpZXdSZWYge1xuICAvKipcbiAgICogU2V0cyBgdmFsdWVgIG9mIGxvY2FsIHZhcmlhYmxlIGNhbGxlZCBgdmFyaWFibGVOYW1lYCBpbiB0aGlzIFZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoaXMgdmlldyBoYXMgYSBsb2NhbCB2YXJpYWJsZSBjYWxsZWQgYHZhcmlhYmxlTmFtZWAuXG4gICAqL1xuICBhYnN0cmFjdCBoYXNMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgZ2V0IHJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3UmVmXyBpbXBsZW1lbnRzIEVtYmVkZGVkVmlld1JlZiwgSG9zdFZpZXdSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3OiBBcHBWaWV3KSB7IHRoaXMuX3ZpZXcgPSBfdmlldzsgfVxuXG4gIGdldCBpbnRlcm5hbFZpZXcoKTogQXBwVmlldyB7IHJldHVybiB0aGlzLl92aWV3OyB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBgQ2hhbmdlRGV0ZWN0b3JSZWZgXG4gICAqL1xuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpcy5fdmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7IH1cblxuICBnZXQgcm9vdE5vZGVzKCk6IGFueVtdIHsgcmV0dXJuIHRoaXMuX3ZpZXcuZmxhdFJvb3ROb2RlczsgfVxuXG4gIHNldExvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7IHRoaXMuX3ZpZXcuc2V0TG9jYWwodmFyaWFibGVOYW1lLCB2YWx1ZSk7IH1cblxuICBoYXNMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdmlldy5oYXNMb2NhbCh2YXJpYWJsZU5hbWUpOyB9XG5cbiAgZ2V0IGRlc3Ryb3llZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3ZpZXcuZGVzdHJveWVkOyB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIb3N0Vmlld0ZhY3RvcnlSZWYge31cblxuZXhwb3J0IGNsYXNzIEhvc3RWaWV3RmFjdG9yeVJlZl8gaW1wbGVtZW50cyBIb3N0Vmlld0ZhY3RvcnlSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9ob3N0Vmlld0ZhY3Rvcnk6IEhvc3RWaWV3RmFjdG9yeSkge31cblxuICBnZXQgaW50ZXJuYWxIb3N0Vmlld0ZhY3RvcnkoKTogSG9zdFZpZXdGYWN0b3J5IHsgcmV0dXJuIHRoaXMuX2hvc3RWaWV3RmFjdG9yeTsgfVxufSJdfQ==