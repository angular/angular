import {global} from '../facade/lang';

export interface WtfScopeFn { (arg0?: any, arg1?: any): any; }

interface WTF {
  trace: Trace;
}

interface Trace {
  events: Events;
  leaveScope(scope: Scope, returnValue: any);
  beginTimeRange(rangeType: string, action: string): Range;
  endTimeRange(range: Range);
}

interface Range {}

interface Events {
  createScope(signature: string, flags: any): Scope;
}

interface Scope {
  (...args): any;
}

var trace: Trace;
var events: Events;

export function detectWTF(): boolean {
  var wtf: WTF = global['wtf'];
  if (wtf) {
    trace = wtf['trace'];
    if (trace) {
      events = trace['events'];
      return true;
    }
  }
  return false;
}

export function createScope(signature: string, flags: any = null): any {
  return events.createScope(signature, flags);
}

export function leave<T>(scope: Scope, returnValue?: T): T {
  trace.leaveScope(scope, returnValue);
  return returnValue;
}

export function startTimeRange(rangeType: string, action: string): Range {
  return trace.beginTimeRange(rangeType, action);
}

export function endTimeRange(range: Range): void {
  trace.endTimeRange(range);
}
