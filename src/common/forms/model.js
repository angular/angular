'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var promise_1 = require('angular2/src/facade/promise');
var collection_1 = require('angular2/src/facade/collection');
/**
 * Indicates that a Control is valid, i.e. that no errors exist in the input value.
 */
exports.VALID = "VALID";
/**
 * Indicates that a Control is invalid, i.e. that an error exists in the input value.
 */
exports.INVALID = "INVALID";
/**
 * Indicates that a Control is pending, i.e. that async validation is occuring and
 * errors are not yet available for the input value.
 */
exports.PENDING = "PENDING";
function isControl(control) {
    return control instanceof AbstractControl;
}
exports.isControl = isControl;
function _find(control, path) {
    if (lang_1.isBlank(path))
        return null;
    if (!(path instanceof Array)) {
        path = path.split("/");
    }
    if (path instanceof Array && collection_1.ListWrapper.isEmpty(path))
        return null;
    return path
        .reduce(function (v, name) {
        if (v instanceof ControlGroup) {
            return lang_1.isPresent(v.controls[name]) ? v.controls[name] : null;
        }
        else if (v instanceof ControlArray) {
            var index = name;
            return lang_1.isPresent(v.at(index)) ? v.at(index) : null;
        }
        else {
            return null;
        }
    }, control);
}
function toObservable(r) {
    return promise_1.PromiseWrapper.isPromise(r) ? async_1.ObservableWrapper.fromPromise(r) : r;
}
/**
 *
 */
var AbstractControl = (function () {
    function AbstractControl(validator, asyncValidator) {
        this.validator = validator;
        this.asyncValidator = asyncValidator;
        this._pristine = true;
        this._touched = false;
    }
    Object.defineProperty(AbstractControl.prototype, "value", {
        get: function () { return this._value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "status", {
        get: function () { return this._status; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "valid", {
        get: function () { return this._status === exports.VALID; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "errors", {
        /**
         * Returns the errors of this control.
         */
        get: function () { return this._errors; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "pristine", {
        get: function () { return this._pristine; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "dirty", {
        get: function () { return !this.pristine; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "touched", {
        get: function () { return this._touched; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "untouched", {
        get: function () { return !this._touched; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "valueChanges", {
        get: function () { return this._valueChanges; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "statusChanges", {
        get: function () { return this._statusChanges; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractControl.prototype, "pending", {
        get: function () { return this._status == exports.PENDING; },
        enumerable: true,
        configurable: true
    });
    AbstractControl.prototype.markAsTouched = function () { this._touched = true; };
    AbstractControl.prototype.markAsDirty = function (_a) {
        var onlySelf = (_a === void 0 ? {} : _a).onlySelf;
        onlySelf = lang_1.normalizeBool(onlySelf);
        this._pristine = false;
        if (lang_1.isPresent(this._parent) && !onlySelf) {
            this._parent.markAsDirty({ onlySelf: onlySelf });
        }
    };
    AbstractControl.prototype.markAsPending = function (_a) {
        var onlySelf = (_a === void 0 ? {} : _a).onlySelf;
        onlySelf = lang_1.normalizeBool(onlySelf);
        this._status = exports.PENDING;
        if (lang_1.isPresent(this._parent) && !onlySelf) {
            this._parent.markAsPending({ onlySelf: onlySelf });
        }
    };
    AbstractControl.prototype.setParent = function (parent) { this._parent = parent; };
    AbstractControl.prototype.updateValueAndValidity = function (_a) {
        var _b = _a === void 0 ? {} : _a, onlySelf = _b.onlySelf, emitEvent = _b.emitEvent;
        onlySelf = lang_1.normalizeBool(onlySelf);
        emitEvent = lang_1.isPresent(emitEvent) ? emitEvent : true;
        this._updateValue();
        this._errors = this._runValidator();
        this._status = this._calculateStatus();
        if (this._status == exports.VALID || this._status == exports.PENDING) {
            this._runAsyncValidator(emitEvent);
        }
        if (emitEvent) {
            async_1.ObservableWrapper.callEmit(this._valueChanges, this._value);
            async_1.ObservableWrapper.callEmit(this._statusChanges, this._status);
        }
        if (lang_1.isPresent(this._parent) && !onlySelf) {
            this._parent.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
        }
    };
    AbstractControl.prototype._runValidator = function () { return lang_1.isPresent(this.validator) ? this.validator(this) : null; };
    AbstractControl.prototype._runAsyncValidator = function (emitEvent) {
        var _this = this;
        if (lang_1.isPresent(this.asyncValidator)) {
            this._status = exports.PENDING;
            this._cancelExistingSubscription();
            var obs = toObservable(this.asyncValidator(this));
            this._asyncValidationSubscription =
                async_1.ObservableWrapper.subscribe(obs, function (res) { return _this.setErrors(res, { emitEvent: emitEvent }); });
        }
    };
    AbstractControl.prototype._cancelExistingSubscription = function () {
        if (lang_1.isPresent(this._asyncValidationSubscription)) {
            async_1.ObservableWrapper.dispose(this._asyncValidationSubscription);
        }
    };
    /**
     * Sets errors on a control.
     *
     * This is used when validations are run not automatically, but manually by the user.
     *
     * Calling `setErrors` will also update the validity of the parent control.
     *
     * ## Usage
     *
     * ```
     * var login = new Control("someLogin");
     * login.setErrors({
     *   "notUnique": true
     * });
     *
     * expect(login.valid).toEqual(false);
     * expect(login.errors).toEqual({"notUnique": true});
     *
     * login.updateValue("someOtherLogin");
     *
     * expect(login.valid).toEqual(true);
     * ```
     */
    AbstractControl.prototype.setErrors = function (errors, _a) {
        var emitEvent = (_a === void 0 ? {} : _a).emitEvent;
        emitEvent = lang_1.isPresent(emitEvent) ? emitEvent : true;
        this._errors = errors;
        this._status = this._calculateStatus();
        if (emitEvent) {
            async_1.ObservableWrapper.callEmit(this._statusChanges, this._status);
        }
        if (lang_1.isPresent(this._parent)) {
            this._parent._updateControlsErrors();
        }
    };
    AbstractControl.prototype.find = function (path) { return _find(this, path); };
    AbstractControl.prototype.getError = function (errorCode, path) {
        if (path === void 0) { path = null; }
        var control = lang_1.isPresent(path) && !collection_1.ListWrapper.isEmpty(path) ? this.find(path) : this;
        if (lang_1.isPresent(control) && lang_1.isPresent(control._errors)) {
            return collection_1.StringMapWrapper.get(control._errors, errorCode);
        }
        else {
            return null;
        }
    };
    AbstractControl.prototype.hasError = function (errorCode, path) {
        if (path === void 0) { path = null; }
        return lang_1.isPresent(this.getError(errorCode, path));
    };
    /** @internal */
    AbstractControl.prototype._updateControlsErrors = function () {
        this._status = this._calculateStatus();
        if (lang_1.isPresent(this._parent)) {
            this._parent._updateControlsErrors();
        }
    };
    /** @internal */
    AbstractControl.prototype._initObservables = function () {
        this._valueChanges = new async_1.EventEmitter();
        this._statusChanges = new async_1.EventEmitter();
    };
    AbstractControl.prototype._calculateStatus = function () {
        if (lang_1.isPresent(this._errors))
            return exports.INVALID;
        if (this._anyControlsHaveStatus(exports.PENDING))
            return exports.PENDING;
        if (this._anyControlsHaveStatus(exports.INVALID))
            return exports.INVALID;
        return exports.VALID;
    };
    return AbstractControl;
})();
exports.AbstractControl = AbstractControl;
/**
 * Defines a part of a form that cannot be divided into other controls. `Control`s have values and
 * validation state, which is determined by an optional validation function.
 *
 * `Control` is one of the three fundamental building blocks used to define forms in Angular, along
 * with {@link ControlGroup} and {@link ControlArray}.
 *
 * ## Usage
 *
 * By default, a `Control` is created for every `<input>` or other form component.
 * With {@link NgFormControl} or {@link NgFormModel} an existing {@link Control} can be
 * bound to a DOM element instead. This `Control` can be configured with a custom
 * validation function.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
var Control = (function (_super) {
    __extends(Control, _super);
    function Control(value, validator, asyncValidator) {
        if (value === void 0) { value = null; }
        if (validator === void 0) { validator = null; }
        if (asyncValidator === void 0) { asyncValidator = null; }
        _super.call(this, validator, asyncValidator);
        this._value = value;
        this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this._initObservables();
    }
    /**
     * Set the value of the control to `value`.
     *
     * If `onlySelf` is `true`, this change will only affect the validation of this `Control`
     * and not its parent component. If `emitEvent` is `true`, this change will cause a
     * `valueChanges` event on the `Control` to be emitted. Both of these options default to
     * `false`.
     *
     * If `emitModelToViewChange` is `true`, the view will be notified about the new value
     * via an `onChange` event. This is the default behavior if `emitModelToViewChange` is not
     * specified.
     */
    Control.prototype.updateValue = function (value, _a) {
        var _b = _a === void 0 ? {} : _a, onlySelf = _b.onlySelf, emitEvent = _b.emitEvent, emitModelToViewChange = _b.emitModelToViewChange;
        emitModelToViewChange = lang_1.isPresent(emitModelToViewChange) ? emitModelToViewChange : true;
        this._value = value;
        if (lang_1.isPresent(this._onChange) && emitModelToViewChange)
            this._onChange(this._value);
        this.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
    };
    /**
     * @internal
     */
    Control.prototype._updateValue = function () { };
    /**
     * @internal
     */
    Control.prototype._anyControlsHaveStatus = function (status) { return false; };
    /**
     * Register a listener for change events.
     */
    Control.prototype.registerOnChange = function (fn) { this._onChange = fn; };
    return Control;
})(AbstractControl);
exports.Control = Control;
/**
 * Defines a part of a form, of fixed length, that can contain other controls.
 *
 * A `ControlGroup` aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls in a group is invalid, the entire group is invalid. Similarly, if a control
 * changes its value, the entire group changes as well.
 *
 * `ControlGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link Control} and {@link ControlArray}. {@link ControlArray} can also contain other
 * controls, but is of variable length.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
var ControlGroup = (function (_super) {
    __extends(ControlGroup, _super);
    function ControlGroup(controls, optionals, validator, asyncValidator) {
        if (optionals === void 0) { optionals = null; }
        if (validator === void 0) { validator = null; }
        if (asyncValidator === void 0) { asyncValidator = null; }
        _super.call(this, validator, asyncValidator);
        this.controls = controls;
        this._optionals = lang_1.isPresent(optionals) ? optionals : {};
        this._initObservables();
        this._setParentForControls();
        this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    /**
     * Add a control to this group.
     */
    ControlGroup.prototype.addControl = function (name, control) {
        this.controls[name] = control;
        control.setParent(this);
    };
    /**
     * Remove a control from this group.
     */
    ControlGroup.prototype.removeControl = function (name) { collection_1.StringMapWrapper.delete(this.controls, name); };
    /**
     * Mark the named control as non-optional.
     */
    ControlGroup.prototype.include = function (controlName) {
        collection_1.StringMapWrapper.set(this._optionals, controlName, true);
        this.updateValueAndValidity();
    };
    /**
     * Mark the named control as optional.
     */
    ControlGroup.prototype.exclude = function (controlName) {
        collection_1.StringMapWrapper.set(this._optionals, controlName, false);
        this.updateValueAndValidity();
    };
    /**
     * Check whether there is a control with the given name in the group.
     */
    ControlGroup.prototype.contains = function (controlName) {
        var c = collection_1.StringMapWrapper.contains(this.controls, controlName);
        return c && this._included(controlName);
    };
    /** @internal */
    ControlGroup.prototype._setParentForControls = function () {
        var _this = this;
        collection_1.StringMapWrapper.forEach(this.controls, function (control, name) { control.setParent(_this); });
    };
    /** @internal */
    ControlGroup.prototype._updateValue = function () { this._value = this._reduceValue(); };
    /** @internal */
    ControlGroup.prototype._anyControlsHaveStatus = function (status) {
        var _this = this;
        var res = false;
        collection_1.StringMapWrapper.forEach(this.controls, function (control, name) {
            res = res || (_this.contains(name) && control.status == status);
        });
        return res;
    };
    /** @internal */
    ControlGroup.prototype._reduceValue = function () {
        return this._reduceChildren({}, function (acc, control, name) {
            acc[name] = control.value;
            return acc;
        });
    };
    /** @internal */
    ControlGroup.prototype._reduceChildren = function (initValue, fn) {
        var _this = this;
        var res = initValue;
        collection_1.StringMapWrapper.forEach(this.controls, function (control, name) {
            if (_this._included(name)) {
                res = fn(res, control, name);
            }
        });
        return res;
    };
    /** @internal */
    ControlGroup.prototype._included = function (controlName) {
        var isOptional = collection_1.StringMapWrapper.contains(this._optionals, controlName);
        return !isOptional || collection_1.StringMapWrapper.get(this._optionals, controlName);
    };
    return ControlGroup;
})(AbstractControl);
exports.ControlGroup = ControlGroup;
/**
 * Defines a part of a form, of variable length, that can contain other controls.
 *
 * A `ControlArray` aggregates the values and errors of each {@link Control} in the group. Thus, if
 * one of the controls in a group is invalid, the entire group is invalid. Similarly, if a control
 * changes its value, the entire group changes as well.
 *
 * `ControlArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with {@link Control} and {@link ControlGroup}. {@link ControlGroup} can also contain
 * other controls, but is of fixed length.
 *
 * ## Adding or removing controls
 *
 * To change the controls in the array, use the `push`, `insert`, or `removeAt` methods
 * in `ControlArray` itself. These methods ensure the controls are properly tracked in the
 * form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
 * the `ControlArray` directly, as that will result in strange and unexpected behavior such
 * as broken change detection.
 *
 * ### Example ([live demo](http://plnkr.co/edit/23DESOpbNnBpBHZt1BR4?p=preview))
 */
var ControlArray = (function (_super) {
    __extends(ControlArray, _super);
    function ControlArray(controls, validator, asyncValidator) {
        if (validator === void 0) { validator = null; }
        if (asyncValidator === void 0) { asyncValidator = null; }
        _super.call(this, validator, asyncValidator);
        this.controls = controls;
        this._initObservables();
        this._setParentForControls();
        this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    /**
     * Get the {@link AbstractControl} at the given `index` in the array.
     */
    ControlArray.prototype.at = function (index) { return this.controls[index]; };
    /**
     * Insert a new {@link AbstractControl} at the end of the array.
     */
    ControlArray.prototype.push = function (control) {
        this.controls.push(control);
        control.setParent(this);
        this.updateValueAndValidity();
    };
    /**
     * Insert a new {@link AbstractControl} at the given `index` in the array.
     */
    ControlArray.prototype.insert = function (index, control) {
        collection_1.ListWrapper.insert(this.controls, index, control);
        control.setParent(this);
        this.updateValueAndValidity();
    };
    /**
     * Remove the control at the given `index` in the array.
     */
    ControlArray.prototype.removeAt = function (index) {
        collection_1.ListWrapper.removeAt(this.controls, index);
        this.updateValueAndValidity();
    };
    Object.defineProperty(ControlArray.prototype, "length", {
        /**
         * Length of the control array.
         */
        get: function () { return this.controls.length; },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    ControlArray.prototype._updateValue = function () { this._value = this.controls.map(function (control) { return control.value; }); };
    /** @internal */
    ControlArray.prototype._anyControlsHaveStatus = function (status) {
        return this.controls.some(function (c) { return c.status == status; });
    };
    /** @internal */
    ControlArray.prototype._setParentForControls = function () {
        var _this = this;
        this.controls.forEach(function (control) { control.setParent(_this); });
    };
    return ControlArray;
})(AbstractControl);
exports.ControlArray = ControlArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL21vZGVsLnRzIl0sIm5hbWVzIjpbImlzQ29udHJvbCIsIl9maW5kIiwidG9PYnNlcnZhYmxlIiwiQWJzdHJhY3RDb250cm9sIiwiQWJzdHJhY3RDb250cm9sLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RDb250cm9sLnZhbHVlIiwiQWJzdHJhY3RDb250cm9sLnN0YXR1cyIsIkFic3RyYWN0Q29udHJvbC52YWxpZCIsIkFic3RyYWN0Q29udHJvbC5lcnJvcnMiLCJBYnN0cmFjdENvbnRyb2wucHJpc3RpbmUiLCJBYnN0cmFjdENvbnRyb2wuZGlydHkiLCJBYnN0cmFjdENvbnRyb2wudG91Y2hlZCIsIkFic3RyYWN0Q29udHJvbC51bnRvdWNoZWQiLCJBYnN0cmFjdENvbnRyb2wudmFsdWVDaGFuZ2VzIiwiQWJzdHJhY3RDb250cm9sLnN0YXR1c0NoYW5nZXMiLCJBYnN0cmFjdENvbnRyb2wucGVuZGluZyIsIkFic3RyYWN0Q29udHJvbC5tYXJrQXNUb3VjaGVkIiwiQWJzdHJhY3RDb250cm9sLm1hcmtBc0RpcnR5IiwiQWJzdHJhY3RDb250cm9sLm1hcmtBc1BlbmRpbmciLCJBYnN0cmFjdENvbnRyb2wuc2V0UGFyZW50IiwiQWJzdHJhY3RDb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkiLCJBYnN0cmFjdENvbnRyb2wuX3J1blZhbGlkYXRvciIsIkFic3RyYWN0Q29udHJvbC5fcnVuQXN5bmNWYWxpZGF0b3IiLCJBYnN0cmFjdENvbnRyb2wuX2NhbmNlbEV4aXN0aW5nU3Vic2NyaXB0aW9uIiwiQWJzdHJhY3RDb250cm9sLnNldEVycm9ycyIsIkFic3RyYWN0Q29udHJvbC5maW5kIiwiQWJzdHJhY3RDb250cm9sLmdldEVycm9yIiwiQWJzdHJhY3RDb250cm9sLmhhc0Vycm9yIiwiQWJzdHJhY3RDb250cm9sLl91cGRhdGVDb250cm9sc0Vycm9ycyIsIkFic3RyYWN0Q29udHJvbC5faW5pdE9ic2VydmFibGVzIiwiQWJzdHJhY3RDb250cm9sLl9jYWxjdWxhdGVTdGF0dXMiLCJDb250cm9sIiwiQ29udHJvbC5jb25zdHJ1Y3RvciIsIkNvbnRyb2wudXBkYXRlVmFsdWUiLCJDb250cm9sLl91cGRhdGVWYWx1ZSIsIkNvbnRyb2wuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyIsIkNvbnRyb2wucmVnaXN0ZXJPbkNoYW5nZSIsIkNvbnRyb2xHcm91cCIsIkNvbnRyb2xHcm91cC5jb25zdHJ1Y3RvciIsIkNvbnRyb2xHcm91cC5hZGRDb250cm9sIiwiQ29udHJvbEdyb3VwLnJlbW92ZUNvbnRyb2wiLCJDb250cm9sR3JvdXAuaW5jbHVkZSIsIkNvbnRyb2xHcm91cC5leGNsdWRlIiwiQ29udHJvbEdyb3VwLmNvbnRhaW5zIiwiQ29udHJvbEdyb3VwLl9zZXRQYXJlbnRGb3JDb250cm9scyIsIkNvbnRyb2xHcm91cC5fdXBkYXRlVmFsdWUiLCJDb250cm9sR3JvdXAuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyIsIkNvbnRyb2xHcm91cC5fcmVkdWNlVmFsdWUiLCJDb250cm9sR3JvdXAuX3JlZHVjZUNoaWxkcmVuIiwiQ29udHJvbEdyb3VwLl9pbmNsdWRlZCIsIkNvbnRyb2xBcnJheSIsIkNvbnRyb2xBcnJheS5jb25zdHJ1Y3RvciIsIkNvbnRyb2xBcnJheS5hdCIsIkNvbnRyb2xBcnJheS5wdXNoIiwiQ29udHJvbEFycmF5Lmluc2VydCIsIkNvbnRyb2xBcnJheS5yZW1vdmVBdCIsIkNvbnRyb2xBcnJheS5sZW5ndGgiLCJDb250cm9sQXJyYXkuX3VwZGF0ZVZhbHVlIiwiQ29udHJvbEFycmF5Ll9hbnlDb250cm9sc0hhdmVTdGF0dXMiLCJDb250cm9sQXJyYXkuX3NldFBhcmVudEZvckNvbnRyb2xzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFCQUErRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzFGLHNCQUEwRCwyQkFBMkIsQ0FBQyxDQUFBO0FBQ3RGLHdC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aEJBLDZDQUFzQkEsR0FBdEJBLFVBQXVCQSxNQUFjQTtRQUNuQ1EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQUEsQ0FBQ0EsSUFBSUEsT0FBQUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsTUFBTUEsRUFBbEJBLENBQWtCQSxDQUFDQSxDQUFDQTtJQUNyREEsQ0FBQ0E7SUFHRFIsZ0JBQWdCQTtJQUNoQkEsNENBQXFCQSxHQUFyQkE7UUFBQVMsaUJBRUNBO1FBRENBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLFVBQUNBLE9BQU9BLElBQU9BLE9BQU9BLENBQUNBLFNBQVNBLENBQUNBLEtBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ25FQSxDQUFDQTtJQUNIVCxtQkFBQ0E7QUFBREEsQ0FBQ0EsQUExREQsRUFBa0MsZUFBZSxFQTBEaEQ7QUExRFksb0JBQVksZUEwRHhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1N0cmluZ1dyYXBwZXIsIGlzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQm9vbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgRXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBJbmRpY2F0ZXMgdGhhdCBhIENvbnRyb2wgaXMgdmFsaWQsIGkuZS4gdGhhdCBubyBlcnJvcnMgZXhpc3QgaW4gdGhlIGlucHV0IHZhbHVlLlxuICovXG5leHBvcnQgY29uc3QgVkFMSUQgPSBcIlZBTElEXCI7XG5cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgYSBDb250cm9sIGlzIGludmFsaWQsIGkuZS4gdGhhdCBhbiBlcnJvciBleGlzdHMgaW4gdGhlIGlucHV0IHZhbHVlLlxuICovXG5leHBvcnQgY29uc3QgSU5WQUxJRCA9IFwiSU5WQUxJRFwiO1xuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IGEgQ29udHJvbCBpcyBwZW5kaW5nLCBpLmUuIHRoYXQgYXN5bmMgdmFsaWRhdGlvbiBpcyBvY2N1cmluZyBhbmRcbiAqIGVycm9ycyBhcmUgbm90IHlldCBhdmFpbGFibGUgZm9yIHRoZSBpbnB1dCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IFBFTkRJTkcgPSBcIlBFTkRJTkdcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29udHJvbChjb250cm9sOiBPYmplY3QpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvbnRyb2wgaW5zdGFuY2VvZiBBYnN0cmFjdENvbnRyb2w7XG59XG5cbmZ1bmN0aW9uIF9maW5kKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgcGF0aDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPnwgc3RyaW5nKSB7XG4gIGlmIChpc0JsYW5rKHBhdGgpKSByZXR1cm4gbnVsbDtcblxuICBpZiAoIShwYXRoIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgcGF0aCA9ICg8c3RyaW5nPnBhdGgpLnNwbGl0KFwiL1wiKTtcbiAgfVxuICBpZiAocGF0aCBpbnN0YW5jZW9mIEFycmF5ICYmIExpc3RXcmFwcGVyLmlzRW1wdHkocGF0aCkpIHJldHVybiBudWxsO1xuXG4gIHJldHVybiAoPEFycmF5PHN0cmluZyB8IG51bWJlcj4+cGF0aClcbiAgICAgIC5yZWR1Y2UoKHYsIG5hbWUpID0+IHtcbiAgICAgICAgaWYgKHYgaW5zdGFuY2VvZiBDb250cm9sR3JvdXApIHtcbiAgICAgICAgICByZXR1cm4gaXNQcmVzZW50KHYuY29udHJvbHNbbmFtZV0pID8gdi5jb250cm9sc1tuYW1lXSA6IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodiBpbnN0YW5jZW9mIENvbnRyb2xBcnJheSkge1xuICAgICAgICAgIHZhciBpbmRleCA9IDxudW1iZXI+bmFtZTtcbiAgICAgICAgICByZXR1cm4gaXNQcmVzZW50KHYuYXQoaW5kZXgpKSA/IHYuYXQoaW5kZXgpIDogbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgY29udHJvbCk7XG59XG5cbmZ1bmN0aW9uIHRvT2JzZXJ2YWJsZShyOiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuaXNQcm9taXNlKHIpID8gT2JzZXJ2YWJsZVdyYXBwZXIuZnJvbVByb21pc2UocikgOiByO1xufVxuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnN0cmFjdENvbnRyb2wge1xuICAvKiogQGludGVybmFsICovXG4gIF92YWx1ZTogYW55O1xuXG4gIHByaXZhdGUgX3ZhbHVlQ2hhbmdlczogRXZlbnRFbWl0dGVyPGFueT47XG4gIHByaXZhdGUgX3N0YXR1c0NoYW5nZXM6IEV2ZW50RW1pdHRlcjxhbnk+O1xuICBwcml2YXRlIF9zdGF0dXM6IHN0cmluZztcbiAgcHJpdmF0ZSBfZXJyb3JzOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgcHJpdmF0ZSBfcHJpc3RpbmU6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIF90b3VjaGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3BhcmVudDogQ29udHJvbEdyb3VwIHwgQ29udHJvbEFycmF5O1xuICBwcml2YXRlIF9hc3luY1ZhbGlkYXRpb25TdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3IocHVibGljIHZhbGlkYXRvcjogRnVuY3Rpb24sIHB1YmxpYyBhc3luY1ZhbGlkYXRvcjogRnVuY3Rpb24pIHt9XG5cbiAgZ2V0IHZhbHVlKCk6IGFueSB7IHJldHVybiB0aGlzLl92YWx1ZTsgfVxuXG4gIGdldCBzdGF0dXMoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX3N0YXR1czsgfVxuXG4gIGdldCB2YWxpZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0YXR1cyA9PT0gVkFMSUQ7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZXJyb3JzIG9mIHRoaXMgY29udHJvbC5cbiAgICovXG4gIGdldCBlcnJvcnMoKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gdGhpcy5fZXJyb3JzOyB9XG5cbiAgZ2V0IHByaXN0aW5lKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcHJpc3RpbmU7IH1cblxuICBnZXQgZGlydHkoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5wcmlzdGluZTsgfVxuXG4gIGdldCB0b3VjaGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdG91Y2hlZDsgfVxuXG4gIGdldCB1bnRvdWNoZWQoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5fdG91Y2hlZDsgfVxuXG4gIGdldCB2YWx1ZUNoYW5nZXMoKTogT2JzZXJ2YWJsZTxhbnk+IHsgcmV0dXJuIHRoaXMuX3ZhbHVlQ2hhbmdlczsgfVxuXG4gIGdldCBzdGF0dXNDaGFuZ2VzKCk6IE9ic2VydmFibGU8YW55PiB7IHJldHVybiB0aGlzLl9zdGF0dXNDaGFuZ2VzOyB9XG5cbiAgZ2V0IHBlbmRpbmcoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdGF0dXMgPT0gUEVORElORzsgfVxuXG4gIG1hcmtBc1RvdWNoZWQoKTogdm9pZCB7IHRoaXMuX3RvdWNoZWQgPSB0cnVlOyB9XG5cbiAgbWFya0FzRGlydHkoe29ubHlTZWxmfToge29ubHlTZWxmPzogYm9vbGVhbn0gPSB7fSk6IHZvaWQge1xuICAgIG9ubHlTZWxmID0gbm9ybWFsaXplQm9vbChvbmx5U2VsZik7XG4gICAgdGhpcy5fcHJpc3RpbmUgPSBmYWxzZTtcblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fcGFyZW50KSAmJiAhb25seVNlbGYpIHtcbiAgICAgIHRoaXMuX3BhcmVudC5tYXJrQXNEaXJ0eSh7b25seVNlbGY6IG9ubHlTZWxmfSk7XG4gICAgfVxuICB9XG5cbiAgbWFya0FzUGVuZGluZyh7b25seVNlbGZ9OiB7b25seVNlbGY/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgb25seVNlbGYgPSBub3JtYWxpemVCb29sKG9ubHlTZWxmKTtcbiAgICB0aGlzLl9zdGF0dXMgPSBQRU5ESU5HO1xuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXJlbnQpICYmICFvbmx5U2VsZikge1xuICAgICAgdGhpcy5fcGFyZW50Lm1hcmtBc1BlbmRpbmcoe29ubHlTZWxmOiBvbmx5U2VsZn0pO1xuICAgIH1cbiAgfVxuXG4gIHNldFBhcmVudChwYXJlbnQ6IENvbnRyb2xHcm91cCB8IENvbnRyb2xBcnJheSk6IHZvaWQgeyB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7IH1cblxuICB1cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KFxuICAgICAge29ubHlTZWxmLCBlbWl0RXZlbnR9OiB7b25seVNlbGY/OiBib29sZWFuLCBlbWl0RXZlbnQ/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgb25seVNlbGYgPSBub3JtYWxpemVCb29sKG9ubHlTZWxmKTtcbiAgICBlbWl0RXZlbnQgPSBpc1ByZXNlbnQoZW1pdEV2ZW50KSA/IGVtaXRFdmVudCA6IHRydWU7XG5cbiAgICB0aGlzLl91cGRhdGVWYWx1ZSgpO1xuXG4gICAgdGhpcy5fZXJyb3JzID0gdGhpcy5fcnVuVmFsaWRhdG9yKCk7XG4gICAgdGhpcy5fc3RhdHVzID0gdGhpcy5fY2FsY3VsYXRlU3RhdHVzKCk7XG5cbiAgICBpZiAodGhpcy5fc3RhdHVzID09IFZBTElEIHx8IHRoaXMuX3N0YXR1cyA9PSBQRU5ESU5HKSB7XG4gICAgICB0aGlzLl9ydW5Bc3luY1ZhbGlkYXRvcihlbWl0RXZlbnQpO1xuICAgIH1cblxuICAgIGlmIChlbWl0RXZlbnQpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3ZhbHVlQ2hhbmdlcywgdGhpcy5fdmFsdWUpO1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3RhdHVzQ2hhbmdlcywgdGhpcy5fc3RhdHVzKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhcmVudCkgJiYgIW9ubHlTZWxmKSB7XG4gICAgICB0aGlzLl9wYXJlbnQudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7b25seVNlbGY6IG9ubHlTZWxmLCBlbWl0RXZlbnQ6IGVtaXRFdmVudH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3J1blZhbGlkYXRvcigpIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLnZhbGlkYXRvcikgPyB0aGlzLnZhbGlkYXRvcih0aGlzKSA6IG51bGw7IH1cblxuICBwcml2YXRlIF9ydW5Bc3luY1ZhbGlkYXRvcihlbWl0RXZlbnQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuYXN5bmNWYWxpZGF0b3IpKSB7XG4gICAgICB0aGlzLl9zdGF0dXMgPSBQRU5ESU5HO1xuICAgICAgdGhpcy5fY2FuY2VsRXhpc3RpbmdTdWJzY3JpcHRpb24oKTtcbiAgICAgIHZhciBvYnMgPSB0b09ic2VydmFibGUodGhpcy5hc3luY1ZhbGlkYXRvcih0aGlzKSk7XG4gICAgICB0aGlzLl9hc3luY1ZhbGlkYXRpb25TdWJzY3JpcHRpb24gPVxuICAgICAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShvYnMsIHJlcyA9PiB0aGlzLnNldEVycm9ycyhyZXMsIHtlbWl0RXZlbnQ6IGVtaXRFdmVudH0pKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jYW5jZWxFeGlzdGluZ1N1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2FzeW5jVmFsaWRhdGlvblN1YnNjcmlwdGlvbikpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fYXN5bmNWYWxpZGF0aW9uU3Vic2NyaXB0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBlcnJvcnMgb24gYSBjb250cm9sLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgd2hlbiB2YWxpZGF0aW9ucyBhcmUgcnVuIG5vdCBhdXRvbWF0aWNhbGx5LCBidXQgbWFudWFsbHkgYnkgdGhlIHVzZXIuXG4gICAqXG4gICAqIENhbGxpbmcgYHNldEVycm9yc2Agd2lsbCBhbHNvIHVwZGF0ZSB0aGUgdmFsaWRpdHkgb2YgdGhlIHBhcmVudCBjb250cm9sLlxuICAgKlxuICAgKiAjIyBVc2FnZVxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIGxvZ2luID0gbmV3IENvbnRyb2woXCJzb21lTG9naW5cIik7XG4gICAqIGxvZ2luLnNldEVycm9ycyh7XG4gICAqICAgXCJub3RVbmlxdWVcIjogdHJ1ZVxuICAgKiB9KTtcbiAgICpcbiAgICogZXhwZWN0KGxvZ2luLnZhbGlkKS50b0VxdWFsKGZhbHNlKTtcbiAgICogZXhwZWN0KGxvZ2luLmVycm9ycykudG9FcXVhbCh7XCJub3RVbmlxdWVcIjogdHJ1ZX0pO1xuICAgKlxuICAgKiBsb2dpbi51cGRhdGVWYWx1ZShcInNvbWVPdGhlckxvZ2luXCIpO1xuICAgKlxuICAgKiBleHBlY3QobG9naW4udmFsaWQpLnRvRXF1YWwodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgc2V0RXJyb3JzKGVycm9yczoge1trZXk6IHN0cmluZ106IGFueX0sIHtlbWl0RXZlbnR9OiB7ZW1pdEV2ZW50PzogYm9vbGVhbn0gPSB7fSk6IHZvaWQge1xuICAgIGVtaXRFdmVudCA9IGlzUHJlc2VudChlbWl0RXZlbnQpID8gZW1pdEV2ZW50IDogdHJ1ZTtcblxuICAgIHRoaXMuX2Vycm9ycyA9IGVycm9ycztcbiAgICB0aGlzLl9zdGF0dXMgPSB0aGlzLl9jYWxjdWxhdGVTdGF0dXMoKTtcblxuICAgIGlmIChlbWl0RXZlbnQpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N0YXR1c0NoYW5nZXMsIHRoaXMuX3N0YXR1cyk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXJlbnQpKSB7XG4gICAgICB0aGlzLl9wYXJlbnQuX3VwZGF0ZUNvbnRyb2xzRXJyb3JzKCk7XG4gICAgfVxuICB9XG5cbiAgZmluZChwYXRoOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+fCBzdHJpbmcpOiBBYnN0cmFjdENvbnRyb2wgeyByZXR1cm4gX2ZpbmQodGhpcywgcGF0aCk7IH1cblxuICBnZXRFcnJvcihlcnJvckNvZGU6IHN0cmluZywgcGF0aDogc3RyaW5nW10gPSBudWxsKTogYW55IHtcbiAgICB2YXIgY29udHJvbCA9IGlzUHJlc2VudChwYXRoKSAmJiAhTGlzdFdyYXBwZXIuaXNFbXB0eShwYXRoKSA/IHRoaXMuZmluZChwYXRoKSA6IHRoaXM7XG4gICAgaWYgKGlzUHJlc2VudChjb250cm9sKSAmJiBpc1ByZXNlbnQoY29udHJvbC5fZXJyb3JzKSkge1xuICAgICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuZ2V0KGNvbnRyb2wuX2Vycm9ycywgZXJyb3JDb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgaGFzRXJyb3IoZXJyb3JDb2RlOiBzdHJpbmcsIHBhdGg6IHN0cmluZ1tdID0gbnVsbCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5nZXRFcnJvcihlcnJvckNvZGUsIHBhdGgpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZUNvbnRyb2xzRXJyb3JzKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXR1cyA9IHRoaXMuX2NhbGN1bGF0ZVN0YXR1cygpO1xuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXJlbnQpKSB7XG4gICAgICB0aGlzLl9wYXJlbnQuX3VwZGF0ZUNvbnRyb2xzRXJyb3JzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaW5pdE9ic2VydmFibGVzKCkge1xuICAgIHRoaXMuX3ZhbHVlQ2hhbmdlcyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdGF0dXNDaGFuZ2VzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB9XG5cblxuICBwcml2YXRlIF9jYWxjdWxhdGVTdGF0dXMoKTogc3RyaW5nIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2Vycm9ycykpIHJldHVybiBJTlZBTElEO1xuICAgIGlmICh0aGlzLl9hbnlDb250cm9sc0hhdmVTdGF0dXMoUEVORElORykpIHJldHVybiBQRU5ESU5HO1xuICAgIGlmICh0aGlzLl9hbnlDb250cm9sc0hhdmVTdGF0dXMoSU5WQUxJRCkpIHJldHVybiBJTlZBTElEO1xuICAgIHJldHVybiBWQUxJRDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgYWJzdHJhY3QgX3VwZGF0ZVZhbHVlKCk6IHZvaWQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBhYnN0cmFjdCBfYW55Q29udHJvbHNIYXZlU3RhdHVzKHN0YXR1czogc3RyaW5nKTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgcGFydCBvZiBhIGZvcm0gdGhhdCBjYW5ub3QgYmUgZGl2aWRlZCBpbnRvIG90aGVyIGNvbnRyb2xzLiBgQ29udHJvbGBzIGhhdmUgdmFsdWVzIGFuZFxuICogdmFsaWRhdGlvbiBzdGF0ZSwgd2hpY2ggaXMgZGV0ZXJtaW5lZCBieSBhbiBvcHRpb25hbCB2YWxpZGF0aW9uIGZ1bmN0aW9uLlxuICpcbiAqIGBDb250cm9sYCBpcyBvbmUgb2YgdGhlIHRocmVlIGZ1bmRhbWVudGFsIGJ1aWxkaW5nIGJsb2NrcyB1c2VkIHRvIGRlZmluZSBmb3JtcyBpbiBBbmd1bGFyLCBhbG9uZ1xuICogd2l0aCB7QGxpbmsgQ29udHJvbEdyb3VwfSBhbmQge0BsaW5rIENvbnRyb2xBcnJheX0uXG4gKlxuICogIyMgVXNhZ2VcbiAqXG4gKiBCeSBkZWZhdWx0LCBhIGBDb250cm9sYCBpcyBjcmVhdGVkIGZvciBldmVyeSBgPGlucHV0PmAgb3Igb3RoZXIgZm9ybSBjb21wb25lbnQuXG4gKiBXaXRoIHtAbGluayBOZ0Zvcm1Db250cm9sfSBvciB7QGxpbmsgTmdGb3JtTW9kZWx9IGFuIGV4aXN0aW5nIHtAbGluayBDb250cm9sfSBjYW4gYmVcbiAqIGJvdW5kIHRvIGEgRE9NIGVsZW1lbnQgaW5zdGVhZC4gVGhpcyBgQ29udHJvbGAgY2FuIGJlIGNvbmZpZ3VyZWQgd2l0aCBhIGN1c3RvbVxuICogdmFsaWRhdGlvbiBmdW5jdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvMjNERVNPcGJObkJwQkhadDFCUjQ/cD1wcmV2aWV3KSlcbiAqL1xuZXhwb3J0IGNsYXNzIENvbnRyb2wgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2wge1xuICAvKiogQGludGVybmFsICovXG4gIF9vbkNoYW5nZTogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IodmFsdWU6IGFueSA9IG51bGwsIHZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsLCBhc3luY1ZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgc3VwZXIodmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgdGhpcy5faW5pdE9ic2VydmFibGVzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB2YWx1ZSBvZiB0aGUgY29udHJvbCB0byBgdmFsdWVgLlxuICAgKlxuICAgKiBJZiBgb25seVNlbGZgIGlzIGB0cnVlYCwgdGhpcyBjaGFuZ2Ugd2lsbCBvbmx5IGFmZmVjdCB0aGUgdmFsaWRhdGlvbiBvZiB0aGlzIGBDb250cm9sYFxuICAgKiBhbmQgbm90IGl0cyBwYXJlbnQgY29tcG9uZW50LiBJZiBgZW1pdEV2ZW50YCBpcyBgdHJ1ZWAsIHRoaXMgY2hhbmdlIHdpbGwgY2F1c2UgYVxuICAgKiBgdmFsdWVDaGFuZ2VzYCBldmVudCBvbiB0aGUgYENvbnRyb2xgIHRvIGJlIGVtaXR0ZWQuIEJvdGggb2YgdGhlc2Ugb3B0aW9ucyBkZWZhdWx0IHRvXG4gICAqIGBmYWxzZWAuXG4gICAqXG4gICAqIElmIGBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2VgIGlzIGB0cnVlYCwgdGhlIHZpZXcgd2lsbCBiZSBub3RpZmllZCBhYm91dCB0aGUgbmV3IHZhbHVlXG4gICAqIHZpYSBhbiBgb25DaGFuZ2VgIGV2ZW50LiBUaGlzIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIGlmIGBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2VgIGlzIG5vdFxuICAgKiBzcGVjaWZpZWQuXG4gICAqL1xuICB1cGRhdGVWYWx1ZSh2YWx1ZTogYW55LCB7b25seVNlbGYsIGVtaXRFdmVudCwgZW1pdE1vZGVsVG9WaWV3Q2hhbmdlfToge1xuICAgIG9ubHlTZWxmPzogYm9vbGVhbixcbiAgICBlbWl0RXZlbnQ/OiBib29sZWFuLFxuICAgIGVtaXRNb2RlbFRvVmlld0NoYW5nZT86IGJvb2xlYW5cbiAgfSA9IHt9KTogdm9pZCB7XG4gICAgZW1pdE1vZGVsVG9WaWV3Q2hhbmdlID0gaXNQcmVzZW50KGVtaXRNb2RlbFRvVmlld0NoYW5nZSkgPyBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2UgOiB0cnVlO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vbkNoYW5nZSkgJiYgZW1pdE1vZGVsVG9WaWV3Q2hhbmdlKSB0aGlzLl9vbkNoYW5nZSh0aGlzLl92YWx1ZSk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogb25seVNlbGYsIGVtaXRFdmVudDogZW1pdEV2ZW50fSk7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfdXBkYXRlVmFsdWUoKSB7fVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9hbnlDb250cm9sc0hhdmVTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgZm9yIGNoYW5nZSBldmVudHMuXG4gICAqL1xuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBGdW5jdGlvbik6IHZvaWQgeyB0aGlzLl9vbkNoYW5nZSA9IGZuOyB9XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIHBhcnQgb2YgYSBmb3JtLCBvZiBmaXhlZCBsZW5ndGgsIHRoYXQgY2FuIGNvbnRhaW4gb3RoZXIgY29udHJvbHMuXG4gKlxuICogQSBgQ29udHJvbEdyb3VwYCBhZ2dyZWdhdGVzIHRoZSB2YWx1ZXMgYW5kIGVycm9ycyBvZiBlYWNoIHtAbGluayBDb250cm9sfSBpbiB0aGUgZ3JvdXAuIFRodXMsIGlmXG4gKiBvbmUgb2YgdGhlIGNvbnRyb2xzIGluIGEgZ3JvdXAgaXMgaW52YWxpZCwgdGhlIGVudGlyZSBncm91cCBpcyBpbnZhbGlkLiBTaW1pbGFybHksIGlmIGEgY29udHJvbFxuICogY2hhbmdlcyBpdHMgdmFsdWUsIHRoZSBlbnRpcmUgZ3JvdXAgY2hhbmdlcyBhcyB3ZWxsLlxuICpcbiAqIGBDb250cm9sR3JvdXBgIGlzIG9uZSBvZiB0aGUgdGhyZWUgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2tzIHVzZWQgdG8gZGVmaW5lIGZvcm1zIGluIEFuZ3VsYXIsXG4gKiBhbG9uZyB3aXRoIHtAbGluayBDb250cm9sfSBhbmQge0BsaW5rIENvbnRyb2xBcnJheX0uIHtAbGluayBDb250cm9sQXJyYXl9IGNhbiBhbHNvIGNvbnRhaW4gb3RoZXJcbiAqIGNvbnRyb2xzLCBidXQgaXMgb2YgdmFyaWFibGUgbGVuZ3RoLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC8yM0RFU09wYk5uQnBCSFp0MUJSND9wPXByZXZpZXcpKVxuICovXG5leHBvcnQgY2xhc3MgQ29udHJvbEdyb3VwIGV4dGVuZHMgQWJzdHJhY3RDb250cm9sIHtcbiAgcHJpdmF0ZSBfb3B0aW9uYWxzOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn07XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbnRyb2xzOiB7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sfSxcbiAgICAgICAgICAgICAgb3B0aW9uYWxzOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSBudWxsLCB2YWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCxcbiAgICAgICAgICAgICAgYXN5bmNWYWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgIHN1cGVyKHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICAgIHRoaXMuX29wdGlvbmFscyA9IGlzUHJlc2VudChvcHRpb25hbHMpID8gb3B0aW9uYWxzIDoge307XG4gICAgdGhpcy5faW5pdE9ic2VydmFibGVzKCk7XG4gICAgdGhpcy5fc2V0UGFyZW50Rm9yQ29udHJvbHMoKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgY29udHJvbCB0byB0aGlzIGdyb3VwLlxuICAgKi9cbiAgYWRkQ29udHJvbChuYW1lOiBzdHJpbmcsIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IHZvaWQge1xuICAgIHRoaXMuY29udHJvbHNbbmFtZV0gPSBjb250cm9sO1xuICAgIGNvbnRyb2wuc2V0UGFyZW50KHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGNvbnRyb2wgZnJvbSB0aGlzIGdyb3VwLlxuICAgKi9cbiAgcmVtb3ZlQ29udHJvbChuYW1lOiBzdHJpbmcpOiB2b2lkIHsgU3RyaW5nTWFwV3JhcHBlci5kZWxldGUodGhpcy5jb250cm9scywgbmFtZSk7IH1cblxuICAvKipcbiAgICogTWFyayB0aGUgbmFtZWQgY29udHJvbCBhcyBub24tb3B0aW9uYWwuXG4gICAqL1xuICBpbmNsdWRlKGNvbnRyb2xOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldCh0aGlzLl9vcHRpb25hbHMsIGNvbnRyb2xOYW1lLCB0cnVlKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrIHRoZSBuYW1lZCBjb250cm9sIGFzIG9wdGlvbmFsLlxuICAgKi9cbiAgZXhjbHVkZShjb250cm9sTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5zZXQodGhpcy5fb3B0aW9uYWxzLCBjb250cm9sTmFtZSwgZmFsc2UpO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYSBjb250cm9sIHdpdGggdGhlIGdpdmVuIG5hbWUgaW4gdGhlIGdyb3VwLlxuICAgKi9cbiAgY29udGFpbnMoY29udHJvbE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciBjID0gU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh0aGlzLmNvbnRyb2xzLCBjb250cm9sTmFtZSk7XG4gICAgcmV0dXJuIGMgJiYgdGhpcy5faW5jbHVkZWQoY29udHJvbE5hbWUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2V0UGFyZW50Rm9yQ29udHJvbHMoKSB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuY29udHJvbHMsIChjb250cm9sLCBuYW1lKSA9PiB7IGNvbnRyb2wuc2V0UGFyZW50KHRoaXMpOyB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZVZhbHVlKCkgeyB0aGlzLl92YWx1ZSA9IHRoaXMuX3JlZHVjZVZhbHVlKCk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hbnlDb250cm9sc0hhdmVTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgcmVzID0gZmFsc2U7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuY29udHJvbHMsIChjb250cm9sLCBuYW1lKSA9PiB7XG4gICAgICByZXMgPSByZXMgfHwgKHRoaXMuY29udGFpbnMobmFtZSkgJiYgY29udHJvbC5zdGF0dXMgPT0gc3RhdHVzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVkdWNlVmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlZHVjZUNoaWxkcmVuKHt9LCAoYWNjLCBjb250cm9sLCBuYW1lKSA9PiB7XG4gICAgICBhY2NbbmFtZV0gPSBjb250cm9sLnZhbHVlO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlZHVjZUNoaWxkcmVuKGluaXRWYWx1ZTogYW55LCBmbjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcmVzID0gaW5pdFZhbHVlO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLmNvbnRyb2xzLCAoY29udHJvbCwgbmFtZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2luY2x1ZGVkKG5hbWUpKSB7XG4gICAgICAgIHJlcyA9IGZuKHJlcywgY29udHJvbCwgbmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luY2x1ZGVkKGNvbnRyb2xOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgaXNPcHRpb25hbCA9IFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModGhpcy5fb3B0aW9uYWxzLCBjb250cm9sTmFtZSk7XG4gICAgcmV0dXJuICFpc09wdGlvbmFsIHx8IFN0cmluZ01hcFdyYXBwZXIuZ2V0KHRoaXMuX29wdGlvbmFscywgY29udHJvbE5hbWUpO1xuICB9XG59XG5cbi8qKlxuICogRGVmaW5lcyBhIHBhcnQgb2YgYSBmb3JtLCBvZiB2YXJpYWJsZSBsZW5ndGgsIHRoYXQgY2FuIGNvbnRhaW4gb3RoZXIgY29udHJvbHMuXG4gKlxuICogQSBgQ29udHJvbEFycmF5YCBhZ2dyZWdhdGVzIHRoZSB2YWx1ZXMgYW5kIGVycm9ycyBvZiBlYWNoIHtAbGluayBDb250cm9sfSBpbiB0aGUgZ3JvdXAuIFRodXMsIGlmXG4gKiBvbmUgb2YgdGhlIGNvbnRyb2xzIGluIGEgZ3JvdXAgaXMgaW52YWxpZCwgdGhlIGVudGlyZSBncm91cCBpcyBpbnZhbGlkLiBTaW1pbGFybHksIGlmIGEgY29udHJvbFxuICogY2hhbmdlcyBpdHMgdmFsdWUsIHRoZSBlbnRpcmUgZ3JvdXAgY2hhbmdlcyBhcyB3ZWxsLlxuICpcbiAqIGBDb250cm9sQXJyYXlgIGlzIG9uZSBvZiB0aGUgdGhyZWUgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2tzIHVzZWQgdG8gZGVmaW5lIGZvcm1zIGluIEFuZ3VsYXIsXG4gKiBhbG9uZyB3aXRoIHtAbGluayBDb250cm9sfSBhbmQge0BsaW5rIENvbnRyb2xHcm91cH0uIHtAbGluayBDb250cm9sR3JvdXB9IGNhbiBhbHNvIGNvbnRhaW5cbiAqIG90aGVyIGNvbnRyb2xzLCBidXQgaXMgb2YgZml4ZWQgbGVuZ3RoLlxuICpcbiAqICMjIEFkZGluZyBvciByZW1vdmluZyBjb250cm9sc1xuICpcbiAqIFRvIGNoYW5nZSB0aGUgY29udHJvbHMgaW4gdGhlIGFycmF5LCB1c2UgdGhlIGBwdXNoYCwgYGluc2VydGAsIG9yIGByZW1vdmVBdGAgbWV0aG9kc1xuICogaW4gYENvbnRyb2xBcnJheWAgaXRzZWxmLiBUaGVzZSBtZXRob2RzIGVuc3VyZSB0aGUgY29udHJvbHMgYXJlIHByb3Blcmx5IHRyYWNrZWQgaW4gdGhlXG4gKiBmb3JtJ3MgaGllcmFyY2h5LiBEbyBub3QgbW9kaWZ5IHRoZSBhcnJheSBvZiBgQWJzdHJhY3RDb250cm9sYHMgdXNlZCB0byBpbnN0YW50aWF0ZVxuICogdGhlIGBDb250cm9sQXJyYXlgIGRpcmVjdGx5LCBhcyB0aGF0IHdpbGwgcmVzdWx0IGluIHN0cmFuZ2UgYW5kIHVuZXhwZWN0ZWQgYmVoYXZpb3Igc3VjaFxuICogYXMgYnJva2VuIGNoYW5nZSBkZXRlY3Rpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzIzREVTT3BiTm5CcEJIWnQxQlI0P3A9cHJldmlldykpXG4gKi9cbmV4cG9ydCBjbGFzcyBDb250cm9sQXJyYXkgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2wge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbHM6IEFic3RyYWN0Q29udHJvbFtdLCB2YWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCxcbiAgICAgICAgICAgICAgYXN5bmNWYWxpZGF0b3I6IEZ1bmN0aW9uID0gbnVsbCkge1xuICAgIHN1cGVyKHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICAgIHRoaXMuX2luaXRPYnNlcnZhYmxlcygpO1xuICAgIHRoaXMuX3NldFBhcmVudEZvckNvbnRyb2xzKCk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogdHJ1ZSwgZW1pdEV2ZW50OiBmYWxzZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUge0BsaW5rIEFic3RyYWN0Q29udHJvbH0gYXQgdGhlIGdpdmVuIGBpbmRleGAgaW4gdGhlIGFycmF5LlxuICAgKi9cbiAgYXQoaW5kZXg6IG51bWJlcik6IEFic3RyYWN0Q29udHJvbCB7IHJldHVybiB0aGlzLmNvbnRyb2xzW2luZGV4XTsgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBuZXcge0BsaW5rIEFic3RyYWN0Q29udHJvbH0gYXQgdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAqL1xuICBwdXNoKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IHZvaWQge1xuICAgIHRoaXMuY29udHJvbHMucHVzaChjb250cm9sKTtcbiAgICBjb250cm9sLnNldFBhcmVudCh0aGlzKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBuZXcge0BsaW5rIEFic3RyYWN0Q29udHJvbH0gYXQgdGhlIGdpdmVuIGBpbmRleGAgaW4gdGhlIGFycmF5LlxuICAgKi9cbiAgaW5zZXJ0KGluZGV4OiBudW1iZXIsIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLmluc2VydCh0aGlzLmNvbnRyb2xzLCBpbmRleCwgY29udHJvbCk7XG4gICAgY29udHJvbC5zZXRQYXJlbnQodGhpcyk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBjb250cm9sIGF0IHRoZSBnaXZlbiBgaW5kZXhgIGluIHRoZSBhcnJheS5cbiAgICovXG4gIHJlbW92ZUF0KGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmVBdCh0aGlzLmNvbnRyb2xzLCBpbmRleCk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gIH1cblxuICAvKipcbiAgICogTGVuZ3RoIG9mIHRoZSBjb250cm9sIGFycmF5LlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5jb250cm9scy5sZW5ndGg7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVWYWx1ZSgpOiB2b2lkIHsgdGhpcy5fdmFsdWUgPSB0aGlzLmNvbnRyb2xzLm1hcCgoY29udHJvbCkgPT4gY29udHJvbC52YWx1ZSk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hbnlDb250cm9sc0hhdmVTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb250cm9scy5zb21lKGMgPT4gYy5zdGF0dXMgPT0gc3RhdHVzKTtcbiAgfVxuXG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2V0UGFyZW50Rm9yQ29udHJvbHMoKTogdm9pZCB7XG4gICAgdGhpcy5jb250cm9scy5mb3JFYWNoKChjb250cm9sKSA9PiB7IGNvbnRyb2wuc2V0UGFyZW50KHRoaXMpOyB9KTtcbiAgfVxufVxuIl19