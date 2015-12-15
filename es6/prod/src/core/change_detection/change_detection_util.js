import { CONST_EXPR, isPresent, isBlank, looseIdentical } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ChangeDetectionStrategy, isDefaultChangeDetectionStrategy } from './constants';
import { implementsOnDestroy } from './pipe_lifecycle_reflector';
import { BindingTarget } from './binding_record';
import { DirectiveIndex } from './directive_record';
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
    constructor(wrapped) {
        this.wrapped = wrapped;
    }
    static wrap(value) {
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
/**
 * Represents a basic change from a previous to a new value.
 */
export class SimpleChange {
    constructor(previousValue, currentValue) {
        this.previousValue = previousValue;
        this.currentValue = currentValue;
    }
    /**
     * Check whether the new value is the first value assigned.
     */
    isFirstChange() { return this.previousValue === ChangeDetectionUtil.uninitialized; }
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
/* tslint:disable:requireParameterType */
export class ChangeDetectionUtil {
    static arrayFn0() { return []; }
    static arrayFn1(a1) { return [a1]; }
    static arrayFn2(a1, a2) { return [a1, a2]; }
    static arrayFn3(a1, a2, a3) { return [a1, a2, a3]; }
    static arrayFn4(a1, a2, a3, a4) { return [a1, a2, a3, a4]; }
    static arrayFn5(a1, a2, a3, a4, a5) { return [a1, a2, a3, a4, a5]; }
    static arrayFn6(a1, a2, a3, a4, a5, a6) { return [a1, a2, a3, a4, a5, a6]; }
    static arrayFn7(a1, a2, a3, a4, a5, a6, a7) { return [a1, a2, a3, a4, a5, a6, a7]; }
    static arrayFn8(a1, a2, a3, a4, a5, a6, a7, a8) {
        return [a1, a2, a3, a4, a5, a6, a7, a8];
    }
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
    static cond(cond, trueVal, falseVal) { return cond ? trueVal : falseVal; }
    static mapFn(keys) {
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
                return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
            default:
                throw new BaseException(`Does not support literal maps with more than 9 elements`);
        }
    }
    static keyedAccess(obj, args) { return obj[args[0]]; }
    static unwrapValue(value) {
        if (value instanceof WrappedValue) {
            return value.wrapped;
        }
        else {
            return value;
        }
    }
    static changeDetectionMode(strategy) {
        return isDefaultChangeDetectionStrategy(strategy) ? ChangeDetectionStrategy.CheckAlways :
            ChangeDetectionStrategy.CheckOnce;
    }
    static simpleChange(previousValue, currentValue) {
        return _simpleChange(previousValue, currentValue);
    }
    static isValueBlank(value) { return isBlank(value); }
    static s(value) { return isPresent(value) ? `${value}` : ''; }
    static protoByIndex(protos, selfIndex) {
        return selfIndex < 1 ?
            null :
            protos[selfIndex - 1]; // self index is shifted by one because of context
    }
    static callPipeOnDestroy(selectedPipe) {
        if (implementsOnDestroy(selectedPipe.pipe)) {
            selectedPipe.pipe.ngOnDestroy();
        }
    }
    static bindingTarget(mode, elementIndex, name, unit, debug) {
        return new BindingTarget(mode, elementIndex, name, unit, debug);
    }
    static directiveIndex(elementIndex, directiveIndex) {
        return new DirectiveIndex(elementIndex, directiveIndex);
    }
    static looseNotIdentical(a, b) { return !looseIdentical(a, b); }
}
ChangeDetectionUtil.uninitialized = CONST_EXPR(new Object());
