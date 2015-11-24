import { isPresent, isBlank, normalizeBool } from 'angular2/src/facade/lang';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { PromiseWrapper } from 'angular2/src/facade/promise';
import { StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
/**
 * Indicates that a Control is valid, i.e. that no errors exist in the input value.
 */
export const VALID = "VALID";
/**
 * Indicates that a Control is invalid, i.e. that an error exists in the input value.
 */
export const INVALID = "INVALID";
/**
 * Indicates that a Control is pending, i.e. that async validation is occuring and
 * errors are not yet available for the input value.
 */
export const PENDING = "PENDING";
export function isControl(control) {
    return control instanceof AbstractControl;
}
function _find(control, path) {
    if (isBlank(path))
        return null;
    if (!(path instanceof Array)) {
        path = path.split("/");
    }
    if (path instanceof Array && ListWrapper.isEmpty(path))
        return null;
    return path
        .reduce((v, name) => {
        if (v instanceof ControlGroup) {
            return isPresent(v.controls[name]) ? v.controls[name] : null;
        }
        else if (v instanceof ControlArray) {
            var index = name;
            return isPresent(v.at(index)) ? v.at(index) : null;
        }
        else {
            return null;
        }
    }, control);
}
function toObservable(r) {
    return PromiseWrapper.isPromise(r) ? ObservableWrapper.fromPromise(r) : r;
}
/**
 *
 */
export class AbstractControl {
    constructor(validator, asyncValidator) {
        this.validator = validator;
        this.asyncValidator = asyncValidator;
        this._pristine = true;
        this._touched = false;
    }
    get value() { return this._value; }
    get status() { return this._status; }
    get valid() { return this._status === VALID; }
    /**
     * Returns the errors of this control.
     */
    get errors() { return this._errors; }
    get pristine() { return this._pristine; }
    get dirty() { return !this.pristine; }
    get touched() { return this._touched; }
    get untouched() { return !this._touched; }
    get valueChanges() { return this._valueChanges; }
    get statusChanges() { return this._statusChanges; }
    get pending() { return this._status == PENDING; }
    markAsTouched() { this._touched = true; }
    markAsDirty({ onlySelf } = {}) {
        onlySelf = normalizeBool(onlySelf);
        this._pristine = false;
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.markAsDirty({ onlySelf: onlySelf });
        }
    }
    markAsPending({ onlySelf } = {}) {
        onlySelf = normalizeBool(onlySelf);
        this._status = PENDING;
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.markAsPending({ onlySelf: onlySelf });
        }
    }
    setParent(parent) { this._parent = parent; }
    updateValueAndValidity({ onlySelf, emitEvent } = {}) {
        onlySelf = normalizeBool(onlySelf);
        emitEvent = isPresent(emitEvent) ? emitEvent : true;
        this._updateValue();
        this._errors = this._runValidator();
        this._status = this._calculateStatus();
        if (this._status == VALID || this._status == PENDING) {
            this._runAsyncValidator(emitEvent);
        }
        if (emitEvent) {
            ObservableWrapper.callEmit(this._valueChanges, this._value);
            ObservableWrapper.callEmit(this._statusChanges, this._status);
        }
        if (isPresent(this._parent) && !onlySelf) {
            this._parent.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
        }
    }
    _runValidator() { return isPresent(this.validator) ? this.validator(this) : null; }
    _runAsyncValidator(emitEvent) {
        if (isPresent(this.asyncValidator)) {
            this._status = PENDING;
            this._cancelExistingSubscription();
            var obs = toObservable(this.asyncValidator(this));
            this._asyncValidationSubscription =
                ObservableWrapper.subscribe(obs, res => this.setErrors(res, { emitEvent: emitEvent }));
        }
    }
    _cancelExistingSubscription() {
        if (isPresent(this._asyncValidationSubscription)) {
            ObservableWrapper.dispose(this._asyncValidationSubscription);
        }
    }
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
    setErrors(errors, { emitEvent } = {}) {
        emitEvent = isPresent(emitEvent) ? emitEvent : true;
        this._errors = errors;
        this._status = this._calculateStatus();
        if (emitEvent) {
            ObservableWrapper.callEmit(this._statusChanges, this._status);
        }
        if (isPresent(this._parent)) {
            this._parent._updateControlsErrors();
        }
    }
    find(path) { return _find(this, path); }
    getError(errorCode, path = null) {
        var control = isPresent(path) && !ListWrapper.isEmpty(path) ? this.find(path) : this;
        if (isPresent(control) && isPresent(control._errors)) {
            return StringMapWrapper.get(control._errors, errorCode);
        }
        else {
            return null;
        }
    }
    hasError(errorCode, path = null) {
        return isPresent(this.getError(errorCode, path));
    }
    /** @internal */
    _updateControlsErrors() {
        this._status = this._calculateStatus();
        if (isPresent(this._parent)) {
            this._parent._updateControlsErrors();
        }
    }
    /** @internal */
    _initObservables() {
        this._valueChanges = new EventEmitter();
        this._statusChanges = new EventEmitter();
    }
    _calculateStatus() {
        if (isPresent(this._errors))
            return INVALID;
        if (this._anyControlsHaveStatus(PENDING))
            return PENDING;
        if (this._anyControlsHaveStatus(INVALID))
            return INVALID;
        return VALID;
    }
}
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
export class Control extends AbstractControl {
    constructor(value = null, validator = null, asyncValidator = null) {
        super(validator, asyncValidator);
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
    updateValue(value, { onlySelf, emitEvent, emitModelToViewChange } = {}) {
        emitModelToViewChange = isPresent(emitModelToViewChange) ? emitModelToViewChange : true;
        this._value = value;
        if (isPresent(this._onChange) && emitModelToViewChange)
            this._onChange(this._value);
        this.updateValueAndValidity({ onlySelf: onlySelf, emitEvent: emitEvent });
    }
    /**
     * @internal
     */
    _updateValue() { }
    /**
     * @internal
     */
    _anyControlsHaveStatus(status) { return false; }
    /**
     * Register a listener for change events.
     */
    registerOnChange(fn) { this._onChange = fn; }
}
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
export class ControlGroup extends AbstractControl {
    constructor(controls, optionals = null, validator = null, asyncValidator = null) {
        super(validator, asyncValidator);
        this.controls = controls;
        this._optionals = isPresent(optionals) ? optionals : {};
        this._initObservables();
        this._setParentForControls();
        this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    /**
     * Add a control to this group.
     */
    addControl(name, control) {
        this.controls[name] = control;
        control.setParent(this);
    }
    /**
     * Remove a control from this group.
     */
    removeControl(name) { StringMapWrapper.delete(this.controls, name); }
    /**
     * Mark the named control as non-optional.
     */
    include(controlName) {
        StringMapWrapper.set(this._optionals, controlName, true);
        this.updateValueAndValidity();
    }
    /**
     * Mark the named control as optional.
     */
    exclude(controlName) {
        StringMapWrapper.set(this._optionals, controlName, false);
        this.updateValueAndValidity();
    }
    /**
     * Check whether there is a control with the given name in the group.
     */
    contains(controlName) {
        var c = StringMapWrapper.contains(this.controls, controlName);
        return c && this._included(controlName);
    }
    /** @internal */
    _setParentForControls() {
        StringMapWrapper.forEach(this.controls, (control, name) => { control.setParent(this); });
    }
    /** @internal */
    _updateValue() { this._value = this._reduceValue(); }
    /** @internal */
    _anyControlsHaveStatus(status) {
        var res = false;
        StringMapWrapper.forEach(this.controls, (control, name) => {
            res = res || (this.contains(name) && control.status == status);
        });
        return res;
    }
    /** @internal */
    _reduceValue() {
        return this._reduceChildren({}, (acc, control, name) => {
            acc[name] = control.value;
            return acc;
        });
    }
    /** @internal */
    _reduceChildren(initValue, fn) {
        var res = initValue;
        StringMapWrapper.forEach(this.controls, (control, name) => {
            if (this._included(name)) {
                res = fn(res, control, name);
            }
        });
        return res;
    }
    /** @internal */
    _included(controlName) {
        var isOptional = StringMapWrapper.contains(this._optionals, controlName);
        return !isOptional || StringMapWrapper.get(this._optionals, controlName);
    }
}
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
export class ControlArray extends AbstractControl {
    constructor(controls, validator = null, asyncValidator = null) {
        super(validator, asyncValidator);
        this.controls = controls;
        this._initObservables();
        this._setParentForControls();
        this.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
    /**
     * Get the {@link AbstractControl} at the given `index` in the array.
     */
    at(index) { return this.controls[index]; }
    /**
     * Insert a new {@link AbstractControl} at the end of the array.
     */
    push(control) {
        this.controls.push(control);
        control.setParent(this);
        this.updateValueAndValidity();
    }
    /**
     * Insert a new {@link AbstractControl} at the given `index` in the array.
     */
    insert(index, control) {
        ListWrapper.insert(this.controls, index, control);
        control.setParent(this);
        this.updateValueAndValidity();
    }
    /**
     * Remove the control at the given `index` in the array.
     */
    removeAt(index) {
        ListWrapper.removeAt(this.controls, index);
        this.updateValueAndValidity();
    }
    /**
     * Length of the control array.
     */
    get length() { return this.controls.length; }
    /** @internal */
    _updateValue() { this._value = this.controls.map((control) => control.value); }
    /** @internal */
    _anyControlsHaveStatus(status) {
        return this.controls.some(c => c.status == status);
    }
    /** @internal */
    _setParentForControls() {
        this.controls.forEach((control) => { control.setParent(this); });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL21vZGVsLnRzIl0sIm5hbWVzIjpbImlzQ29udHJvbCIsIl9maW5kIiwidG9PYnNlcnZhYmxlIiwiQWJzdHJhY3RDb250cm9sIiwiQWJzdHJhY3RDb250cm9sLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RDb250cm9sLnZhbHVlIiwiQWJzdHJhY3RDb250cm9sLnN0YXR1cyIsIkFic3RyYWN0Q29udHJvbC52YWxpZCIsIkFic3RyYWN0Q29udHJvbC5lcnJvcnMiLCJBYnN0cmFjdENvbnRyb2wucHJpc3RpbmUiLCJBYnN0cmFjdENvbnRyb2wuZGlydHkiLCJBYnN0cmFjdENvbnRyb2wudG91Y2hlZCIsIkFic3RyYWN0Q29udHJvbC51bnRvdWNoZWQiLCJBYnN0cmFjdENvbnRyb2wudmFsdWVDaGFuZ2VzIiwiQWJzdHJhY3RDb250cm9sLnN0YXR1c0NoYW5nZXMiLCJBYnN0cmFjdENvbnRyb2wucGVuZGluZyIsIkFic3RyYWN0Q29udHJvbC5tYXJrQXNUb3VjaGVkIiwiQWJzdHJhY3RDb250cm9sLm1hcmtBc0RpcnR5IiwiQWJzdHJhY3RDb250cm9sLm1hcmtBc1BlbmRpbmciLCJBYnN0cmFjdENvbnRyb2wuc2V0UGFyZW50IiwiQWJzdHJhY3RDb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkiLCJBYnN0cmFjdENvbnRyb2wuX3J1blZhbGlkYXRvciIsIkFic3RyYWN0Q29udHJvbC5fcnVuQXN5bmNWYWxpZGF0b3IiLCJBYnN0cmFjdENvbnRyb2wuX2NhbmNlbEV4aXN0aW5nU3Vic2NyaXB0aW9uIiwiQWJzdHJhY3RDb250cm9sLnNldEVycm9ycyIsIkFic3RyYWN0Q29udHJvbC5maW5kIiwiQWJzdHJhY3RDb250cm9sLmdldEVycm9yIiwiQWJzdHJhY3RDb250cm9sLmhhc0Vycm9yIiwiQWJzdHJhY3RDb250cm9sLl91cGRhdGVDb250cm9sc0Vycm9ycyIsIkFic3RyYWN0Q29udHJvbC5faW5pdE9ic2VydmFibGVzIiwiQWJzdHJhY3RDb250cm9sLl9jYWxjdWxhdGVTdGF0dXMiLCJDb250cm9sIiwiQ29udHJvbC5jb25zdHJ1Y3RvciIsIkNvbnRyb2wudXBkYXRlVmFsdWUiLCJDb250cm9sLl91cGRhdGVWYWx1ZSIsIkNvbnRyb2wuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyIsIkNvbnRyb2wucmVnaXN0ZXJPbkNoYW5nZSIsIkNvbnRyb2xHcm91cCIsIkNvbnRyb2xHcm91cC5jb25zdHJ1Y3RvciIsIkNvbnRyb2xHcm91cC5hZGRDb250cm9sIiwiQ29udHJvbEdyb3VwLnJlbW92ZUNvbnRyb2wiLCJDb250cm9sR3JvdXAuaW5jbHVkZSIsIkNvbnRyb2xHcm91cC5leGNsdWRlIiwiQ29udHJvbEdyb3VwLmNvbnRhaW5zIiwiQ29udHJvbEdyb3VwLl9zZXRQYXJlbnRGb3JDb250cm9scyIsIkNvbnRyb2xHcm91cC5fdXBkYXRlVmFsdWUiLCJDb250cm9sR3JvdXAuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyIsIkNvbnRyb2xHcm91cC5fcmVkdWNlVmFsdWUiLCJDb250cm9sR3JvdXAuX3JlZHVjZUNoaWxkcmVuIiwiQ29udHJvbEdyb3VwLl9pbmNsdWRlZCIsIkNvbnRyb2xBcnJheSIsIkNvbnRyb2xBcnJheS5jb25zdHJ1Y3RvciIsIkNvbnRyb2xBcnJheS5hdCIsIkNvbnRyb2xBcnJheS5wdXNoIiwiQ29udHJvbEFycmF5Lmluc2VydCIsIkNvbnRyb2xBcnJheS5yZW1vdmVBdCIsIkNvbnRyb2xBcnJheS5sZW5ndGgiLCJDb250cm9sQXJyYXkuX3VwZGF0ZVZhbHVlIiwiQ29udHJvbEFycmF5Ll9hbnlDb250cm9sc0hhdmVTdGF0dXMiLCJDb250cm9sQXJyYXkuX3NldFBhcmVudEZvckNvbnRyb2xzIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFnQixTQUFTLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUNsRixFQUFhLFlBQVksRUFB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TUFBY0E7UUFDbkNRLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLE1BQU1BLElBQUlBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3JEQSxDQUFDQTtJQUdEUixnQkFBZ0JBO0lBQ2hCQSxxQkFBcUJBO1FBQ25CUyxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxPQUFPQSxPQUFPQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNuRUEsQ0FBQ0E7QUFDSFQsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U3RyaW5nV3JhcHBlciwgaXNQcmVzZW50LCBpc0JsYW5rLCBub3JtYWxpemVCb29sfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvcHJvbWlzZSc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IGEgQ29udHJvbCBpcyB2YWxpZCwgaS5lLiB0aGF0IG5vIGVycm9ycyBleGlzdCBpbiB0aGUgaW5wdXQgdmFsdWUuXG4gKi9cbmV4cG9ydCBjb25zdCBWQUxJRCA9IFwiVkFMSURcIjtcblxuLyoqXG4gKiBJbmRpY2F0ZXMgdGhhdCBhIENvbnRyb2wgaXMgaW52YWxpZCwgaS5lLiB0aGF0IGFuIGVycm9yIGV4aXN0cyBpbiB0aGUgaW5wdXQgdmFsdWUuXG4gKi9cbmV4cG9ydCBjb25zdCBJTlZBTElEID0gXCJJTlZBTElEXCI7XG5cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgYSBDb250cm9sIGlzIHBlbmRpbmcsIGkuZS4gdGhhdCBhc3luYyB2YWxpZGF0aW9uIGlzIG9jY3VyaW5nIGFuZFxuICogZXJyb3JzIGFyZSBub3QgeWV0IGF2YWlsYWJsZSBmb3IgdGhlIGlucHV0IHZhbHVlLlxuICovXG5leHBvcnQgY29uc3QgUEVORElORyA9IFwiUEVORElOR1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNDb250cm9sKGNvbnRyb2w6IE9iamVjdCk6IGJvb2xlYW4ge1xuICByZXR1cm4gY29udHJvbCBpbnN0YW5jZW9mIEFic3RyYWN0Q29udHJvbDtcbn1cblxuZnVuY3Rpb24gX2ZpbmQoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBwYXRoOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+fCBzdHJpbmcpIHtcbiAgaWYgKGlzQmxhbmsocGF0aCkpIHJldHVybiBudWxsO1xuXG4gIGlmICghKHBhdGggaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBwYXRoID0gKDxzdHJpbmc+cGF0aCkuc3BsaXQoXCIvXCIpO1xuICB9XG4gIGlmIChwYXRoIGluc3RhbmNlb2YgQXJyYXkgJiYgTGlzdFdyYXBwZXIuaXNFbXB0eShwYXRoKSkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuICg8QXJyYXk8c3RyaW5nIHwgbnVtYmVyPj5wYXRoKVxuICAgICAgLnJlZHVjZSgodiwgbmFtZSkgPT4ge1xuICAgICAgICBpZiAodiBpbnN0YW5jZW9mIENvbnRyb2xHcm91cCkge1xuICAgICAgICAgIHJldHVybiBpc1ByZXNlbnQodi5jb250cm9sc1tuYW1lXSkgPyB2LmNvbnRyb2xzW25hbWVdIDogbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmICh2IGluc3RhbmNlb2YgQ29udHJvbEFycmF5KSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gPG51bWJlcj5uYW1lO1xuICAgICAgICAgIHJldHVybiBpc1ByZXNlbnQodi5hdChpbmRleCkpID8gdi5hdChpbmRleCkgOiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCBjb250cm9sKTtcbn1cblxuZnVuY3Rpb24gdG9PYnNlcnZhYmxlKHI6IGFueSk6IE9ic2VydmFibGU8YW55PiB7XG4gIHJldHVybiBQcm9taXNlV3JhcHBlci5pc1Byb21pc2UocikgPyBPYnNlcnZhYmxlV3JhcHBlci5mcm9tUHJvbWlzZShyKSA6IHI7XG59XG5cbi8qKlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFic3RyYWN0Q29udHJvbCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZhbHVlOiBhbnk7XG5cbiAgcHJpdmF0ZSBfdmFsdWVDaGFuZ2VzOiBFdmVudEVtaXR0ZXI8YW55PjtcbiAgcHJpdmF0ZSBfc3RhdHVzQ2hhbmdlczogRXZlbnRFbWl0dGVyPGFueT47XG4gIHByaXZhdGUgX3N0YXR1czogc3RyaW5nO1xuICBwcml2YXRlIF9lcnJvcnM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBwcml2YXRlIF9wcmlzdGluZTogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgX3RvdWNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfcGFyZW50OiBDb250cm9sR3JvdXAgfCBDb250cm9sQXJyYXk7XG4gIHByaXZhdGUgX2FzeW5jVmFsaWRhdGlvblN1YnNjcmlwdGlvbjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsaWRhdG9yOiBGdW5jdGlvbiwgcHVibGljIGFzeW5jVmFsaWRhdG9yOiBGdW5jdGlvbikge31cblxuICBnZXQgdmFsdWUoKTogYW55IHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG5cbiAgZ2V0IHN0YXR1cygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fc3RhdHVzOyB9XG5cbiAgZ2V0IHZhbGlkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fc3RhdHVzID09PSBWQUxJRDsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlcnJvcnMgb2YgdGhpcyBjb250cm9sLlxuICAgKi9cbiAgZ2V0IGVycm9ycygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiB0aGlzLl9lcnJvcnM7IH1cblxuICBnZXQgcHJpc3RpbmUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9wcmlzdGluZTsgfVxuXG4gIGdldCBkaXJ0eSgpOiBib29sZWFuIHsgcmV0dXJuICF0aGlzLnByaXN0aW5lOyB9XG5cbiAgZ2V0IHRvdWNoZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl90b3VjaGVkOyB9XG5cbiAgZ2V0IHVudG91Y2hlZCgpOiBib29sZWFuIHsgcmV0dXJuICF0aGlzLl90b3VjaGVkOyB9XG5cbiAgZ2V0IHZhbHVlQ2hhbmdlcygpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm4gdGhpcy5fdmFsdWVDaGFuZ2VzOyB9XG5cbiAgZ2V0IHN0YXR1c0NoYW5nZXMoKTogT2JzZXJ2YWJsZTxhbnk+IHsgcmV0dXJuIHRoaXMuX3N0YXR1c0NoYW5nZXM7IH1cblxuICBnZXQgcGVuZGluZygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0YXR1cyA9PSBQRU5ESU5HOyB9XG5cbiAgbWFya0FzVG91Y2hlZCgpOiB2b2lkIHsgdGhpcy5fdG91Y2hlZCA9IHRydWU7IH1cblxuICBtYXJrQXNEaXJ0eSh7b25seVNlbGZ9OiB7b25seVNlbGY/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgb25seVNlbGYgPSBub3JtYWxpemVCb29sKG9ubHlTZWxmKTtcbiAgICB0aGlzLl9wcmlzdGluZSA9IGZhbHNlO1xuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXJlbnQpICYmICFvbmx5U2VsZikge1xuICAgICAgdGhpcy5fcGFyZW50Lm1hcmtBc0RpcnR5KHtvbmx5U2VsZjogb25seVNlbGZ9KTtcbiAgICB9XG4gIH1cblxuICBtYXJrQXNQZW5kaW5nKHtvbmx5U2VsZn06IHtvbmx5U2VsZj86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICBvbmx5U2VsZiA9IG5vcm1hbGl6ZUJvb2wob25seVNlbGYpO1xuICAgIHRoaXMuX3N0YXR1cyA9IFBFTkRJTkc7XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhcmVudCkgJiYgIW9ubHlTZWxmKSB7XG4gICAgICB0aGlzLl9wYXJlbnQubWFya0FzUGVuZGluZyh7b25seVNlbGY6IG9ubHlTZWxmfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0UGFyZW50KHBhcmVudDogQ29udHJvbEdyb3VwIHwgQ29udHJvbEFycmF5KTogdm9pZCB7IHRoaXMuX3BhcmVudCA9IHBhcmVudDsgfVxuXG4gIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoXG4gICAgICB7b25seVNlbGYsIGVtaXRFdmVudH06IHtvbmx5U2VsZj86IGJvb2xlYW4sIGVtaXRFdmVudD86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICBvbmx5U2VsZiA9IG5vcm1hbGl6ZUJvb2wob25seVNlbGYpO1xuICAgIGVtaXRFdmVudCA9IGlzUHJlc2VudChlbWl0RXZlbnQpID8gZW1pdEV2ZW50IDogdHJ1ZTtcblxuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKCk7XG5cbiAgICB0aGlzLl9lcnJvcnMgPSB0aGlzLl9ydW5WYWxpZGF0b3IoKTtcbiAgICB0aGlzLl9zdGF0dXMgPSB0aGlzLl9jYWxjdWxhdGVTdGF0dXMoKTtcblxuICAgIGlmICh0aGlzLl9zdGF0dXMgPT0gVkFMSUQgfHwgdGhpcy5fc3RhdHVzID09IFBFTkRJTkcpIHtcbiAgICAgIHRoaXMuX3J1bkFzeW5jVmFsaWRhdG9yKGVtaXRFdmVudCk7XG4gICAgfVxuXG4gICAgaWYgKGVtaXRFdmVudCkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fdmFsdWVDaGFuZ2VzLCB0aGlzLl92YWx1ZSk7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zdGF0dXNDaGFuZ2VzLCB0aGlzLl9zdGF0dXMpO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fcGFyZW50KSAmJiAhb25seVNlbGYpIHtcbiAgICAgIHRoaXMuX3BhcmVudC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtvbmx5U2VsZjogb25seVNlbGYsIGVtaXRFdmVudDogZW1pdEV2ZW50fSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcnVuVmFsaWRhdG9yKCkgeyByZXR1cm4gaXNQcmVzZW50KHRoaXMudmFsaWRhdG9yKSA/IHRoaXMudmFsaWRhdG9yKHRoaXMpIDogbnVsbDsgfVxuXG4gIHByaXZhdGUgX3J1bkFzeW5jVmFsaWRhdG9yKGVtaXRFdmVudDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5hc3luY1ZhbGlkYXRvcikpIHtcbiAgICAgIHRoaXMuX3N0YXR1cyA9IFBFTkRJTkc7XG4gICAgICB0aGlzLl9jYW5jZWxFeGlzdGluZ1N1YnNjcmlwdGlvbigpO1xuICAgICAgdmFyIG9icyA9IHRvT2JzZXJ2YWJsZSh0aGlzLmFzeW5jVmFsaWRhdG9yKHRoaXMpKTtcbiAgICAgIHRoaXMuX2FzeW5jVmFsaWRhdGlvblN1YnNjcmlwdGlvbiA9XG4gICAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKG9icywgcmVzID0+IHRoaXMuc2V0RXJyb3JzKHJlcywge2VtaXRFdmVudDogZW1pdEV2ZW50fSkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NhbmNlbEV4aXN0aW5nU3Vic2NyaXB0aW9uKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fYXN5bmNWYWxpZGF0aW9uU3Vic2NyaXB0aW9uKSkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9hc3luY1ZhbGlkYXRpb25TdWJzY3JpcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGVycm9ycyBvbiBhIGNvbnRyb2wuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCB3aGVuIHZhbGlkYXRpb25zIGFyZSBydW4gbm90IGF1dG9tYXRpY2FsbHksIGJ1dCBtYW51YWxseSBieSB0aGUgdXNlci5cbiAgICpcbiAgICogQ2FsbGluZyBgc2V0RXJyb3JzYCB3aWxsIGFsc28gdXBkYXRlIHRoZSB2YWxpZGl0eSBvZiB0aGUgcGFyZW50IGNvbnRyb2wuXG4gICAqXG4gICAqICMjIFVzYWdlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgbG9naW4gPSBuZXcgQ29udHJvbChcInNvbWVMb2dpblwiKTtcbiAgICogbG9naW4uc2V0RXJyb3JzKHtcbiAgICogICBcIm5vdFVuaXF1ZVwiOiB0cnVlXG4gICAqIH0pO1xuICAgKlxuICAgKiBleHBlY3QobG9naW4udmFsaWQpLnRvRXF1YWwoZmFsc2UpO1xuICAgKiBleHBlY3QobG9naW4uZXJyb3JzKS50b0VxdWFsKHtcIm5vdFVuaXF1ZVwiOiB0cnVlfSk7XG4gICAqXG4gICAqIGxvZ2luLnVwZGF0ZVZhbHVlKFwic29tZU90aGVyTG9naW5cIik7XG4gICAqXG4gICAqIGV4cGVjdChsb2dpbi52YWxpZCkudG9FcXVhbCh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICBzZXRFcnJvcnMoZXJyb3JzOiB7W2tleTogc3RyaW5nXTogYW55fSwge2VtaXRFdmVudH06IHtlbWl0RXZlbnQ/OiBib29sZWFufSA9IHt9KTogdm9pZCB7XG4gICAgZW1pdEV2ZW50ID0gaXNQcmVzZW50KGVtaXRFdmVudCkgPyBlbWl0RXZlbnQgOiB0cnVlO1xuXG4gICAgdGhpcy5fZXJyb3JzID0gZXJyb3JzO1xuICAgIHRoaXMuX3N0YXR1cyA9IHRoaXMuX2NhbGN1bGF0ZVN0YXR1cygpO1xuXG4gICAgaWYgKGVtaXRFdmVudCkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3RhdHVzQ2hhbmdlcywgdGhpcy5fc3RhdHVzKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhcmVudCkpIHtcbiAgICAgIHRoaXMuX3BhcmVudC5fdXBkYXRlQ29udHJvbHNFcnJvcnMoKTtcbiAgICB9XG4gIH1cblxuICBmaW5kKHBhdGg6IEFycmF5PHN0cmluZyB8IG51bWJlcj58IHN0cmluZyk6IEFic3RyYWN0Q29udHJvbCB7IHJldHVybiBfZmluZCh0aGlzLCBwYXRoKTsgfVxuXG4gIGdldEVycm9yKGVycm9yQ29kZTogc3RyaW5nLCBwYXRoOiBzdHJpbmdbXSA9IG51bGwpOiBhbnkge1xuICAgIHZhciBjb250cm9sID0gaXNQcmVzZW50KHBhdGgpICYmICFMaXN0V3JhcHBlci5pc0VtcHR5KHBhdGgpID8gdGhpcy5maW5kKHBhdGgpIDogdGhpcztcbiAgICBpZiAoaXNQcmVzZW50KGNvbnRyb2wpICYmIGlzUHJlc2VudChjb250cm9sLl9lcnJvcnMpKSB7XG4gICAgICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci5nZXQoY29udHJvbC5fZXJyb3JzLCBlcnJvckNvZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBoYXNFcnJvcihlcnJvckNvZGU6IHN0cmluZywgcGF0aDogc3RyaW5nW10gPSBudWxsKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmdldEVycm9yKGVycm9yQ29kZSwgcGF0aCkpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXBkYXRlQ29udHJvbHNFcnJvcnMoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhdHVzID0gdGhpcy5fY2FsY3VsYXRlU3RhdHVzKCk7XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhcmVudCkpIHtcbiAgICAgIHRoaXMuX3BhcmVudC5fdXBkYXRlQ29udHJvbHNFcnJvcnMoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9pbml0T2JzZXJ2YWJsZXMoKSB7XG4gICAgdGhpcy5fdmFsdWVDaGFuZ2VzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX3N0YXR1c0NoYW5nZXMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2NhbGN1bGF0ZVN0YXR1cygpOiBzdHJpbmcge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZXJyb3JzKSkgcmV0dXJuIElOVkFMSUQ7XG4gICAgaWYgKHRoaXMuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyhQRU5ESU5HKSkgcmV0dXJuIFBFTkRJTkc7XG4gICAgaWYgKHRoaXMuX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyhJTlZBTElEKSkgcmV0dXJuIElOVkFMSUQ7XG4gICAgcmV0dXJuIFZBTElEO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBhYnN0cmFjdCBfdXBkYXRlVmFsdWUoKTogdm9pZDtcblxuICAvKiogQGludGVybmFsICovXG4gIGFic3RyYWN0IF9hbnlDb250cm9sc0hhdmVTdGF0dXMoc3RhdHVzOiBzdHJpbmcpOiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlZmluZXMgYSBwYXJ0IG9mIGEgZm9ybSB0aGF0IGNhbm5vdCBiZSBkaXZpZGVkIGludG8gb3RoZXIgY29udHJvbHMuIGBDb250cm9sYHMgaGF2ZSB2YWx1ZXMgYW5kXG4gKiB2YWxpZGF0aW9uIHN0YXRlLCB3aGljaCBpcyBkZXRlcm1pbmVkIGJ5IGFuIG9wdGlvbmFsIHZhbGlkYXRpb24gZnVuY3Rpb24uXG4gKlxuICogYENvbnRyb2xgIGlzIG9uZSBvZiB0aGUgdGhyZWUgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2tzIHVzZWQgdG8gZGVmaW5lIGZvcm1zIGluIEFuZ3VsYXIsIGFsb25nXG4gKiB3aXRoIHtAbGluayBDb250cm9sR3JvdXB9IGFuZCB7QGxpbmsgQ29udHJvbEFycmF5fS5cbiAqXG4gKiAjIyBVc2FnZVxuICpcbiAqIEJ5IGRlZmF1bHQsIGEgYENvbnRyb2xgIGlzIGNyZWF0ZWQgZm9yIGV2ZXJ5IGA8aW5wdXQ+YCBvciBvdGhlciBmb3JtIGNvbXBvbmVudC5cbiAqIFdpdGgge0BsaW5rIE5nRm9ybUNvbnRyb2x9IG9yIHtAbGluayBOZ0Zvcm1Nb2RlbH0gYW4gZXhpc3Rpbmcge0BsaW5rIENvbnRyb2x9IGNhbiBiZVxuICogYm91bmQgdG8gYSBET00gZWxlbWVudCBpbnN0ZWFkLiBUaGlzIGBDb250cm9sYCBjYW4gYmUgY29uZmlndXJlZCB3aXRoIGEgY3VzdG9tXG4gKiB2YWxpZGF0aW9uIGZ1bmN0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC8yM0RFU09wYk5uQnBCSFp0MUJSND9wPXByZXZpZXcpKVxuICovXG5leHBvcnQgY2xhc3MgQ29udHJvbCBleHRlbmRzIEFic3RyYWN0Q29udHJvbCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uQ2hhbmdlOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3Rvcih2YWx1ZTogYW55ID0gbnVsbCwgdmFsaWRhdG9yOiBGdW5jdGlvbiA9IG51bGwsIGFzeW5jVmFsaWRhdG9yOiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICBzdXBlcih2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7b25seVNlbGY6IHRydWUsIGVtaXRFdmVudDogZmFsc2V9KTtcbiAgICB0aGlzLl9pbml0T2JzZXJ2YWJsZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHZhbHVlIG9mIHRoZSBjb250cm9sIHRvIGB2YWx1ZWAuXG4gICAqXG4gICAqIElmIGBvbmx5U2VsZmAgaXMgYHRydWVgLCB0aGlzIGNoYW5nZSB3aWxsIG9ubHkgYWZmZWN0IHRoZSB2YWxpZGF0aW9uIG9mIHRoaXMgYENvbnRyb2xgXG4gICAqIGFuZCBub3QgaXRzIHBhcmVudCBjb21wb25lbnQuIElmIGBlbWl0RXZlbnRgIGlzIGB0cnVlYCwgdGhpcyBjaGFuZ2Ugd2lsbCBjYXVzZSBhXG4gICAqIGB2YWx1ZUNoYW5nZXNgIGV2ZW50IG9uIHRoZSBgQ29udHJvbGAgdG8gYmUgZW1pdHRlZC4gQm90aCBvZiB0aGVzZSBvcHRpb25zIGRlZmF1bHQgdG9cbiAgICogYGZhbHNlYC5cbiAgICpcbiAgICogSWYgYGVtaXRNb2RlbFRvVmlld0NoYW5nZWAgaXMgYHRydWVgLCB0aGUgdmlldyB3aWxsIGJlIG5vdGlmaWVkIGFib3V0IHRoZSBuZXcgdmFsdWVcbiAgICogdmlhIGFuIGBvbkNoYW5nZWAgZXZlbnQuIFRoaXMgaXMgdGhlIGRlZmF1bHQgYmVoYXZpb3IgaWYgYGVtaXRNb2RlbFRvVmlld0NoYW5nZWAgaXMgbm90XG4gICAqIHNwZWNpZmllZC5cbiAgICovXG4gIHVwZGF0ZVZhbHVlKHZhbHVlOiBhbnksIHtvbmx5U2VsZiwgZW1pdEV2ZW50LCBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2V9OiB7XG4gICAgb25seVNlbGY/OiBib29sZWFuLFxuICAgIGVtaXRFdmVudD86IGJvb2xlYW4sXG4gICAgZW1pdE1vZGVsVG9WaWV3Q2hhbmdlPzogYm9vbGVhblxuICB9ID0ge30pOiB2b2lkIHtcbiAgICBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2UgPSBpc1ByZXNlbnQoZW1pdE1vZGVsVG9WaWV3Q2hhbmdlKSA/IGVtaXRNb2RlbFRvVmlld0NoYW5nZSA6IHRydWU7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX29uQ2hhbmdlKSAmJiBlbWl0TW9kZWxUb1ZpZXdDaGFuZ2UpIHRoaXMuX29uQ2hhbmdlKHRoaXMuX3ZhbHVlKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe29ubHlTZWxmOiBvbmx5U2VsZiwgZW1pdEV2ZW50OiBlbWl0RXZlbnR9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF91cGRhdGVWYWx1ZSgpIHt9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyhzdGF0dXM6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgY2hhbmdlIGV2ZW50cy5cbiAgICovXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IEZ1bmN0aW9uKTogdm9pZCB7IHRoaXMuX29uQ2hhbmdlID0gZm47IH1cbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgcGFydCBvZiBhIGZvcm0sIG9mIGZpeGVkIGxlbmd0aCwgdGhhdCBjYW4gY29udGFpbiBvdGhlciBjb250cm9scy5cbiAqXG4gKiBBIGBDb250cm9sR3JvdXBgIGFnZ3JlZ2F0ZXMgdGhlIHZhbHVlcyBhbmQgZXJyb3JzIG9mIGVhY2gge0BsaW5rIENvbnRyb2x9IGluIHRoZSBncm91cC4gVGh1cywgaWZcbiAqIG9uZSBvZiB0aGUgY29udHJvbHMgaW4gYSBncm91cCBpcyBpbnZhbGlkLCB0aGUgZW50aXJlIGdyb3VwIGlzIGludmFsaWQuIFNpbWlsYXJseSwgaWYgYSBjb250cm9sXG4gKiBjaGFuZ2VzIGl0cyB2YWx1ZSwgdGhlIGVudGlyZSBncm91cCBjaGFuZ2VzIGFzIHdlbGwuXG4gKlxuICogYENvbnRyb2xHcm91cGAgaXMgb25lIG9mIHRoZSB0aHJlZSBmdW5kYW1lbnRhbCBidWlsZGluZyBibG9ja3MgdXNlZCB0byBkZWZpbmUgZm9ybXMgaW4gQW5ndWxhcixcbiAqIGFsb25nIHdpdGgge0BsaW5rIENvbnRyb2x9IGFuZCB7QGxpbmsgQ29udHJvbEFycmF5fS4ge0BsaW5rIENvbnRyb2xBcnJheX0gY2FuIGFsc28gY29udGFpbiBvdGhlclxuICogY29udHJvbHMsIGJ1dCBpcyBvZiB2YXJpYWJsZSBsZW5ndGguXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzIzREVTT3BiTm5CcEJIWnQxQlI0P3A9cHJldmlldykpXG4gKi9cbmV4cG9ydCBjbGFzcyBDb250cm9sR3JvdXAgZXh0ZW5kcyBBYnN0cmFjdENvbnRyb2wge1xuICBwcml2YXRlIF9vcHRpb25hbHM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbHM6IHtba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2x9LFxuICAgICAgICAgICAgICBvcHRpb25hbHM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IG51bGwsIHZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsLFxuICAgICAgICAgICAgICBhc3luY1ZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgc3VwZXIodmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gICAgdGhpcy5fb3B0aW9uYWxzID0gaXNQcmVzZW50KG9wdGlvbmFscykgPyBvcHRpb25hbHMgOiB7fTtcbiAgICB0aGlzLl9pbml0T2JzZXJ2YWJsZXMoKTtcbiAgICB0aGlzLl9zZXRQYXJlbnRGb3JDb250cm9scygpO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7b25seVNlbGY6IHRydWUsIGVtaXRFdmVudDogZmFsc2V9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBjb250cm9sIHRvIHRoaXMgZ3JvdXAuXG4gICAqL1xuICBhZGRDb250cm9sKG5hbWU6IHN0cmluZywgY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogdm9pZCB7XG4gICAgdGhpcy5jb250cm9sc1tuYW1lXSA9IGNvbnRyb2w7XG4gICAgY29udHJvbC5zZXRQYXJlbnQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgY29udHJvbCBmcm9tIHRoaXMgZ3JvdXAuXG4gICAqL1xuICByZW1vdmVDb250cm9sKG5hbWU6IHN0cmluZyk6IHZvaWQgeyBTdHJpbmdNYXBXcmFwcGVyLmRlbGV0ZSh0aGlzLmNvbnRyb2xzLCBuYW1lKTsgfVxuXG4gIC8qKlxuICAgKiBNYXJrIHRoZSBuYW1lZCBjb250cm9sIGFzIG5vbi1vcHRpb25hbC5cbiAgICovXG4gIGluY2x1ZGUoY29udHJvbE5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIFN0cmluZ01hcFdyYXBwZXIuc2V0KHRoaXMuX29wdGlvbmFscywgY29udHJvbE5hbWUsIHRydWUpO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmsgdGhlIG5hbWVkIGNvbnRyb2wgYXMgb3B0aW9uYWwuXG4gICAqL1xuICBleGNsdWRlKGNvbnRyb2xOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLnNldCh0aGlzLl9vcHRpb25hbHMsIGNvbnRyb2xOYW1lLCBmYWxzZSk7XG4gICAgdGhpcy51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGVyZSBpcyBhIGNvbnRyb2wgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBpbiB0aGUgZ3JvdXAuXG4gICAqL1xuICBjb250YWlucyhjb250cm9sTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdmFyIGMgPSBTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKHRoaXMuY29udHJvbHMsIGNvbnRyb2xOYW1lKTtcbiAgICByZXR1cm4gYyAmJiB0aGlzLl9pbmNsdWRlZChjb250cm9sTmFtZSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZXRQYXJlbnRGb3JDb250cm9scygpIHtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy5jb250cm9scywgKGNvbnRyb2wsIG5hbWUpID0+IHsgY29udHJvbC5zZXRQYXJlbnQodGhpcyk7IH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdXBkYXRlVmFsdWUoKSB7IHRoaXMuX3ZhbHVlID0gdGhpcy5fcmVkdWNlVmFsdWUoKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyhzdGF0dXM6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciByZXMgPSBmYWxzZTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy5jb250cm9scywgKGNvbnRyb2wsIG5hbWUpID0+IHtcbiAgICAgIHJlcyA9IHJlcyB8fCAodGhpcy5jb250YWlucyhuYW1lKSAmJiBjb250cm9sLnN0YXR1cyA9PSBzdGF0dXMpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWR1Y2VWYWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVkdWNlQ2hpbGRyZW4oe30sIChhY2MsIGNvbnRyb2wsIG5hbWUpID0+IHtcbiAgICAgIGFjY1tuYW1lXSA9IGNvbnRyb2wudmFsdWU7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVkdWNlQ2hpbGRyZW4oaW5pdFZhbHVlOiBhbnksIGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZXMgPSBpbml0VmFsdWU7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuY29udHJvbHMsIChjb250cm9sLCBuYW1lKSA9PiB7XG4gICAgICBpZiAodGhpcy5faW5jbHVkZWQobmFtZSkpIHtcbiAgICAgICAgcmVzID0gZm4ocmVzLCBjb250cm9sLCBuYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaW5jbHVkZWQoY29udHJvbE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciBpc09wdGlvbmFsID0gU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh0aGlzLl9vcHRpb25hbHMsIGNvbnRyb2xOYW1lKTtcbiAgICByZXR1cm4gIWlzT3B0aW9uYWwgfHwgU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5fb3B0aW9uYWxzLCBjb250cm9sTmFtZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgcGFydCBvZiBhIGZvcm0sIG9mIHZhcmlhYmxlIGxlbmd0aCwgdGhhdCBjYW4gY29udGFpbiBvdGhlciBjb250cm9scy5cbiAqXG4gKiBBIGBDb250cm9sQXJyYXlgIGFnZ3JlZ2F0ZXMgdGhlIHZhbHVlcyBhbmQgZXJyb3JzIG9mIGVhY2gge0BsaW5rIENvbnRyb2x9IGluIHRoZSBncm91cC4gVGh1cywgaWZcbiAqIG9uZSBvZiB0aGUgY29udHJvbHMgaW4gYSBncm91cCBpcyBpbnZhbGlkLCB0aGUgZW50aXJlIGdyb3VwIGlzIGludmFsaWQuIFNpbWlsYXJseSwgaWYgYSBjb250cm9sXG4gKiBjaGFuZ2VzIGl0cyB2YWx1ZSwgdGhlIGVudGlyZSBncm91cCBjaGFuZ2VzIGFzIHdlbGwuXG4gKlxuICogYENvbnRyb2xBcnJheWAgaXMgb25lIG9mIHRoZSB0aHJlZSBmdW5kYW1lbnRhbCBidWlsZGluZyBibG9ja3MgdXNlZCB0byBkZWZpbmUgZm9ybXMgaW4gQW5ndWxhcixcbiAqIGFsb25nIHdpdGgge0BsaW5rIENvbnRyb2x9IGFuZCB7QGxpbmsgQ29udHJvbEdyb3VwfS4ge0BsaW5rIENvbnRyb2xHcm91cH0gY2FuIGFsc28gY29udGFpblxuICogb3RoZXIgY29udHJvbHMsIGJ1dCBpcyBvZiBmaXhlZCBsZW5ndGguXG4gKlxuICogIyMgQWRkaW5nIG9yIHJlbW92aW5nIGNvbnRyb2xzXG4gKlxuICogVG8gY2hhbmdlIHRoZSBjb250cm9scyBpbiB0aGUgYXJyYXksIHVzZSB0aGUgYHB1c2hgLCBgaW5zZXJ0YCwgb3IgYHJlbW92ZUF0YCBtZXRob2RzXG4gKiBpbiBgQ29udHJvbEFycmF5YCBpdHNlbGYuIFRoZXNlIG1ldGhvZHMgZW5zdXJlIHRoZSBjb250cm9scyBhcmUgcHJvcGVybHkgdHJhY2tlZCBpbiB0aGVcbiAqIGZvcm0ncyBoaWVyYXJjaHkuIERvIG5vdCBtb2RpZnkgdGhlIGFycmF5IG9mIGBBYnN0cmFjdENvbnRyb2xgcyB1c2VkIHRvIGluc3RhbnRpYXRlXG4gKiB0aGUgYENvbnRyb2xBcnJheWAgZGlyZWN0bHksIGFzIHRoYXQgd2lsbCByZXN1bHQgaW4gc3RyYW5nZSBhbmQgdW5leHBlY3RlZCBiZWhhdmlvciBzdWNoXG4gKiBhcyBicm9rZW4gY2hhbmdlIGRldGVjdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvMjNERVNPcGJObkJwQkhadDFCUjQ/cD1wcmV2aWV3KSlcbiAqL1xuZXhwb3J0IGNsYXNzIENvbnRyb2xBcnJheSBleHRlbmRzIEFic3RyYWN0Q29udHJvbCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250cm9sczogQWJzdHJhY3RDb250cm9sW10sIHZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsLFxuICAgICAgICAgICAgICBhc3luY1ZhbGlkYXRvcjogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgc3VwZXIodmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG4gICAgdGhpcy5faW5pdE9ic2VydmFibGVzKCk7XG4gICAgdGhpcy5fc2V0UGFyZW50Rm9yQ29udHJvbHMoKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB7QGxpbmsgQWJzdHJhY3RDb250cm9sfSBhdCB0aGUgZ2l2ZW4gYGluZGV4YCBpbiB0aGUgYXJyYXkuXG4gICAqL1xuICBhdChpbmRleDogbnVtYmVyKTogQWJzdHJhY3RDb250cm9sIHsgcmV0dXJuIHRoaXMuY29udHJvbHNbaW5kZXhdOyB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIG5ldyB7QGxpbmsgQWJzdHJhY3RDb250cm9sfSBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheS5cbiAgICovXG4gIHB1c2goY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogdm9pZCB7XG4gICAgdGhpcy5jb250cm9scy5wdXNoKGNvbnRyb2wpO1xuICAgIGNvbnRyb2wuc2V0UGFyZW50KHRoaXMpO1xuICAgIHRoaXMudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIG5ldyB7QGxpbmsgQWJzdHJhY3RDb250cm9sfSBhdCB0aGUgZ2l2ZW4gYGluZGV4YCBpbiB0aGUgYXJyYXkuXG4gICAqL1xuICBpbnNlcnQoaW5kZXg6IG51bWJlciwgY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIuaW5zZXJ0KHRoaXMuY29udHJvbHMsIGluZGV4LCBjb250cm9sKTtcbiAgICBjb250cm9sLnNldFBhcmVudCh0aGlzKTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGNvbnRyb2wgYXQgdGhlIGdpdmVuIGBpbmRleGAgaW4gdGhlIGFycmF5LlxuICAgKi9cbiAgcmVtb3ZlQXQoaW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZUF0KHRoaXMuY29udHJvbHMsIGluZGV4KTtcbiAgICB0aGlzLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMZW5ndGggb2YgdGhlIGNvbnRyb2wgYXJyYXkuXG4gICAqL1xuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmNvbnRyb2xzLmxlbmd0aDsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZVZhbHVlKCk6IHZvaWQgeyB0aGlzLl92YWx1ZSA9IHRoaXMuY29udHJvbHMubWFwKChjb250cm9sKSA9PiBjb250cm9sLnZhbHVlKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FueUNvbnRyb2xzSGF2ZVN0YXR1cyhzdGF0dXM6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLnNvbWUoYyA9PiBjLnN0YXR1cyA9PSBzdGF0dXMpO1xuICB9XG5cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZXRQYXJlbnRGb3JDb250cm9scygpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2wpID0+IHsgY29udHJvbC5zZXRQYXJlbnQodGhpcyk7IH0pO1xuICB9XG59XG4iXX0=