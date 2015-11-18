import { Observable } from 'angular2/src/facade/async';
/**
 * Indicates that a Control is valid, i.e. that no errors exist in the input value.
 */
export declare const VALID: string;
/**
 * Indicates that a Control is invalid, i.e. that an error exists in the input value.
 */
export declare const INVALID: string;
/**
 * Indicates that a Control is pending, i.e. that async validation is occuring and
 * errors are not yet available for the input value.
 */
export declare const PENDING: string;
export declare function isControl(control: Object): boolean;
/**
 *
 */
export declare abstract class AbstractControl {
    validator: Function;
    asyncValidator: Function;
    private _valueChanges;
    private _statusChanges;
    private _status;
    private _errors;
    private _pristine;
    private _touched;
    private _parent;
    private _asyncValidationSubscription;
    constructor(validator: Function, asyncValidator: Function);
    value: any;
    status: string;
    valid: boolean;
    /**
     * Returns the errors of this control.
     */
    errors: {
        [key: string]: any;
    };
    pristine: boolean;
    dirty: boolean;
    touched: boolean;
    untouched: boolean;
    valueChanges: Observable<any>;
    statusChanges: Observable<any>;
    pending: boolean;
    markAsTouched(): void;
    markAsDirty({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsPending({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    setParent(parent: ControlGroup | ControlArray): void;
    updateValueAndValidity({onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    private _runValidator();
    private _runAsyncValidator(emitEvent);
    private _cancelExistingSubscription();
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
    setErrors(errors: {
        [key: string]: any;
    }, {emitEvent}?: {
        emitEvent?: boolean;
    }): void;
    find(path: Array<string | number> | string): AbstractControl;
    getError(errorCode: string, path?: string[]): any;
    hasError(errorCode: string, path?: string[]): boolean;
    private _calculateStatus();
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
export declare class Control extends AbstractControl {
    constructor(value?: any, validator?: Function, asyncValidator?: Function);
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
    updateValue(value: any, {onlySelf, emitEvent, emitModelToViewChange}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
    }): void;
    /**
     * Register a listener for change events.
     */
    registerOnChange(fn: Function): void;
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
export declare class ControlGroup extends AbstractControl {
    controls: {
        [key: string]: AbstractControl;
    };
    private _optionals;
    constructor(controls: {
        [key: string]: AbstractControl;
    }, optionals?: {
        [key: string]: boolean;
    }, validator?: Function, asyncValidator?: Function);
    /**
     * Add a control to this group.
     */
    addControl(name: string, control: AbstractControl): void;
    /**
     * Remove a control from this group.
     */
    removeControl(name: string): void;
    /**
     * Mark the named control as non-optional.
     */
    include(controlName: string): void;
    /**
     * Mark the named control as optional.
     */
    exclude(controlName: string): void;
    /**
     * Check whether there is a control with the given name in the group.
     */
    contains(controlName: string): boolean;
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
export declare class ControlArray extends AbstractControl {
    controls: AbstractControl[];
    constructor(controls: AbstractControl[], validator?: Function, asyncValidator?: Function);
    /**
     * Get the {@link AbstractControl} at the given `index` in the array.
     */
    at(index: number): AbstractControl;
    /**
     * Insert a new {@link AbstractControl} at the end of the array.
     */
    push(control: AbstractControl): void;
    /**
     * Insert a new {@link AbstractControl} at the given `index` in the array.
     */
    insert(index: number, control: AbstractControl): void;
    /**
     * Remove the control at the given `index` in the array.
     */
    removeAt(index: number): void;
    /**
     * Length of the control array.
     */
    length: number;
}
