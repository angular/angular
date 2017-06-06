'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
    function ExpressionChangedAfterItHasBeenCheckedException(oldValue, currValue, context) {
        _super.call(this, "Expression has changed after it was checked. " +
            ("Previous value: '" + oldValue + "'. Current value: '" + currValue + "'"));
    }
    return ExpressionChangedAfterItHasBeenCheckedException;
}(exceptions_1.BaseException));
exports.ExpressionChangedAfterItHasBeenCheckedException = ExpressionChangedAfterItHasBeenCheckedException;
/**
 * Thrown when an exception was raised during view creation, change detection or destruction.
 *
 * This error wraps the original exception to attach additional contextual information that can
 * be useful for debugging.
 */
var ViewWrappedException = (function (_super) {
    __extends(ViewWrappedException, _super);
    function ViewWrappedException(originalException, originalStack, context) {
        _super.call(this, "Error in " + context.source, originalException, originalStack, context);
    }
    return ViewWrappedException;
}(exceptions_1.WrappedException));
exports.ViewWrappedException = ViewWrappedException;
/**
 * Thrown when a destroyed view is used.
 *
 * This error indicates a bug in the framework.
 *
 * This is an internal Angular error.
 */
var ViewDestroyedException = (function (_super) {
    __extends(ViewDestroyedException, _super);
    function ViewDestroyedException(details) {
        _super.call(this, "Attempt to use a destroyed view: " + details);
    }
    return ViewDestroyedException;
}(exceptions_1.BaseException));
exports.ViewDestroyedException = ViewDestroyedException;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9leGNlcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRS9FOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWdDRztBQUNIO0lBQXFFLG1FQUFhO0lBQ2hGLHlEQUFZLFFBQWEsRUFBRSxTQUFjLEVBQUUsT0FBWTtRQUNyRCxrQkFBTSwrQ0FBK0M7WUFDL0MsdUJBQW9CLFFBQVEsMkJBQXNCLFNBQVMsT0FBRyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNILHNEQUFDO0FBQUQsQ0FBQyxBQUxELENBQXFFLDBCQUFhLEdBS2pGO0FBTFksdURBQStDLGtEQUszRCxDQUFBO0FBRUQ7Ozs7O0dBS0c7QUFDSDtJQUEwQyx3Q0FBZ0I7SUFDeEQsOEJBQVksaUJBQXNCLEVBQUUsYUFBa0IsRUFBRSxPQUFZO1FBQ2xFLGtCQUFNLGNBQVksT0FBTyxDQUFDLE1BQVEsRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUNILDJCQUFDO0FBQUQsQ0FBQyxBQUpELENBQTBDLDZCQUFnQixHQUl6RDtBQUpZLDRCQUFvQix1QkFJaEMsQ0FBQTtBQUVEOzs7Ozs7R0FNRztBQUNIO0lBQTRDLDBDQUFhO0lBQ3ZELGdDQUFZLE9BQWU7UUFBSSxrQkFBTSxzQ0FBb0MsT0FBUyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ3hGLDZCQUFDO0FBQUQsQ0FBQyxBQUZELENBQTRDLDBCQUFhLEdBRXhEO0FBRlksOEJBQXNCLHlCQUVsQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zXCI7XG5cbi8qKlxuICogQW4gZXJyb3IgdGhyb3duIGlmIGFwcGxpY2F0aW9uIGNoYW5nZXMgbW9kZWwgYnJlYWtpbmcgdGhlIHRvcC1kb3duIGRhdGEgZmxvdy5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBvbmx5IHRocm93biBpbiBkZXYgbW9kZS5cbiAqXG4gKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgb25jZSB0aGUgZGV2IG1vZGUgb3B0aW9uIGlzIGNvbmZpZ3VyYWJsZSAtLT5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhcmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkIFtwcm9wXT1cInBhcmVudFByb3BcIj48L2NoaWxkPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbZm9yd2FyZFJlZigoKSA9PiBDaGlsZCldXG4gKiB9KVxuICogY2xhc3MgUGFyZW50IHtcbiAqICAgcGFyZW50UHJvcCA9IFwiaW5pdFwiO1xuICogfVxuICpcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnY2hpbGQnLCBpbnB1dHM6IFsncHJvcCddfSlcbiAqIGNsYXNzIENoaWxkIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogUGFyZW50KSB7fVxuICpcbiAqICAgc2V0IHByb3Aodikge1xuICogICAgIC8vIHRoaXMgdXBkYXRlcyB0aGUgcGFyZW50IHByb3BlcnR5LCB3aGljaCBpcyBkaXNhbGxvd2VkIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uXG4gKiAgICAgLy8gdGhpcyB3aWxsIHJlc3VsdCBpbiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvblxuICogICAgIHRoaXMucGFyZW50LnBhcmVudFByb3AgPSBcInVwZGF0ZWRcIjtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihvbGRWYWx1ZTogYW55LCBjdXJyVmFsdWU6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYEV4cHJlc3Npb24gaGFzIGNoYW5nZWQgYWZ0ZXIgaXQgd2FzIGNoZWNrZWQuIGAgK1xuICAgICAgICAgIGBQcmV2aW91cyB2YWx1ZTogJyR7b2xkVmFsdWV9Jy4gQ3VycmVudCB2YWx1ZTogJyR7Y3VyclZhbHVlfSdgKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIGV4Y2VwdGlvbiB3YXMgcmFpc2VkIGR1cmluZyB2aWV3IGNyZWF0aW9uLCBjaGFuZ2UgZGV0ZWN0aW9uIG9yIGRlc3RydWN0aW9uLlxuICpcbiAqIFRoaXMgZXJyb3Igd3JhcHMgdGhlIG9yaWdpbmFsIGV4Y2VwdGlvbiB0byBhdHRhY2ggYWRkaXRpb25hbCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIHRoYXQgY2FuXG4gKiBiZSB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZpZXdXcmFwcGVkRXhjZXB0aW9uIGV4dGVuZHMgV3JhcHBlZEV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG9yaWdpbmFsRXhjZXB0aW9uOiBhbnksIG9yaWdpbmFsU3RhY2s6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYEVycm9yIGluICR7Y29udGV4dC5zb3VyY2V9YCwgb3JpZ2luYWxFeGNlcHRpb24sIG9yaWdpbmFsU3RhY2ssIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBkZXN0cm95ZWQgdmlldyBpcyB1c2VkLlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIGEgYnVnIGluIHRoZSBmcmFtZXdvcmsuXG4gKlxuICogVGhpcyBpcyBhbiBpbnRlcm5hbCBBbmd1bGFyIGVycm9yLlxuICovXG5leHBvcnQgY2xhc3MgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihkZXRhaWxzOiBzdHJpbmcpIHsgc3VwZXIoYEF0dGVtcHQgdG8gdXNlIGEgZGVzdHJveWVkIHZpZXc6ICR7ZGV0YWlsc31gKTsgfVxufVxuIl19