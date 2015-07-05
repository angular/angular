import {ProtoRecord} from './proto_record';
import {BaseException} from "angular2/src/facade/lang";

export class ExpressionChangedAfterItHasBeenChecked extends BaseException {
  constructor(proto: ProtoRecord, change: any) {
    super(`Expression '${proto.expressionAsString}' has changed after it was checked. ` +
          `Previous value: '${change.previousValue}'. Current value: '${change.currentValue}'`);
  }
}

export class ChangeDetectionError extends BaseException {
  location: string;

  constructor(proto: ProtoRecord, originalException: any, originalStack: any) {
    super(`${originalException} in [${proto.expressionAsString}]`, originalException,
          originalStack);
    this.location = proto.expressionAsString;
  }
}

export class DehydratedException extends BaseException {
  constructor() { super('Attempt to detect changes on a dehydrated detector.'); }
}
