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
    constructor(exp, oldValue, currValue, context) {
        super(`Expression '${exp}' has changed after it was checked. ` +
            `Previous value: '${oldValue}'. Current value: '${currValue}'`);
    }
}
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
export class ChangeDetectionError extends WrappedException {
    constructor(exp, originalException, originalStack, context) {
        super(`${originalException} in [${exp}]`, originalException, originalStack, context);
        this.location = exp;
    }
}
/**
 * Thrown when change detector executes on dehydrated view.
 *
 * This error indicates a bug in the framework.
 *
 * This is an internal Angular error.
 */
export class DehydratedException extends BaseException {
    constructor() {
        super('Attempt to detect changes on a dehydrated detector.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZXhjZXB0aW9ucy50cyJdLCJuYW1lcyI6WyJFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbiIsIkV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIiwiQ2hhbmdlRGV0ZWN0aW9uRXJyb3IiLCJDaGFuZ2VEZXRlY3Rpb25FcnJvci5jb25zdHJ1Y3RvciIsIkRlaHlkcmF0ZWRFeGNlcHRpb24iLCJEZWh5ZHJhdGVkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztBQUU5RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ0c7QUFDSCxxRUFBcUUsYUFBYTtJQUNoRkEsWUFBWUEsR0FBV0EsRUFBRUEsUUFBYUEsRUFBRUEsU0FBY0EsRUFBRUEsT0FBWUE7UUFDbEVDLE1BQU1BLGVBQWVBLEdBQUdBLHNDQUFzQ0E7WUFDeERBLG9CQUFvQkEsUUFBUUEsc0JBQXNCQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN4RUEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBQ0gsMENBQTBDLGdCQUFnQjtJQU14REUsWUFBWUEsR0FBV0EsRUFBRUEsaUJBQXNCQSxFQUFFQSxhQUFrQkEsRUFBRUEsT0FBWUE7UUFDL0VDLE1BQU1BLEdBQUdBLGlCQUFpQkEsUUFBUUEsR0FBR0EsR0FBR0EsRUFBRUEsaUJBQWlCQSxFQUFFQSxhQUFhQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNyRkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDdEJBLENBQUNBO0FBQ0hELENBQUNBO0FBRUQ7Ozs7OztHQU1HO0FBQ0gseUNBQXlDLGFBQWE7SUFDcERFO1FBQWdCQyxNQUFNQSxxREFBcURBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0FBQ2pGRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zXCI7XG5cbi8qKlxuICogQW4gZXJyb3IgdGhyb3duIGlmIGFwcGxpY2F0aW9uIGNoYW5nZXMgbW9kZWwgYnJlYWtpbmcgdGhlIHRvcC1kb3duIGRhdGEgZmxvdy5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBvbmx5IHRocm93biBpbiBkZXYgbW9kZS5cbiAqXG4gKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgb25jZSB0aGUgZGV2IG1vZGUgb3B0aW9uIGlzIGNvbmZpZ3VyYWJsZSAtLT5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhcmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGNoaWxkIFtwcm9wXT1cInBhcmVudFByb3BcIj48L2NoaWxkPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbZm9yd2FyZFJlZigoKSA9PiBDaGlsZCldXG4gKiB9KVxuICogY2xhc3MgUGFyZW50IHtcbiAqICAgcGFyZW50UHJvcCA9IFwiaW5pdFwiO1xuICogfVxuICpcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnY2hpbGQnLCBpbnB1dHM6IFsncHJvcCddfSlcbiAqIGNsYXNzIENoaWxkIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogUGFyZW50KSB7fVxuICpcbiAqICAgc2V0IHByb3Aodikge1xuICogICAgIC8vIHRoaXMgdXBkYXRlcyB0aGUgcGFyZW50IHByb3BlcnR5LCB3aGljaCBpcyBkaXNhbGxvd2VkIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uXG4gKiAgICAgLy8gdGhpcyB3aWxsIHJlc3VsdCBpbiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvblxuICogICAgIHRoaXMucGFyZW50LnBhcmVudFByb3AgPSBcInVwZGF0ZWRcIjtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihleHA6IHN0cmluZywgb2xkVmFsdWU6IGFueSwgY3VyclZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSkge1xuICAgIHN1cGVyKGBFeHByZXNzaW9uICcke2V4cH0nIGhhcyBjaGFuZ2VkIGFmdGVyIGl0IHdhcyBjaGVja2VkLiBgICtcbiAgICAgICAgICBgUHJldmlvdXMgdmFsdWU6ICcke29sZFZhbHVlfScuIEN1cnJlbnQgdmFsdWU6ICcke2N1cnJWYWx1ZX0nYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhbiBleHByZXNzaW9uIGV2YWx1YXRpb24gcmFpc2VzIGFuIGV4Y2VwdGlvbi5cbiAqXG4gKiBUaGlzIGVycm9yIHdyYXBzIHRoZSBvcmlnaW5hbCBleGNlcHRpb24gdG8gYXR0YWNoIGFkZGl0aW9uYWwgY29udGV4dHVhbCBpbmZvcm1hdGlvbiB0aGF0IGNhblxuICogYmUgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzJLeXdvej9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnY2hpbGQnLCBpbnB1dHM6IFsncHJvcCddfSlcbiAqIGNsYXNzIENoaWxkIHtcbiAqICAgcHJvcDtcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxjaGlsZCBbcHJvcF09XCJmaWVsZC5maXJzdFwiPjwvY2hpbGQ+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZF1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBmaWVsZCA9IG51bGw7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIGFjY2VzcyB0aGUgb3JpZ2luYWwgZXhjZXB0aW9uIGFuZCBzdGFjayB0aHJvdWdoIHRoZSBgb3JpZ2luYWxFeGNlcHRpb25gIGFuZFxuICogYG9yaWdpbmFsU3RhY2tgIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGFuZ2VEZXRlY3Rpb25FcnJvciBleHRlbmRzIFdyYXBwZWRFeGNlcHRpb24ge1xuICAvKipcbiAgICogSW5mb3JtYXRpb24gYWJvdXQgdGhlIGV4cHJlc3Npb24gdGhhdCB0cmlnZ2VyZWQgdGhlIGV4Y2VwdGlvbi5cbiAgICovXG4gIGxvY2F0aW9uOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZXhwOiBzdHJpbmcsIG9yaWdpbmFsRXhjZXB0aW9uOiBhbnksIG9yaWdpbmFsU3RhY2s6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYCR7b3JpZ2luYWxFeGNlcHRpb259IGluIFske2V4cH1dYCwgb3JpZ2luYWxFeGNlcHRpb24sIG9yaWdpbmFsU3RhY2ssIGNvbnRleHQpO1xuICAgIHRoaXMubG9jYXRpb24gPSBleHA7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBjaGFuZ2UgZGV0ZWN0b3IgZXhlY3V0ZXMgb24gZGVoeWRyYXRlZCB2aWV3LlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIGEgYnVnIGluIHRoZSBmcmFtZXdvcmsuXG4gKlxuICogVGhpcyBpcyBhbiBpbnRlcm5hbCBBbmd1bGFyIGVycm9yLlxuICovXG5leHBvcnQgY2xhc3MgRGVoeWRyYXRlZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoJ0F0dGVtcHQgdG8gZGV0ZWN0IGNoYW5nZXMgb24gYSBkZWh5ZHJhdGVkIGRldGVjdG9yLicpOyB9XG59XG4iXX0=