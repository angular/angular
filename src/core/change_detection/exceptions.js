'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require("angular2/src/facade/exceptions");
/**
 * An error thrown if application changes model breaking the top-down data flow.
 *
 * This exception is only thrown in dev mode.
 *
 * <!-- TODO: Add a link once the dev mode option is configurable -->
 *
 * ### Example
 *
 * ```typescript
 * @Component({
 *   selector: 'parent',
 *   template: `
 *     <child [prop]="parentProp"></child>
 *   `,
 *   directives: [forwardRef(() => Child)]
 * })
 * class Parent {
 *   parentProp = "init";
 * }
 *
 * @Directive({selector: 'child', inputs: ['prop']})
 * class Child {
 *   constructor(public parent: Parent) {}
 *
 *   set prop(v) {
 *     // this updates the parent property, which is disallowed during change detection
 *     // this will result in ExpressionChangedAfterItHasBeenCheckedException
 *     this.parent.parentProp = "updated";
 *   }
 * }
 * ```
 */
var ExpressionChangedAfterItHasBeenCheckedException = (function (_super) {
    __extends(ExpressionChangedAfterItHasBeenCheckedException, _super);
    function ExpressionChangedAfterItHasBeenCheckedException(exp, oldValue, currValue, context) {
        _super.call(this, ("Expression '" + exp + "' has changed after it was checked. ") +
            ("Previous value: '" + oldValue + "'. Current value: '" + currValue + "'"));
    }
    return ExpressionChangedAfterItHasBeenCheckedException;
})(exceptions_1.BaseException);
exports.ExpressionChangedAfterItHasBeenCheckedException = ExpressionChangedAfterItHasBeenCheckedException;
/**
 * Thrown when an expression evaluation raises an exception.
 *
 * This error wraps the original exception to attach additional contextual information that can
 * be useful for debugging.
 *
 * ### Example ([live demo](http://plnkr.co/edit/2Kywoz?p=preview))
 *
 * ```typescript
 * @Directive({selector: 'child', inputs: ['prop']})
 * class Child {
 *   prop;
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <child [prop]="field.first"></child>
 *   `,
 *   directives: [Child]
 * })
 * class App {
 *   field = null;
 * }
 *
 * bootstrap(App);
 * ```
 *
 * You can access the original exception and stack through the `originalException` and
 * `originalStack` properties.
 */
var ChangeDetectionError = (function (_super) {
    __extends(ChangeDetectionError, _super);
    function ChangeDetectionError(exp, originalException, originalStack, context) {
        _super.call(this, originalException + " in [" + exp + "]", originalException, originalStack, context);
        this.location = exp;
    }
    return ChangeDetectionError;
})(exceptions_1.WrappedException);
exports.ChangeDetectionError = ChangeDetectionError;
/**
 * Thrown when change detector executes on dehydrated view.
 *
 * This error indicates a bug in the framework.
 *
 * This is an internal Angular error.
 */
var DehydratedException = (function (_super) {
    __extends(DehydratedException, _super);
    function DehydratedException() {
        _super.call(this, 'Attempt to use a dehydrated detector.');
    }
    return DehydratedException;
})(exceptions_1.BaseException);
exports.DehydratedException = DehydratedException;
/**
 * Wraps an exception thrown by an event handler.
 */
var EventEvaluationError = (function (_super) {
    __extends(EventEvaluationError, _super);
    function EventEvaluationError(eventName, originalException, originalStack, context) {
        _super.call(this, "Error during evaluation of \"" + eventName + "\"", originalException, originalStack, context);
    }
    return EventEvaluationError;
})(exceptions_1.WrappedException);
exports.EventEvaluationError = EventEvaluationError;
/**
 * Error context included when an event handler throws an exception.
 */
var EventEvaluationErrorContext = (function () {
    function EventEvaluationErrorContext(element, componentElement, context, locals, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.context = context;
        this.locals = locals;
        this.injector = injector;
    }
    return EventEvaluationErrorContext;
})();
exports.EventEvaluationErrorContext = EventEvaluationErrorContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZXhjZXB0aW9ucy50cyJdLCJuYW1lcyI6WyJFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbiIsIkV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIiwiQ2hhbmdlRGV0ZWN0aW9uRXJyb3IiLCJDaGFuZ2VEZXRlY3Rpb25FcnJvci5jb25zdHJ1Y3RvciIsIkRlaHlkcmF0ZWRFeGNlcHRpb24iLCJEZWh5ZHJhdGVkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIiwiRXZlbnRFdmFsdWF0aW9uRXJyb3IiLCJFdmVudEV2YWx1YXRpb25FcnJvci5jb25zdHJ1Y3RvciIsIkV2ZW50RXZhbHVhdGlvbkVycm9yQ29udGV4dCIsIkV2ZW50RXZhbHVhdGlvbkVycm9yQ29udGV4dC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUUvRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ0c7QUFDSDtJQUFxRUEsbUVBQWFBO0lBQ2hGQSx5REFBWUEsR0FBV0EsRUFBRUEsUUFBYUEsRUFBRUEsU0FBY0EsRUFBRUEsT0FBWUE7UUFDbEVDLGtCQUFNQSxrQkFBZUEsR0FBR0EsMENBQXNDQTtZQUN4REEsdUJBQW9CQSxRQUFRQSwyQkFBc0JBLFNBQVNBLE9BQUdBLENBQUNBLENBQUNBO0lBQ3hFQSxDQUFDQTtJQUNIRCxzREFBQ0E7QUFBREEsQ0FBQ0EsQUFMRCxFQUFxRSwwQkFBYSxFQUtqRjtBQUxZLHVEQUErQyxrREFLM0QsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUEwQ0Usd0NBQWdCQTtJQU14REEsOEJBQVlBLEdBQVdBLEVBQUVBLGlCQUFzQkEsRUFBRUEsYUFBa0JBLEVBQUVBLE9BQVlBO1FBQy9FQyxrQkFBU0EsaUJBQWlCQSxhQUFRQSxHQUFHQSxNQUFHQSxFQUFFQSxpQkFBaUJBLEVBQUVBLGFBQWFBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3JGQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUN0QkEsQ0FBQ0E7SUFDSEQsMkJBQUNBO0FBQURBLENBQUNBLEFBVkQsRUFBMEMsNkJBQWdCLEVBVXpEO0FBVlksNEJBQW9CLHVCQVVoQyxDQUFBO0FBRUQ7Ozs7OztHQU1HO0FBQ0g7SUFBeUNFLHVDQUFhQTtJQUNwREE7UUFBZ0JDLGtCQUFNQSx1Q0FBdUNBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0lBQ25FRCwwQkFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxFQUF5QywwQkFBYSxFQUVyRDtBQUZZLDJCQUFtQixzQkFFL0IsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFBMENFLHdDQUFnQkE7SUFDeERBLDhCQUFZQSxTQUFpQkEsRUFBRUEsaUJBQXNCQSxFQUFFQSxhQUFrQkEsRUFBRUEsT0FBWUE7UUFDckZDLGtCQUFNQSxrQ0FBK0JBLFNBQVNBLE9BQUdBLEVBQUVBLGlCQUFpQkEsRUFBRUEsYUFBYUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDaEdBLENBQUNBO0lBQ0hELDJCQUFDQTtBQUFEQSxDQUFDQSxBQUpELEVBQTBDLDZCQUFnQixFQUl6RDtBQUpZLDRCQUFvQix1QkFJaEMsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUUscUNBQW1CQSxPQUFZQSxFQUFTQSxnQkFBcUJBLEVBQVNBLE9BQVlBLEVBQy9EQSxNQUFXQSxFQUFTQSxRQUFhQTtRQURqQ0MsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBS0E7UUFBU0EscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFLQTtRQUFTQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUFLQTtRQUMvREEsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBS0E7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBS0E7SUFBR0EsQ0FBQ0E7SUFDMURELGtDQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFIWSxtQ0FBMkIsOEJBR3ZDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnNcIjtcblxuLyoqXG4gKiBBbiBlcnJvciB0aHJvd24gaWYgYXBwbGljYXRpb24gY2hhbmdlcyBtb2RlbCBicmVha2luZyB0aGUgdG9wLWRvd24gZGF0YSBmbG93LlxuICpcbiAqIFRoaXMgZXhjZXB0aW9uIGlzIG9ubHkgdGhyb3duIGluIGRldiBtb2RlLlxuICpcbiAqIDwhLS0gVE9ETzogQWRkIGEgbGluayBvbmNlIHRoZSBkZXYgbW9kZSBvcHRpb24gaXMgY29uZmlndXJhYmxlIC0tPlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFyZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Y2hpbGQgW3Byb3BdPVwicGFyZW50UHJvcFwiPjwvY2hpbGQ+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtmb3J3YXJkUmVmKCgpID0+IENoaWxkKV1cbiAqIH0pXG4gKiBjbGFzcyBQYXJlbnQge1xuICogICBwYXJlbnRQcm9wID0gXCJpbml0XCI7XG4gKiB9XG4gKlxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdjaGlsZCcsIGlucHV0czogWydwcm9wJ119KVxuICogY2xhc3MgQ2hpbGQge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50OiBQYXJlbnQpIHt9XG4gKlxuICogICBzZXQgcHJvcCh2KSB7XG4gKiAgICAgLy8gdGhpcyB1cGRhdGVzIHRoZSBwYXJlbnQgcHJvcGVydHksIHdoaWNoIGlzIGRpc2FsbG93ZWQgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb25cbiAqICAgICAvLyB0aGlzIHdpbGwgcmVzdWx0IGluIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uXG4gKiAgICAgdGhpcy5wYXJlbnQucGFyZW50UHJvcCA9IFwidXBkYXRlZFwiO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGV4cDogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBjdXJyVmFsdWU6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYEV4cHJlc3Npb24gJyR7ZXhwfScgaGFzIGNoYW5nZWQgYWZ0ZXIgaXQgd2FzIGNoZWNrZWQuIGAgK1xuICAgICAgICAgIGBQcmV2aW91cyB2YWx1ZTogJyR7b2xkVmFsdWV9Jy4gQ3VycmVudCB2YWx1ZTogJyR7Y3VyclZhbHVlfSdgKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIGV4cHJlc3Npb24gZXZhbHVhdGlvbiByYWlzZXMgYW4gZXhjZXB0aW9uLlxuICpcbiAqIFRoaXMgZXJyb3Igd3JhcHMgdGhlIG9yaWdpbmFsIGV4Y2VwdGlvbiB0byBhdHRhY2ggYWRkaXRpb25hbCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIHRoYXQgY2FuXG4gKiBiZSB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvMkt5d296P3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdjaGlsZCcsIGlucHV0czogWydwcm9wJ119KVxuICogY2xhc3MgQ2hpbGQge1xuICogICBwcm9wO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkIFtwcm9wXT1cImZpZWxkLmZpcnN0XCI+PC9jaGlsZD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7XG4gKiAgIGZpZWxkID0gbnVsbDtcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICpcbiAqIFlvdSBjYW4gYWNjZXNzIHRoZSBvcmlnaW5hbCBleGNlcHRpb24gYW5kIHN0YWNrIHRocm91Z2ggdGhlIGBvcmlnaW5hbEV4Y2VwdGlvbmAgYW5kXG4gKiBgb3JpZ2luYWxTdGFja2AgcHJvcGVydGllcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENoYW5nZURldGVjdGlvbkVycm9yIGV4dGVuZHMgV3JhcHBlZEV4Y2VwdGlvbiB7XG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgZXhwcmVzc2lvbiB0aGF0IHRyaWdnZXJlZCB0aGUgZXhjZXB0aW9uLlxuICAgKi9cbiAgbG9jYXRpb246IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihleHA6IHN0cmluZywgb3JpZ2luYWxFeGNlcHRpb246IGFueSwgb3JpZ2luYWxTdGFjazogYW55LCBjb250ZXh0OiBhbnkpIHtcbiAgICBzdXBlcihgJHtvcmlnaW5hbEV4Y2VwdGlvbn0gaW4gWyR7ZXhwfV1gLCBvcmlnaW5hbEV4Y2VwdGlvbiwgb3JpZ2luYWxTdGFjaywgY29udGV4dCk7XG4gICAgdGhpcy5sb2NhdGlvbiA9IGV4cDtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGNoYW5nZSBkZXRlY3RvciBleGVjdXRlcyBvbiBkZWh5ZHJhdGVkIHZpZXcuXG4gKlxuICogVGhpcyBlcnJvciBpbmRpY2F0ZXMgYSBidWcgaW4gdGhlIGZyYW1ld29yay5cbiAqXG4gKiBUaGlzIGlzIGFuIGludGVybmFsIEFuZ3VsYXIgZXJyb3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWh5ZHJhdGVkRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcignQXR0ZW1wdCB0byB1c2UgYSBkZWh5ZHJhdGVkIGRldGVjdG9yLicpOyB9XG59XG5cbi8qKlxuICogV3JhcHMgYW4gZXhjZXB0aW9uIHRocm93biBieSBhbiBldmVudCBoYW5kbGVyLlxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRFdmFsdWF0aW9uRXJyb3IgZXh0ZW5kcyBXcmFwcGVkRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoZXZlbnROYW1lOiBzdHJpbmcsIG9yaWdpbmFsRXhjZXB0aW9uOiBhbnksIG9yaWdpbmFsU3RhY2s6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYEVycm9yIGR1cmluZyBldmFsdWF0aW9uIG9mIFwiJHtldmVudE5hbWV9XCJgLCBvcmlnaW5hbEV4Y2VwdGlvbiwgb3JpZ2luYWxTdGFjaywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBFcnJvciBjb250ZXh0IGluY2x1ZGVkIHdoZW4gYW4gZXZlbnQgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRFdmFsdWF0aW9uRXJyb3JDb250ZXh0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGNvbXBvbmVudEVsZW1lbnQ6IGFueSwgcHVibGljIGNvbnRleHQ6IGFueSxcbiAgICAgICAgICAgICAgcHVibGljIGxvY2FsczogYW55LCBwdWJsaWMgaW5qZWN0b3I6IGFueSkge31cbn1cbiJdfQ==