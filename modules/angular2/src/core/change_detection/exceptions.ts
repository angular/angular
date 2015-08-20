import {BaseException} from "angular2/src/core/facade/lang";

/**
 * An error thrown if application changes model breaking the top-down data flow.
 *
 * Angular expects that the data flows from top (root) component to child (leaf) components.
 * This is known as directed acyclic graph. This allows Angular to only execute change detection
 * once and prevents loops in change detection data flow.
 *
 * This exception is only thrown in dev mode.
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
 * This error wraps the original exception, this is done to attach expression location information.
 */
export class ChangeDetectionError extends BaseException {
  /**
   * Location of the expression.
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
 * This is angular internal error.
 */
export class DehydratedException extends BaseException {
  constructor() { super('Attempt to detect changes on a dehydrated detector.'); }
}
