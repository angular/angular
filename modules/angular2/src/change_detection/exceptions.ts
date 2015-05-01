import {ProtoRecord} from './proto_record';
import {BaseException} from "angular2/src/facade/lang";

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;


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