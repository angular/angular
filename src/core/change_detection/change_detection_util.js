'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var constants_1 = require('./constants');
var pipe_lifecycle_reflector_1 = require('./pipe_lifecycle_reflector');
var binding_record_1 = require('./binding_record');
var directive_record_1 = require('./directive_record');
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
var WrappedValue = (function () {
    function WrappedValue(wrapped) {
        this.wrapped = wrapped;
    }
    WrappedValue.wrap = function (value) {
        var w = _wrappedValues[_wrappedIndex++ % 5];
        w.wrapped = value;
        return w;
    };
    return WrappedValue;
})();
exports.WrappedValue = WrappedValue;
var _wrappedValues = [
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null)
];
var _wrappedIndex = 0;
var SimpleChange = (function () {
    function SimpleChange(previousValue, currentValue) {
        this.previousValue = previousValue;
        this.currentValue = currentValue;
    }
    SimpleChange.prototype.isFirstChange = function () { return this.previousValue === ChangeDetectionUtil.uninitialized; };
    return SimpleChange;
})();
exports.SimpleChange = SimpleChange;
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
var ChangeDetectionUtil = (function () {
    function ChangeDetectionUtil() {
    }
    ChangeDetectionUtil.arrayFn0 = function () { return []; };
    ChangeDetectionUtil.arrayFn1 = function (a1) { return [a1]; };
    ChangeDetectionUtil.arrayFn2 = function (a1, a2) { return [a1, a2]; };
    ChangeDetectionUtil.arrayFn3 = function (a1, a2, a3) { return [a1, a2, a3]; };
    ChangeDetectionUtil.arrayFn4 = function (a1, a2, a3, a4) { return [a1, a2, a3, a4]; };
    ChangeDetectionUtil.arrayFn5 = function (a1, a2, a3, a4, a5) { return [a1, a2, a3, a4, a5]; };
    ChangeDetectionUtil.arrayFn6 = function (a1, a2, a3, a4, a5, a6) { return [a1, a2, a3, a4, a5, a6]; };
    ChangeDetectionUtil.arrayFn7 = function (a1, a2, a3, a4, a5, a6, a7) { return [a1, a2, a3, a4, a5, a6, a7]; };
    ChangeDetectionUtil.arrayFn8 = function (a1, a2, a3, a4, a5, a6, a7, a8) {
        return [a1, a2, a3, a4, a5, a6, a7, a8];
    };
    ChangeDetectionUtil.arrayFn9 = function (a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return [a1, a2, a3, a4, a5, a6, a7, a8, a9];
    };
    ChangeDetectionUtil.operation_negate = function (value) { return !value; };
    ChangeDetectionUtil.operation_add = function (left, right) { return left + right; };
    ChangeDetectionUtil.operation_subtract = function (left, right) { return left - right; };
    ChangeDetectionUtil.operation_multiply = function (left, right) { return left * right; };
    ChangeDetectionUtil.operation_divide = function (left, right) { return left / right; };
    ChangeDetectionUtil.operation_remainder = function (left, right) { return left % right; };
    ChangeDetectionUtil.operation_equals = function (left, right) { return left == right; };
    ChangeDetectionUtil.operation_not_equals = function (left, right) { return left != right; };
    ChangeDetectionUtil.operation_identical = function (left, right) { return left === right; };
    ChangeDetectionUtil.operation_not_identical = function (left, right) { return left !== right; };
    ChangeDetectionUtil.operation_less_then = function (left, right) { return left < right; };
    ChangeDetectionUtil.operation_greater_then = function (left, right) { return left > right; };
    ChangeDetectionUtil.operation_less_or_equals_then = function (left, right) { return left <= right; };
    ChangeDetectionUtil.operation_greater_or_equals_then = function (left, right) { return left >= right; };
    ChangeDetectionUtil.cond = function (cond, trueVal, falseVal) { return cond ? trueVal : falseVal; };
    ChangeDetectionUtil.mapFn = function (keys) {
        function buildMap(values) {
            var res = collection_1.StringMapWrapper.create();
            for (var i = 0; i < keys.length; ++i) {
                collection_1.StringMapWrapper.set(res, keys[i], values[i]);
            }
            return res;
        }
        switch (keys.length) {
            case 0:
                return function () { return []; };
            case 1:
                return function (a1) { return buildMap([a1]); };
            case 2:
                return function (a1, a2) { return buildMap([a1, a2]); };
            case 3:
                return function (a1, a2, a3) { return buildMap([a1, a2, a3]); };
            case 4:
                return function (a1, a2, a3, a4) { return buildMap([a1, a2, a3, a4]); };
            case 5:
                return function (a1, a2, a3, a4, a5) { return buildMap([a1, a2, a3, a4, a5]); };
            case 6:
                return function (a1, a2, a3, a4, a5, a6) { return buildMap([a1, a2, a3, a4, a5, a6]); };
            case 7:
                return function (a1, a2, a3, a4, a5, a6, a7) { return buildMap([a1, a2, a3, a4, a5, a6, a7]); };
            case 8:
                return function (a1, a2, a3, a4, a5, a6, a7, a8) { return buildMap([a1, a2, a3, a4, a5, a6, a7, a8]); };
            case 9:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                    return buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
                };
            default:
                throw new exceptions_1.BaseException("Does not support literal maps with more than 9 elements");
        }
    };
    ChangeDetectionUtil.keyedAccess = function (obj, args) { return obj[args[0]]; };
    ChangeDetectionUtil.unwrapValue = function (value) {
        if (value instanceof WrappedValue) {
            return value.wrapped;
        }
        else {
            return value;
        }
    };
    ChangeDetectionUtil.changeDetectionMode = function (strategy) {
        return constants_1.isDefaultChangeDetectionStrategy(strategy) ? constants_1.ChangeDetectionStrategy.CheckAlways :
            constants_1.ChangeDetectionStrategy.CheckOnce;
    };
    ChangeDetectionUtil.simpleChange = function (previousValue, currentValue) {
        return _simpleChange(previousValue, currentValue);
    };
    ChangeDetectionUtil.isValueBlank = function (value) { return lang_1.isBlank(value); };
    ChangeDetectionUtil.s = function (value) { return lang_1.isPresent(value) ? "" + value : ''; };
    ChangeDetectionUtil.protoByIndex = function (protos, selfIndex) {
        return selfIndex < 1 ?
            null :
            protos[selfIndex - 1]; // self index is shifted by one because of context
    };
    ChangeDetectionUtil.callPipeOnDestroy = function (selectedPipe) {
        if (pipe_lifecycle_reflector_1.implementsOnDestroy(selectedPipe.pipe)) {
            selectedPipe.pipe.onDestroy();
        }
    };
    ChangeDetectionUtil.bindingTarget = function (mode, elementIndex, name, unit, debug) {
        return new binding_record_1.BindingTarget(mode, elementIndex, name, unit, debug);
    };
    ChangeDetectionUtil.directiveIndex = function (elementIndex, directiveIndex) {
        return new directive_record_1.DirectiveIndex(elementIndex, directiveIndex);
    };
    ChangeDetectionUtil.looseNotIdentical = function (a, b) { return !lang_1.looseIdentical(a, b); };
    ChangeDetectionUtil.uninitialized = lang_1.CONST_EXPR(new Object());
    return ChangeDetectionUtil;
})();
exports.ChangeDetectionUtil = ChangeDetectionUtil;
//# sourceMappingURL=change_detection_util.js.map