import {global} from 'angular2/src/facade/lang';

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

export var wtfEnabled = false;
var trace: Trace;
var events: Events;

/**
 * Use this method to detect if [WTF](http://google.github.io/tracing-framework/) has been enabled.
 */
export function detectWTF(): boolean {
  var wtf: WTF = global['wtf'];
  if (wtf) {
    trace = wtf['trace'];
    if (trace) {
      if (!wtfEnabled) console.log('WTF detected!');
      wtfEnabled = true;
      events = trace['events'];
      return true;
    }
  }
  return wtfEnabled = false;
}

/**
 * Create trace scope. Scopes must be strictly nested and are analogous to stack frames, but
 * do not have to follow the stack frames. Instead it is recommended that they follow logical
 * nesting. You may want to use [Event
 * Signatures](http://google.github.io/tracing-framework/instrumenting-code.html#custom-events)
 * as they are defined in WTF.
 */
export function createScope(signature: string, flags: any = null): any {
  return wtfEnabled ? events.createScope(signature, flags) : null;
}

/**
 * Used to mark scope entry. The return value is used to leave the scope.
 *
 *     final myScope = createScope('myMethod');
 *
 *     someMethod() {
 *        var s = enter(myScope);
 *        try {
 *          // do something
 *        } finally {
 *          leave(s);
 *        }
 *     }
 *
 * [executeInScope] helps with writing this boilerplate code.
 */
export function enter(scope: any): any {
  return scope !== null ? scope(undefined, undefined) : null;
}

/**
 * Used to mark scope entry which logs single argument. The return value is used
 * to leave the scope again. Arguments only work if WTF has been enabled.
 */
export function enter1(scope: any, arg1: any): any {
  return scope !== null ? scope(arg1, undefined, undefined) : null;
}

export function enter2(scope: any, arg1: any, arg2: any): any {
  return scope !== null ? scope(arg1, arg2, undefined, undefined) : null;
}

/**
 * Used to mark scope exit. [scope] is the return value of a call to [enter].
 */
export function leave(scope: any): any {
  if (scope != null) {
    trace.leaveScope(scope, null);
  }
}

/**
 * Used to mark scope exit with a value. [scope] is the return value of a call
 * to [enter]. Return values only work if WTF has been enabled.
 */
export function leaveVal(scope: any, returnValue: any): any {
  if (scope != null) {
    trace.leaveScope(scope, returnValue);
  }
}

/**
 * Used to mark Async start. Async are similar to scope but they don't have to be strictly nested.
 * The return value is used in the call to [endAsync]. Async ranges only work if WTF has been
 * enabled.
 *
 *     someMethod() {
 *        var s = startAsync('HTTP:GET', 'some.url');
 *        var future = new Future.delay(5).then(() {
 *          endAsync(s);
 *        });
 *     }
 */
export function startAsync(rangeType: string, action: string): any {
  if (wtfEnabled) {
    return trace.beginTimeRange(rangeType, action);
  }
  return null;
}

/**
 * Ends a async operation. [range] is the return value from [startAsync].
 * Async ranges only work if WTF has been enabled.
 */
export function endAsync(range: any) {
  if (wtfEnabled) {
    trace.endTimeRange(range);
  }
}

detectWTF();
