import {ProtoRecord} from './proto_record';
import {BaseException} from "angular2/src/facade/lang";

export class ExpressionChangedAfterItHasBeenChecked extends BaseException {
  message: string;

  constructor(proto: ProtoRecord, change: any) {
    super();
    this.message =
        `Expression '${proto.expressionAsString}' has changed after it was checked. ` +
        `Previous value: '${change.previousValue}'. Current value: '${change.currentValue}'`;
  }

  toString(): string { return this.message; }
}

export class ChangeDetectionError extends BaseException {
  message: string;
  originalException: any;
  location: string;

  constructor(proto: ProtoRecord, originalException: any) {
    super();
    this.originalException = originalException;
    this.location = proto.expressionAsString;
    this.message = `${this.originalException} in [${this.location}]`;
  }

  toString(): string { return this.message; }
}

export class DehydratedException extends BaseException {
  constructor() { super('Attempt to detect changes on a dehydrated detector.'); }
}
