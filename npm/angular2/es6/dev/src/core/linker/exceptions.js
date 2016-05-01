import { BaseException, WrappedException } from "angular2/src/facade/exceptions";
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
export class ExpressionChangedAfterItHasBeenCheckedException extends BaseException {
    constructor(oldValue, currValue, context) {
        super(`Expression has changed after it was checked. ` +
            `Previous value: '${oldValue}'. Current value: '${currValue}'`);
    }
}
/**
 * Thrown when an exception was raised during view creation, change detection or destruction.
 *
 * This error wraps the original exception to attach additional contextual information that can
 * be useful for debugging.
 */
export class ViewWrappedException extends WrappedException {
    constructor(originalException, originalStack, context) {
        super(`Error in ${context.source}`, originalException, originalStack, context);
    }
}
/**
 * Thrown when a destroyed view is used.
 *
 * This error indicates a bug in the framework.
 *
 * This is an internal Angular error.
 */
export class ViewDestroyedException extends BaseException {
    constructor(details) {
        super(`Attempt to use a destroyed view: ${details}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9leGNlcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsYUFBYSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO0FBRTlFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWdDRztBQUNILHFFQUFxRSxhQUFhO0lBQ2hGLFlBQVksUUFBYSxFQUFFLFNBQWMsRUFBRSxPQUFZO1FBQ3JELE1BQU0sK0NBQStDO1lBQy9DLG9CQUFvQixRQUFRLHNCQUFzQixTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCwwQ0FBMEMsZ0JBQWdCO0lBQ3hELFlBQVksaUJBQXNCLEVBQUUsYUFBa0IsRUFBRSxPQUFZO1FBQ2xFLE1BQU0sWUFBWSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pGLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsNENBQTRDLGFBQWE7SUFDdkQsWUFBWSxPQUFlO1FBQUksTUFBTSxvQ0FBb0MsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUFDLENBQUM7QUFDeEYsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zXCI7XG5cbi8qKlxuICogQW4gZXJyb3IgdGhyb3duIGlmIGFwcGxpY2F0aW9uIGNoYW5nZXMgbW9kZWwgYnJlYWtpbmcgdGhlIHRvcC1kb3duIGRhdGEgZmxvdy5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBvbmx5IHRocm93biBpbiBkZXYgbW9kZS5cbiAqXG4gKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgb25jZSB0aGUgZGV2IG1vZGUgb3B0aW9uIGlzIGNvbmZpZ3VyYWJsZSAtLT5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhcmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkIFtwcm9wXT1cInBhcmVudFByb3BcIj48L2NoaWxkPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbZm9yd2FyZFJlZigoKSA9PiBDaGlsZCldXG4gKiB9KVxuICogY2xhc3MgUGFyZW50IHtcbiAqICAgcGFyZW50UHJvcCA9IFwiaW5pdFwiO1xuICogfVxuICpcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnY2hpbGQnLCBpbnB1dHM6IFsncHJvcCddfSlcbiAqIGNsYXNzIENoaWxkIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogUGFyZW50KSB7fVxuICpcbiAqICAgc2V0IHByb3Aodikge1xuICogICAgIC8vIHRoaXMgdXBkYXRlcyB0aGUgcGFyZW50IHByb3BlcnR5LCB3aGljaCBpcyBkaXNhbGxvd2VkIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uXG4gKiAgICAgLy8gdGhpcyB3aWxsIHJlc3VsdCBpbiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvblxuICogICAgIHRoaXMucGFyZW50LnBhcmVudFByb3AgPSBcInVwZGF0ZWRcIjtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihvbGRWYWx1ZTogYW55LCBjdXJyVmFsdWU6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYEV4cHJlc3Npb24gaGFzIGNoYW5nZWQgYWZ0ZXIgaXQgd2FzIGNoZWNrZWQuIGAgK1xuICAgICAgICAgIGBQcmV2aW91cyB2YWx1ZTogJyR7b2xkVmFsdWV9Jy4gQ3VycmVudCB2YWx1ZTogJyR7Y3VyclZhbHVlfSdgKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIGV4Y2VwdGlvbiB3YXMgcmFpc2VkIGR1cmluZyB2aWV3IGNyZWF0aW9uLCBjaGFuZ2UgZGV0ZWN0aW9uIG9yIGRlc3RydWN0aW9uLlxuICpcbiAqIFRoaXMgZXJyb3Igd3JhcHMgdGhlIG9yaWdpbmFsIGV4Y2VwdGlvbiB0byBhdHRhY2ggYWRkaXRpb25hbCBjb250ZXh0dWFsIGluZm9ybWF0aW9uIHRoYXQgY2FuXG4gKiBiZSB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqL1xuZXhwb3J0IGNsYXNzIFZpZXdXcmFwcGVkRXhjZXB0aW9uIGV4dGVuZHMgV3JhcHBlZEV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG9yaWdpbmFsRXhjZXB0aW9uOiBhbnksIG9yaWdpbmFsU3RhY2s6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYEVycm9yIGluICR7Y29udGV4dC5zb3VyY2V9YCwgb3JpZ2luYWxFeGNlcHRpb24sIG9yaWdpbmFsU3RhY2ssIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBkZXN0cm95ZWQgdmlldyBpcyB1c2VkLlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIGEgYnVnIGluIHRoZSBmcmFtZXdvcmsuXG4gKlxuICogVGhpcyBpcyBhbiBpbnRlcm5hbCBBbmd1bGFyIGVycm9yLlxuICovXG5leHBvcnQgY2xhc3MgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihkZXRhaWxzOiBzdHJpbmcpIHsgc3VwZXIoYEF0dGVtcHQgdG8gdXNlIGEgZGVzdHJveWVkIHZpZXc6ICR7ZGV0YWlsc31gKTsgfVxufVxuIl19