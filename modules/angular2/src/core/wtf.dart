/**
 * Tracing for Dart applications.
 *
 * The tracing API hooks up to either [WTF](http://google.github.io/tracing-framework/) or
 * [Dart Observatory](https://www.dartlang.org/tools/observatory/).
 */
library angular2.src.core.wtf;

import "dart:profiler";
import "dart:js";

bool _wtfEnabled = false;
var _trace;
var _events;
var _createScope;
var _leaveScope;
var _beginTimeRange;
var _endTimeRange;
final List _arg1 = [null];
final List _arg2 = [null, null];

/**
 * Returns true after WTF support was enabled by a call to [detectWTF].
 */
bool get wtfEnabled => _wtfEnabled;

/**
 * Use this method to detect if [WTF](http://google.github.io/tracing-framework/) has been enabled.
 *
 * If the method is not called or if WTF has not been detected that the tracing defaults to
 * Dart Observatory.
 *
 * To make sure that this library can be used DartVM where no JavaScript is available this
 * method needs to be called with JavaScript context:
 *
 *     import "dart:js" show context;
 *
 *     detectWTF();
 */
bool detectWTF() {
  if (context.hasProperty('wtf')) {
    var wtf = context['wtf'];
    if (wtf.hasProperty('trace')) {
      if (!_wtfEnabled) print('WTF detected!');
      _wtfEnabled = true;
      _trace = wtf['trace'];
      _events = _trace['events'];
      _createScope = _events['createScope'];
      _leaveScope = _trace['leaveScope'];
      _beginTimeRange = _trace['beginTimeRange'];
      _endTimeRange = _trace['endTimeRange'];
      return true;
    }
  }
  return false;
}

/**
 * Create trace scope. Scopes must be strictly nested and are analogous to stack frames, but
 * do not have to follow the stack frames. Instead it is recommended that they follow logical
 * nesting. You may want to use [Event Signatures](http://google.github.io/tracing-framework/instrumenting-code.html#custom-events)
 * as they are defined in WTF.
 */
dynamic createScope(String signature, [flags]) {
  if (wtfEnabled) {
    _arg2[0] = signature;
    _arg2[1] = flags;
    return _createScope.apply(_arg2, thisArg: _events);
  } else {
    return new UserTag(signature);
  }
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
dynamic enter(scope) {
  if (wtfEnabled) {
    return scope.apply(const []);
  } else {
    return scope.makeCurrent();
  }
}

/**
 * Used to mark scope entry which logs single argument. The return value is used
 * to leave the scope again. Arguments only work if WTF has been enabled.
 */
dynamic enter1(scope, arg1) {
  if (wtfEnabled) {
    _arg1[0] = arg1;
    return scope.apply(_arg1);
  } else {
    return scope.makeCurrent();
  }
}

dynamic enter2(scope, arg1, arg2) {
  if (wtfEnabled) {
    _arg2[0] = arg1;
    _arg2[1] = arg2;
    return scope.apply(_arg2);
  } else {
    return scope.makeCurrent();
  }
}

/**
 * Used to mark scope exit. [scope] is the return value of a call to [enter].
 */
void leave(scope) {
  if (wtfEnabled) {
    _arg1[0] = scope;
    _leaveScope.apply(_arg1, thisArg: _trace);
  } else {
    scope.makeCurrent();
  }
}

/**
 * Used to mark scope exit with a value. [scope] is the return value of a call
 * to [enter]. Return values only work if WTF has been enabled.
 */
void leaveVal(scope, returnValue) {
  if (wtfEnabled) {
    _arg2[0] = scope;
    _arg2[1] = returnValue;
    _leaveScope.apply(_arg2, thisArg: _trace);
  } else {
    scope.makeCurrent();
  }
}

/**
 * Used to mark Async start. Async are similar to scope but they don't have to be strictly nested.
 * The return value is used in the call to [endAsync]. Async ranges only work if WTF has been enabled.
 *
 *     someMethod() {
 *        var s = startAsync('HTTP:GET', 'some.url');
 *        var future = new Future.delay(5).then((_) {
 *          endAsync(s);
 *        });
 *     }
 */
dynamic startAsync(String rangeType, String action) {
  if (wtfEnabled) {
    _arg2[0] = rangeType;
    _arg2[1] = action;
    return _beginTimeRange.apply(_arg2, thisArg: _trace);
  }
  return null;
}

/**
 * Ends a async operation. [range] is the return value from [startAsync].
 * Async ranges only work if WTF has been enabled.
 */
void endAsync(dynamic range) {
  if (wtfEnabled) {
    _arg1[0] = range;
    _endTimeRange.apply(_arg1, thisArg: _trace);
  }
  return null;
}
