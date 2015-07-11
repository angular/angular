import {ProtoRecord} from './proto_record';
import {BaseException} from "angular2/src/facade/lang";

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
  constructor(proto: ProtoRecord, change: any, context: any) {
    super(`Expression '${proto.expressionAsString}' has changed after it was checked. ` +
          `Previous value: '${change.previousValue}'. Current value: '${change.currentValue}'`);
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

  constructor(proto: ProtoRecord, originalException: any, originalStack: any, context: any) {
    super(`${originalException} in [${proto.expressionAsString}]`, originalException, originalStack,
          context);
    this.location = proto.expressionAsString;
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
