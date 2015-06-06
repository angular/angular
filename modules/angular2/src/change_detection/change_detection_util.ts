import {isPresent, isBlank, BaseException, Type} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {ProtoRecord} from './proto_record';
import {DehydratedException, ExpressionChangedAfterItHasBeenChecked} from './exceptions';
import {WrappedValue} from './pipes/pipe';
import {CHECK_ALWAYS, CHECK_ONCE, CHECKED, DETACHED, ON_PUSH} from './constants';

export var uninitialized = new Object();

export class SimpleChange {
  constructor(public previousValue: any, public currentValue: any) {}
}

var _simpleChangesIndex = 0;
var _simpleChanges = [
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null),
  new SimpleChange(null, null)
];

function _simpleChange(previousValue, currentValue) {
  var index = _simpleChangesIndex++ % 20;
  var s = _simpleChanges[index];
  s.previousValue = previousValue;
  s.currentValue = currentValue;
  return s;
}

export class ChangeDetectionUtil {
  static uninitialized() { return uninitialized; }

  static arrayFn0() { return []; }
  static arrayFn1(a1) { return [a1]; }
  static arrayFn2(a1, a2) { return [a1, a2]; }
  static arrayFn3(a1, a2, a3) { return [a1, a2, a3]; }
  static arrayFn4(a1, a2, a3, a4) { return [a1, a2, a3, a4]; }
  static arrayFn5(a1, a2, a3, a4, a5) { return [a1, a2, a3, a4, a5]; }
  static arrayFn6(a1, a2, a3, a4, a5, a6) { return [a1, a2, a3, a4, a5, a6]; }
  static arrayFn7(a1, a2, a3, a4, a5, a6, a7) { return [a1, a2, a3, a4, a5, a6, a7]; }
  static arrayFn8(a1, a2, a3, a4, a5, a6, a7, a8) { return [a1, a2, a3, a4, a5, a6, a7, a8]; }
  static arrayFn9(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    return [a1, a2, a3, a4, a5, a6, a7, a8, a9];
  }

  static operation_negate(value) { return !value; }
  static operation_add(left, right) { return left + right; }
  static operation_subtract(left, right) { return left - right; }
  static operation_multiply(left, right) { return left * right; }
  static operation_divide(left, right) { return left / right; }
  static operation_remainder(left, right) { return left % right; }
  static operation_equals(left, right) { return left == right; }
  static operation_not_equals(left, right) { return left != right; }
  static operation_identical(left, right) { return left === right; }
  static operation_not_identical(left, right) { return left !== right; }
  static operation_less_then(left, right) { return left < right; }
  static operation_greater_then(left, right) { return left > right; }
  static operation_less_or_equals_then(left, right) { return left <= right; }
  static operation_greater_or_equals_then(left, right) { return left >= right; }
  static operation_logical_and(left, right) { return left && right; }
  static operation_logical_or(left, right) { return left || right; }
  static cond(cond, trueVal, falseVal) { return cond ? trueVal : falseVal; }

  static mapFn(keys: List<any>) {
    function buildMap(values) {
      var res = StringMapWrapper.create();
      for (var i = 0; i < keys.length; ++i) {
        StringMapWrapper.set(res, keys[i], values[i]);
      }
      return res;
    }

    switch (keys.length) {
      case 0:
        return () => [];
      case 1:
        return (a1) => buildMap([a1]);
      case 2:
        return (a1, a2) => buildMap([a1, a2]);
      case 3:
        return (a1, a2, a3) => buildMap([a1, a2, a3]);
      case 4:
        return (a1, a2, a3, a4) => buildMap([a1, a2, a3, a4]);
      case 5:
        return (a1, a2, a3, a4, a5) => buildMap([a1, a2, a3, a4, a5]);
      case 6:
        return (a1, a2, a3, a4, a5, a6) => buildMap([a1, a2, a3, a4, a5, a6]);
      case 7:
        return (a1, a2, a3, a4, a5, a6, a7) => buildMap([a1, a2, a3, a4, a5, a6, a7]);
      case 8:
        return (a1, a2, a3, a4, a5, a6, a7, a8) => buildMap([a1, a2, a3, a4, a5, a6, a7, a8]);
      case 9:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
                   buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
      default:
        throw new BaseException(`Does not support literal maps with more than 9 elements`);
    }
  }

  static keyedAccess(obj, args) { return obj[args[0]]; }

  static unwrapValue(value: any): any {
    if (value instanceof WrappedValue) {
      return value.wrapped;
    } else {
      return value;
    }
  }

  static throwOnChange(proto: ProtoRecord, change) {
    throw new ExpressionChangedAfterItHasBeenChecked(proto, change);
  }

  static throwDehydrated() { throw new DehydratedException(); }

  static changeDetectionMode(strategy: string) {
    return strategy == ON_PUSH ? CHECK_ONCE : CHECK_ALWAYS;
  }

  static simpleChange(previousValue: any, currentValue: any): SimpleChange {
    return _simpleChange(previousValue, currentValue);
  }

  static addChange(changes, propertyName: string, change) {
    if (isBlank(changes)) {
      changes = {};
    }
    changes[propertyName] = change;
    return changes;
  }

  static isValueBlank(value: any): boolean { return isBlank(value); }
}
