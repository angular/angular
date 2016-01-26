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
        super('Attempt to use a dehydrated detector.');
    }
}
/**
 * Wraps an exception thrown by an event handler.
 */
export class EventEvaluationError extends WrappedException {
    constructor(eventName, originalException, originalStack, context) {
        super(`Error during evaluation of "${eventName}"`, originalException, originalStack, context);
    }
}
/**
 * Error context included when an event handler throws an exception.
 */
export class EventEvaluationErrorContext {
    constructor(element, componentElement, context, locals, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.context = context;
        this.locals = locals;
        this.injector = injector;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZXhjZXB0aW9ucy50cyJdLCJuYW1lcyI6WyJFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbiIsIkV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIiwiQ2hhbmdlRGV0ZWN0aW9uRXJyb3IiLCJDaGFuZ2VEZXRlY3Rpb25FcnJvci5jb25zdHJ1Y3RvciIsIkRlaHlkcmF0ZWRFeGNlcHRpb24iLCJEZWh5ZHJhdGVkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIiwiRXZlbnRFdmFsdWF0aW9uRXJyb3IiLCJFdmVudEV2YWx1YXRpb25FcnJvci5jb25zdHJ1Y3RvciIsIkV2ZW50RXZhbHVhdGlvbkVycm9yQ29udGV4dCIsIkV2ZW50RXZhbHVhdGlvbkVycm9yQ29udGV4dC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7QUFFOUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0NHO0FBQ0gscUVBQXFFLGFBQWE7SUFDaEZBLFlBQVlBLEdBQVdBLEVBQUVBLFFBQWFBLEVBQUVBLFNBQWNBLEVBQUVBLE9BQVlBO1FBQ2xFQyxNQUFNQSxlQUFlQSxHQUFHQSxzQ0FBc0NBO1lBQ3hEQSxvQkFBb0JBLFFBQVFBLHNCQUFzQkEsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDeEVBLENBQUNBO0FBQ0hELENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNILDBDQUEwQyxnQkFBZ0I7SUFNeERFLFlBQVlBLEdBQVdBLEVBQUVBLGlCQUFzQkEsRUFBRUEsYUFBa0JBLEVBQUVBLE9BQVlBO1FBQy9FQyxNQUFNQSxHQUFHQSxpQkFBaUJBLFFBQVFBLEdBQUdBLEdBQUdBLEVBQUVBLGlCQUFpQkEsRUFBRUEsYUFBYUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDckZBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ3RCQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUVEOzs7Ozs7R0FNRztBQUNILHlDQUF5QyxhQUFhO0lBQ3BERTtRQUFnQkMsTUFBTUEsdUNBQXVDQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtBQUNuRUQsQ0FBQ0E7QUFFRDs7R0FFRztBQUNILDBDQUEwQyxnQkFBZ0I7SUFDeERFLFlBQVlBLFNBQWlCQSxFQUFFQSxpQkFBc0JBLEVBQUVBLGFBQWtCQSxFQUFFQSxPQUFZQTtRQUNyRkMsTUFBTUEsK0JBQStCQSxTQUFTQSxHQUFHQSxFQUFFQSxpQkFBaUJBLEVBQUVBLGFBQWFBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQ2hHQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUUsWUFBbUJBLE9BQVlBLEVBQVNBLGdCQUFxQkEsRUFBU0EsT0FBWUEsRUFDL0RBLE1BQVdBLEVBQVNBLFFBQWFBO1FBRGpDQyxZQUFPQSxHQUFQQSxPQUFPQSxDQUFLQTtRQUFTQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQUtBO1FBQVNBLFlBQU9BLEdBQVBBLE9BQU9BLENBQUtBO1FBQy9EQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFLQTtRQUFTQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFLQTtJQUFHQSxDQUFDQTtBQUMxREQsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9uc1wiO1xuXG4vKipcbiAqIEFuIGVycm9yIHRocm93biBpZiBhcHBsaWNhdGlvbiBjaGFuZ2VzIG1vZGVsIGJyZWFraW5nIHRoZSB0b3AtZG93biBkYXRhIGZsb3cuXG4gKlxuICogVGhpcyBleGNlcHRpb24gaXMgb25seSB0aHJvd24gaW4gZGV2IG1vZGUuXG4gKlxuICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIG9uY2UgdGhlIGRldiBtb2RlIG9wdGlvbiBpcyBjb25maWd1cmFibGUgLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYXJlbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxjaGlsZCBbcHJvcF09XCJwYXJlbnRQcm9wXCI+PC9jaGlsZD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW2ZvcndhcmRSZWYoKCkgPT4gQ2hpbGQpXVxuICogfSlcbiAqIGNsYXNzIFBhcmVudCB7XG4gKiAgIHBhcmVudFByb3AgPSBcImluaXRcIjtcbiAqIH1cbiAqXG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2NoaWxkJywgaW5wdXRzOiBbJ3Byb3AnXX0pXG4gKiBjbGFzcyBDaGlsZCB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJlbnQ6IFBhcmVudCkge31cbiAqXG4gKiAgIHNldCBwcm9wKHYpIHtcbiAqICAgICAvLyB0aGlzIHVwZGF0ZXMgdGhlIHBhcmVudCBwcm9wZXJ0eSwgd2hpY2ggaXMgZGlzYWxsb3dlZCBkdXJpbmcgY2hhbmdlIGRldGVjdGlvblxuICogICAgIC8vIHRoaXMgd2lsbCByZXN1bHQgaW4gRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb25cbiAqICAgICB0aGlzLnBhcmVudC5wYXJlbnRQcm9wID0gXCJ1cGRhdGVkXCI7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoZXhwOiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIGN1cnJWYWx1ZTogYW55LCBjb250ZXh0OiBhbnkpIHtcbiAgICBzdXBlcihgRXhwcmVzc2lvbiAnJHtleHB9JyBoYXMgY2hhbmdlZCBhZnRlciBpdCB3YXMgY2hlY2tlZC4gYCArXG4gICAgICAgICAgYFByZXZpb3VzIHZhbHVlOiAnJHtvbGRWYWx1ZX0nLiBDdXJyZW50IHZhbHVlOiAnJHtjdXJyVmFsdWV9J2ApO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYW4gZXhwcmVzc2lvbiBldmFsdWF0aW9uIHJhaXNlcyBhbiBleGNlcHRpb24uXG4gKlxuICogVGhpcyBlcnJvciB3cmFwcyB0aGUgb3JpZ2luYWwgZXhjZXB0aW9uIHRvIGF0dGFjaCBhZGRpdGlvbmFsIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gdGhhdCBjYW5cbiAqIGJlIHVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC8yS3l3b3o/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2NoaWxkJywgaW5wdXRzOiBbJ3Byb3AnXX0pXG4gKiBjbGFzcyBDaGlsZCB7XG4gKiAgIHByb3A7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Y2hpbGQgW3Byb3BdPVwiZmllbGQuZmlyc3RcIj48L2NoaWxkPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbQ2hpbGRdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgZmllbGQgPSBudWxsO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKlxuICogWW91IGNhbiBhY2Nlc3MgdGhlIG9yaWdpbmFsIGV4Y2VwdGlvbiBhbmQgc3RhY2sgdGhyb3VnaCB0aGUgYG9yaWdpbmFsRXhjZXB0aW9uYCBhbmRcbiAqIGBvcmlnaW5hbFN0YWNrYCBwcm9wZXJ0aWVzLlxuICovXG5leHBvcnQgY2xhc3MgQ2hhbmdlRGV0ZWN0aW9uRXJyb3IgZXh0ZW5kcyBXcmFwcGVkRXhjZXB0aW9uIHtcbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBleHByZXNzaW9uIHRoYXQgdHJpZ2dlcmVkIHRoZSBleGNlcHRpb24uXG4gICAqL1xuICBsb2NhdGlvbjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGV4cDogc3RyaW5nLCBvcmlnaW5hbEV4Y2VwdGlvbjogYW55LCBvcmlnaW5hbFN0YWNrOiBhbnksIGNvbnRleHQ6IGFueSkge1xuICAgIHN1cGVyKGAke29yaWdpbmFsRXhjZXB0aW9ufSBpbiBbJHtleHB9XWAsIG9yaWdpbmFsRXhjZXB0aW9uLCBvcmlnaW5hbFN0YWNrLCBjb250ZXh0KTtcbiAgICB0aGlzLmxvY2F0aW9uID0gZXhwO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gY2hhbmdlIGRldGVjdG9yIGV4ZWN1dGVzIG9uIGRlaHlkcmF0ZWQgdmlldy5cbiAqXG4gKiBUaGlzIGVycm9yIGluZGljYXRlcyBhIGJ1ZyBpbiB0aGUgZnJhbWV3b3JrLlxuICpcbiAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgQW5ndWxhciBlcnJvci5cbiAqL1xuZXhwb3J0IGNsYXNzIERlaHlkcmF0ZWRFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKCdBdHRlbXB0IHRvIHVzZSBhIGRlaHlkcmF0ZWQgZGV0ZWN0b3IuJyk7IH1cbn1cblxuLyoqXG4gKiBXcmFwcyBhbiBleGNlcHRpb24gdGhyb3duIGJ5IGFuIGV2ZW50IGhhbmRsZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEV2YWx1YXRpb25FcnJvciBleHRlbmRzIFdyYXBwZWRFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihldmVudE5hbWU6IHN0cmluZywgb3JpZ2luYWxFeGNlcHRpb246IGFueSwgb3JpZ2luYWxTdGFjazogYW55LCBjb250ZXh0OiBhbnkpIHtcbiAgICBzdXBlcihgRXJyb3IgZHVyaW5nIGV2YWx1YXRpb24gb2YgXCIke2V2ZW50TmFtZX1cImAsIG9yaWdpbmFsRXhjZXB0aW9uLCBvcmlnaW5hbFN0YWNrLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEVycm9yIGNvbnRleHQgaW5jbHVkZWQgd2hlbiBhbiBldmVudCBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEV2YWx1YXRpb25FcnJvckNvbnRleHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMgY29tcG9uZW50RWxlbWVudDogYW55LCBwdWJsaWMgY29udGV4dDogYW55LFxuICAgICAgICAgICAgICBwdWJsaWMgbG9jYWxzOiBhbnksIHB1YmxpYyBpbmplY3RvcjogYW55KSB7fVxufVxuIl19