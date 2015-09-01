import {
  CONST_EXPR,
  isPresent,
  isBlank,
  BaseException,
  Type,
  StringWrapper
} from 'angular2/src/core/facade/lang';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {ProtoRecord} from './proto_record';
import {ChangeDetectionStrategy, isDefaultChangeDetectionStrategy} from './constants';
import {implementsOnDestroy} from './pipe_lifecycle_reflector';
import {BindingTarget} from './binding_record';
import {DirectiveIndex} from './directive_record';


/**
 * Indicates that the result of a {@link PipeMetadata} transformation has changed even though the
 * reference
 * has not changed.
 *
 * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
 *
 * Example:
 *
 * ```
 * if (this._latestValue === this._latestReturnedValue) {
 *    return this._latestReturnedValue;
 *  } else {
 *    this._latestReturnedValue = this._latestValue;
 *    return WrappedValue.wrap(this._latestValue); // this will force update
 *  }
 * ```
 */
export class WrappedValue {
  constructor(public wrapped: any) {}

  static wrap(value: any): WrappedValue {
    var w = _wrappedValues[_wrappedIndex++ % 5];
    w.wrapped = value;
    return w;
  }
}

var _wrappedValues = [
  new WrappedValue(null),
  new WrappedValue(null),
  new WrappedValue(null),
  new WrappedValue(null),
  new WrappedValue(null)
];

var _wrappedIndex = 0;


export class SimpleChange {
  constructor(public previousValue: any, public currentValue: any) {}

  isFirstChange(): boolean { return this.previousValue === ChangeDetectionUtil.uninitialized; }
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

function _simpleChange(previousValue, currentValue): SimpleChange {
  var index = _simpleChangesIndex++ % 20;
  var s = _simpleChanges[index];
  s.previousValue = previousValue;
  s.currentValue = currentValue;
  return s;
}

/* tslint:disable:requireParameterType */
export class ChangeDetectionUtil {
  static uninitialized: Object = CONST_EXPR<Object>(new Object());

  static arrayFn0(): any[] { return []; }
  static arrayFn1(a1): any[] { return [a1]; }
  static arrayFn2(a1, a2): any[] { return [a1, a2]; }
  static arrayFn3(a1, a2, a3): any[] { return [a1, a2, a3]; }
  static arrayFn4(a1, a2, a3, a4): any[] { return [a1, a2, a3, a4]; }
  static arrayFn5(a1, a2, a3, a4, a5): any[] { return [a1, a2, a3, a4, a5]; }
  static arrayFn6(a1, a2, a3, a4, a5, a6): any[] { return [a1, a2, a3, a4, a5, a6]; }
  static arrayFn7(a1, a2, a3, a4, a5, a6, a7): any[] { return [a1, a2, a3, a4, a5, a6, a7]; }
  static arrayFn8(a1, a2, a3, a4, a5, a6, a7, a8): any[] {
    return [a1, a2, a3, a4, a5, a6, a7, a8];
  }
  static arrayFn9(a1, a2, a3, a4, a5, a6, a7, a8, a9): any[] {
    return [a1, a2, a3, a4, a5, a6, a7, a8, a9];
  }

  static operation_negate(value): any { return !value; }
  static operation_add(left, right): any { return left + right; }
  static operation_subtract(left, right): any { return left - right; }
  static operation_multiply(left, right): any { return left * right; }
  static operation_divide(left, right): any { return left / right; }
  static operation_remainder(left, right): any { return left % right; }
  static operation_equals(left, right): any { return left == right; }
  static operation_not_equals(left, right): any { return left != right; }
  static operation_identical(left, right): any { return left === right; }
  static operation_not_identical(left, right): any { return left !== right; }
  static operation_less_then(left, right): any { return left < right; }
  static operation_greater_then(left, right): any { return left > right; }
  static operation_less_or_equals_then(left, right): any { return left <= right; }
  static operation_greater_or_equals_then(left, right): any { return left >= right; }
  static operation_logical_and(left, right): any { return left && right; }
  static operation_logical_or(left, right): any { return left || right; }
  static cond(cond, trueVal, falseVal): any { return cond ? trueVal : falseVal; }

  static mapFn(keys: any[]): any {
    function buildMap(values): StringMap<any, any> {
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

  static keyedAccess(obj, args): any { return obj[args[0]]; }

  static unwrapValue(value: any): any {
    if (value instanceof WrappedValue) {
      return value.wrapped;
    } else {
      return value;
    }
  }

  static changeDetectionMode(strategy: ChangeDetectionStrategy): ChangeDetectionStrategy {
    return isDefaultChangeDetectionStrategy(strategy) ? ChangeDetectionStrategy.CheckAlways :
                                                        ChangeDetectionStrategy.CheckOnce;
  }

  static simpleChange(previousValue: any, currentValue: any): SimpleChange {
    return _simpleChange(previousValue, currentValue);
  }

  static isValueBlank(value: any): boolean { return isBlank(value); }

  static s(value: any): string { return isPresent(value) ? `${value}` : ''; }

  static protoByIndex(protos: ProtoRecord[], selfIndex: number): ProtoRecord {
    return selfIndex < 1 ?
               null :
               protos[selfIndex - 1];  // self index is shifted by one because of context
  }

  static callPipeOnDestroy(pipe: any): void {
    if (implementsOnDestroy(pipe)) {
      pipe.onDestroy();
    }
  }

  static bindingTarget(mode: string, elementIndex: number, name: string, unit: string,
                       debug: string): BindingTarget {
    return new BindingTarget(mode, elementIndex, name, unit, debug);
  }

  static directiveIndex(elementIndex: number, directiveIndex: number): DirectiveIndex {
    return new DirectiveIndex(elementIndex, directiveIndex);
  }
}
