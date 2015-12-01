library angular2.src.core.change_detection.change_detection_util;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, Type, StringWrapper, looseIdentical;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, StringMapWrapper;
import "proto_record.dart" show ProtoRecord;
import "constants.dart"
    show ChangeDetectionStrategy, isDefaultChangeDetectionStrategy;
import "pipe_lifecycle_reflector.dart" show implementsOnDestroy;
import "binding_record.dart" show BindingTarget;
import "directive_record.dart" show DirectiveIndex;
import "pipes.dart" show SelectedPipe;

/**
 * Indicates that the result of a [PipeMetadata] transformation has changed even though the
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
class WrappedValue {
  dynamic wrapped;
  WrappedValue(this.wrapped) {}
  static WrappedValue wrap(dynamic value) {
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

class SimpleChange {
  dynamic previousValue;
  dynamic currentValue;
  SimpleChange(this.previousValue, this.currentValue) {}
  bool isFirstChange() {
    return identical(this.previousValue, ChangeDetectionUtil.uninitialized);
  }
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
SimpleChange _simpleChange(previousValue, currentValue) {
  var index = _simpleChangesIndex++ % 20;
  var s = _simpleChanges[index];
  s.previousValue = previousValue;
  s.currentValue = currentValue;
  return s;
}

/* tslint:disable:requireParameterType */
class ChangeDetectionUtil {
  static Object uninitialized = const Object();
  static List<dynamic> arrayFn0() {
    return [];
  }

  static List<dynamic> arrayFn1(a1) {
    return [a1];
  }

  static List<dynamic> arrayFn2(a1, a2) {
    return [a1, a2];
  }

  static List<dynamic> arrayFn3(a1, a2, a3) {
    return [a1, a2, a3];
  }

  static List<dynamic> arrayFn4(a1, a2, a3, a4) {
    return [a1, a2, a3, a4];
  }

  static List<dynamic> arrayFn5(a1, a2, a3, a4, a5) {
    return [a1, a2, a3, a4, a5];
  }

  static List<dynamic> arrayFn6(a1, a2, a3, a4, a5, a6) {
    return [a1, a2, a3, a4, a5, a6];
  }

  static List<dynamic> arrayFn7(a1, a2, a3, a4, a5, a6, a7) {
    return [a1, a2, a3, a4, a5, a6, a7];
  }

  static List<dynamic> arrayFn8(a1, a2, a3, a4, a5, a6, a7, a8) {
    return [a1, a2, a3, a4, a5, a6, a7, a8];
  }

  static List<dynamic> arrayFn9(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    return [a1, a2, a3, a4, a5, a6, a7, a8, a9];
  }

  static dynamic operation_negate(value) {
    return !value;
  }

  static dynamic operation_add(left, right) {
    return left + right;
  }

  static dynamic operation_subtract(left, right) {
    return left - right;
  }

  static dynamic operation_multiply(left, right) {
    return left * right;
  }

  static dynamic operation_divide(left, right) {
    return left / right;
  }

  static dynamic operation_remainder(left, right) {
    return left % right;
  }

  static dynamic operation_equals(left, right) {
    return left == right;
  }

  static dynamic operation_not_equals(left, right) {
    return left != right;
  }

  static dynamic operation_identical(left, right) {
    return identical(left, right);
  }

  static dynamic operation_not_identical(left, right) {
    return !identical(left, right);
  }

  static dynamic operation_less_then(left, right) {
    return left < right;
  }

  static dynamic operation_greater_then(left, right) {
    return left > right;
  }

  static dynamic operation_less_or_equals_then(left, right) {
    return left <= right;
  }

  static dynamic operation_greater_or_equals_then(left, right) {
    return left >= right;
  }

  static dynamic cond(cond, trueVal, falseVal) {
    return cond ? trueVal : falseVal;
  }

  static dynamic mapFn(List<dynamic> keys) {
    Map<String, dynamic> buildMap(values) {
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
        return (a1, a2, a3, a4, a5, a6, a7) =>
            buildMap([a1, a2, a3, a4, a5, a6, a7]);
      case 8:
        return (a1, a2, a3, a4, a5, a6, a7, a8) =>
            buildMap([a1, a2, a3, a4, a5, a6, a7, a8]);
      case 9:
        return (a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
            buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
      default:
        throw new BaseException(
            '''Does not support literal maps with more than 9 elements''');
    }
  }

  static dynamic keyedAccess(obj, args) {
    return obj[args[0]];
  }

  static dynamic unwrapValue(dynamic value) {
    if (value is WrappedValue) {
      return value.wrapped;
    } else {
      return value;
    }
  }

  static ChangeDetectionStrategy changeDetectionMode(
      ChangeDetectionStrategy strategy) {
    return isDefaultChangeDetectionStrategy(strategy)
        ? ChangeDetectionStrategy.CheckAlways
        : ChangeDetectionStrategy.CheckOnce;
  }

  static SimpleChange simpleChange(
      dynamic previousValue, dynamic currentValue) {
    return _simpleChange(previousValue, currentValue);
  }

  static bool isValueBlank(dynamic value) {
    return isBlank(value);
  }

  static String s(dynamic value) {
    return isPresent(value) ? '''${ value}''' : "";
  }

  static ProtoRecord protoByIndex(List<ProtoRecord> protos, num selfIndex) {
    return selfIndex < 1 ? null : protos[selfIndex - 1];
  }

  static void callPipeOnDestroy(SelectedPipe selectedPipe) {
    if (implementsOnDestroy(selectedPipe.pipe)) {
      ((selectedPipe.pipe as dynamic)).ngOnDestroy();
    }
  }

  static BindingTarget bindingTarget(
      String mode, num elementIndex, String name, String unit, String debug) {
    return new BindingTarget(mode, elementIndex, name, unit, debug);
  }

  static DirectiveIndex directiveIndex(num elementIndex, num directiveIndex) {
    return new DirectiveIndex(elementIndex, directiveIndex);
  }

  static bool looseNotIdentical(dynamic a, dynamic b) {
    return !looseIdentical(a, b);
  }
}
