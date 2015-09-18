import {BaseException, WrappedException} from "angular2/src/core/facade/exceptions";

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
  constructor(exp: string, oldValue: any, currValue: any, context: any) {
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
  /**
   * Information about the expression that triggered the exception.
   */
  location: string;

  constructor(exp: string, originalException: any, originalStack: any, context: any) {
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
  constructor() { super('Attempt to detect changes on a dehydrated detector.'); }
}
