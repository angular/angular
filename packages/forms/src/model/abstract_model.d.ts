/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable, Subject } from 'rxjs';
import type { AsyncValidatorFn, ValidationErrors, ValidatorFn } from '../directives/validators';
import type { FormArray } from './form_array';
import type { FormGroup } from './form_group';
/**
 * Reports that a control is valid, meaning that no errors exist in the input value.
 *
 * @see {@link status}
 */
export declare const VALID = "VALID";
/**
 * Reports that a control is invalid, meaning that an error exists in the input value.
 *
 * @see {@link status}
 */
export declare const INVALID = "INVALID";
/**
 * Reports that a control is pending, meaning that async validation is occurring and
 * errors are not yet available for the input value.
 *
 * @see {@link markAsPending}
 * @see {@link status}
 */
export declare const PENDING = "PENDING";
/**
 * Reports that a control is disabled, meaning that the control is exempt from ancestor
 * calculations of validity or value.
 *
 * @see {@link markAsDisabled}
 * @see {@link status}
 */
export declare const DISABLED = "DISABLED";
/**
 * A form can have several different statuses. Each
 * possible status is returned as a string literal.
 *
 * * **VALID**: Reports that a control is valid, meaning that no errors exist in the input
 * value.
 * * **INVALID**: Reports that a control is invalid, meaning that an error exists in the input
 * value.
 * * **PENDING**: Reports that a control is pending, meaning that async validation is
 * occurring and errors are not yet available for the input value.
 * * **DISABLED**: Reports that a control is
 * disabled, meaning that the control is exempt from ancestor calculations of validity or value.
 *
 * @publicApi
 */
export type FormControlStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';
/**
 * Base class for every event sent by `AbstractControl.events()`
 *
 * @publicApi
 */
export declare abstract class ControlEvent<T = any> {
    /**
     * Form control from which this event is originated.
     *
     * Note: the type of the control can't be infered from T as the event can be emitted by any of child controls
     */
    abstract readonly source: AbstractControl<unknown>;
}
/**
 * Event fired when the value of a control changes.
 *
 * @publicApi
 */
export declare class ValueChangeEvent<T> extends ControlEvent<T> {
    readonly value: T;
    readonly source: AbstractControl;
    constructor(value: T, source: AbstractControl);
}
/**
 * Event fired when the control's pristine state changes (pristine <=> dirty).
 *
 * @publicApi */
export declare class PristineChangeEvent extends ControlEvent {
    readonly pristine: boolean;
    readonly source: AbstractControl;
    constructor(pristine: boolean, source: AbstractControl);
}
/**
 * Event fired when the control's touched status changes (touched <=> untouched).
 *
 * @publicApi
 */
export declare class TouchedChangeEvent extends ControlEvent {
    readonly touched: boolean;
    readonly source: AbstractControl;
    constructor(touched: boolean, source: AbstractControl);
}
/**
 * Event fired when the control's status changes.
 *
 * @publicApi
 */
export declare class StatusChangeEvent extends ControlEvent {
    readonly status: FormControlStatus;
    readonly source: AbstractControl;
    constructor(status: FormControlStatus, source: AbstractControl);
}
/**
 * Event fired when a form is submitted
 *
 * @publicApi
 */
export declare class FormSubmittedEvent extends ControlEvent {
    readonly source: AbstractControl;
    constructor(source: AbstractControl);
}
/**
 * Event fired when a form is reset.
 *
 * @publicApi
 */
export declare class FormResetEvent extends ControlEvent {
    readonly source: AbstractControl;
    constructor(source: AbstractControl);
}
/**
 * Gets validators from either an options object or given validators.
 */
export declare function pickValidators(validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): ValidatorFn | ValidatorFn[] | null;
/**
 * Gets async validators from either an options object or given validators.
 */
export declare function pickAsyncValidators(asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): AsyncValidatorFn | AsyncValidatorFn[] | null;
export type FormHooks = 'change' | 'blur' | 'submit';
/**
 * Interface for options provided to an `AbstractControl`.
 *
 * @publicApi
 */
export interface AbstractControlOptions {
    /**
     * @description
     * The list of validators applied to a control.
     */
    validators?: ValidatorFn | ValidatorFn[] | null;
    /**
     * @description
     * The list of async validators applied to control.
     */
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;
    /**
     * @description
     * The event name for control to update upon.
     */
    updateOn?: 'change' | 'blur' | 'submit';
}
export declare function isOptionsObj(validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): validatorOrOpts is AbstractControlOptions;
export declare function assertControlPresent(parent: any, isGroup: boolean, key: string | number): void;
export declare function assertAllValuesPresent(control: any, isGroup: boolean, value: any): void;
export type ɵIsAny<T, Y, N> = 0 extends 1 & T ? Y : N;
/**
 * `TypedOrUntyped` allows one of two different types to be selected, depending on whether the Forms
 * class it's applied to is typed or not.
 *
 * This is for internal Angular usage to support typed forms; do not directly use it.
 */
export type ɵTypedOrUntyped<T, Typed, Untyped> = ɵIsAny<T, Untyped, Typed>;
/**
 * Value gives the value type corresponding to a control type.
 *
 * Note that the resulting type will follow the same rules as `.value` on your control, group, or
 * array, including `undefined` for each group element which might be disabled.
 *
 * If you are trying to extract a value type for a data model, you probably want {@link RawValue},
 * which will not have `undefined` in group keys.
 *
 * @usageNotes
 *
 * ### `FormControl` value type
 *
 * You can extract the value type of a single control:
 *
 * ```ts
 * type NameControl = FormControl<string>;
 * type NameValue = Value<NameControl>;
 * ```
 *
 * The resulting type is `string`.
 *
 * ### `FormGroup` value type
 *
 * Imagine you have an interface defining the controls in your group. You can extract the shape of
 * the values as follows:
 *
 * ```ts
 * interface PartyFormControls {
 *   address: FormControl<string>;
 * }
 *
 * // Value operates on controls; the object must be wrapped in a FormGroup.
 * type PartyFormValues = Value<FormGroup<PartyFormControls>>;
 * ```
 *
 * The resulting type is `{address: string|undefined}`.
 *
 * ### `FormArray` value type
 *
 * You can extract values from FormArrays as well:
 *
 * ```ts
 * type GuestNamesControls = FormArray<FormControl<string>>;
 *
 * type NamesValues = Value<GuestNamesControls>;
 * ```
 *
 * The resulting type is `string[]`.
 *
 * **Internal: not for public use.**
 */
export type ɵValue<T extends AbstractControl | undefined> = T extends AbstractControl<any, any> ? T['value'] : never;
/**
 * RawValue gives the raw value type corresponding to a control type.
 *
 * Note that the resulting type will follow the same rules as `.getRawValue()` on your control,
 * group, or array. This means that all controls inside a group will be required, not optional,
 * regardless of their disabled state.
 *
 * You may also wish to use {@link ɵValue}, which will have `undefined` in group keys (which can be
 * disabled).
 *
 * @usageNotes
 *
 * ### `FormGroup` raw value type
 *
 * Imagine you have an interface defining the controls in your group. You can extract the shape of
 * the raw values as follows:
 *
 * ```ts
 * interface PartyFormControls {
 *   address: FormControl<string>;
 * }
 *
 * // RawValue operates on controls; the object must be wrapped in a FormGroup.
 * type PartyFormValues = RawValue<FormGroup<PartyFormControls>>;
 * ```
 *
 * The resulting type is `{address: string}`. (Note the absence of `undefined`.)
 *
 *  **Internal: not for public use.**
 */
export type ɵRawValue<T extends AbstractControl | undefined> = T extends AbstractControl<any, any> ? T['setValue'] extends (v: infer R) => void ? R : never : never;
/**
 * Tokenize splits a string literal S by a delimiter D.
 */
export type ɵTokenize<S extends string, D extends string> = string extends S ? string[] : S extends `${infer T}${D}${infer U}` ? [T, ...ɵTokenize<U, D>] : [S];
/**
 * CoerceStrArrToNumArr accepts an array of strings, and converts any numeric string to a number.
 */
export type ɵCoerceStrArrToNumArr<S> = S extends [infer Head, ...infer Tail] ? Head extends `${number}` ? [number, ...ɵCoerceStrArrToNumArr<Tail>] : [Head, ...ɵCoerceStrArrToNumArr<Tail>] : [];
/**
 * Navigate takes a type T and an array K, and returns the type of T[K[0]][K[1]][K[2]]...
 */
export type ɵNavigate<T, K extends Array<string | number>> = T extends object ? K extends [infer Head, ...infer Tail] ? Head extends keyof T ? Tail extends (string | number)[] ? [] extends Tail ? T[Head] : ɵNavigate<T[Head], Tail> : any : never : any : any;
/**
 * ɵWriteable removes readonly from all keys.
 */
export type ɵWriteable<T> = {
    -readonly [P in keyof T]: T[P];
};
/**
 * GetProperty takes a type T and some property names or indices K.
 * If K is a dot-separated string, it is tokenized into an array before proceeding.
 * Then, the type of the nested property at K is computed: T[K[0]][K[1]][K[2]]...
 * This works with both objects, which are indexed by property name, and arrays, which are indexed
 * numerically.
 *
 * For internal use only.
 */
export type ɵGetProperty<T, K> = K extends string ? ɵGetProperty<T, ɵCoerceStrArrToNumArr<ɵTokenize<K, '.'>>> : ɵWriteable<K> extends Array<string | number> ? ɵNavigate<T, ɵWriteable<K>> : any;
/**
 * This is the base class for `FormControl`, `FormGroup`, and `FormArray`.
 *
 * It provides some of the shared behavior that all controls and groups of controls have, like
 * running validators, calculating status, and resetting state. It also defines the properties
 * that are shared between all sub-classes, like `value`, `valid`, and `dirty`. It shouldn't be
 * instantiated directly.
 *
 * The first type parameter TValue represents the value type of the control (`control.value`).
 * The optional type parameter TRawValue  represents the raw value type (`control.getRawValue()`).
 *
 * @see [Forms Guide](guide/forms)
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 * @see [Dynamic Forms Guide](guide/forms/dynamic-forms)
 *
 * @publicApi
 */
export declare abstract class AbstractControl<TValue = any, TRawValue extends TValue = TValue, TValueWithOptionalControlStates = any> {
    /** @internal */
    _pendingDirty: boolean;
    /**
     * Indicates that a control has its own pending asynchronous validation in progress.
     * It also stores if the control should emit events when the validation status changes.
     *
     * @internal
     */
    _hasOwnPendingAsyncValidator: null | {
        emitEvent: boolean;
        shouldHaveEmitted: boolean;
    };
    /** @internal */
    _pendingTouched: boolean;
    /** @internal */
    _onCollectionChange: () => void;
    /** @internal */
    _updateOn?: FormHooks;
    private _parent;
    private _asyncValidationSubscription;
    /**
     * Contains the result of merging synchronous validators into a single validator function
     * (combined using `Validators.compose`).
     *
     * @internal
     */
    private _composedValidatorFn;
    /**
     * Contains the result of merging asynchronous validators into a single validator function
     * (combined using `Validators.composeAsync`).
     *
     * @internal
     */
    private _composedAsyncValidatorFn;
    /**
     * Synchronous validators as they were provided:
     *  - in `AbstractControl` constructor
     *  - as an argument while calling `setValidators` function
     *  - while calling the setter on the `validator` field (e.g. `control.validator = validatorFn`)
     *
     * @internal
     */
    private _rawValidators;
    /**
     * Asynchronous validators as they were provided:
     *  - in `AbstractControl` constructor
     *  - as an argument while calling `setAsyncValidators` function
     *  - while calling the setter on the `asyncValidator` field (e.g. `control.asyncValidator =
     * asyncValidatorFn`)
     *
     * @internal
     */
    private _rawAsyncValidators;
    /**
     * The current value of the control.
     *
     * * For a `FormControl`, the current value.
     * * For an enabled `FormGroup`, the values of enabled controls as an object
     * with a key-value pair for each member of the group.
     * * For a disabled `FormGroup`, the values of all controls as an object
     * with a key-value pair for each member of the group.
     * * For a `FormArray`, the values of enabled controls as an array.
     *
     */
    readonly value: TValue;
    /**
     * Initialize the AbstractControl instance.
     *
     * @param validators The function or array of functions that is used to determine the validity of
     *     this control synchronously.
     * @param asyncValidators The function or array of functions that is used to determine validity of
     *     this control asynchronously.
     */
    constructor(validators: ValidatorFn | ValidatorFn[] | null, asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null);
    /**
     * Returns the function that is used to determine the validity of this control synchronously.
     * If multiple validators have been added, this will be a single composed function.
     * See `Validators.compose()` for additional information.
     */
    get validator(): ValidatorFn | null;
    set validator(validatorFn: ValidatorFn | null);
    /**
     * Returns the function that is used to determine the validity of this control asynchronously.
     * If multiple validators have been added, this will be a single composed function.
     * See `Validators.compose()` for additional information.
     */
    get asyncValidator(): AsyncValidatorFn | null;
    set asyncValidator(asyncValidatorFn: AsyncValidatorFn | null);
    /**
     * The parent control.
     */
    get parent(): FormGroup | FormArray | null;
    /**
     * The validation status of the control.
     *
     * @see {@link FormControlStatus}
     *
     * These status values are mutually exclusive, so a control cannot be
     * both valid AND invalid or invalid AND disabled.
     */
    get status(): FormControlStatus;
    private set status(value);
    /** @internal */
    readonly _status: import("@angular/core").Signal<FormControlStatus | undefined>;
    private readonly statusReactive;
    /**
     * A control is `valid` when its `status` is `VALID`.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if the control has passed all of its validation tests,
     * false otherwise.
     */
    get valid(): boolean;
    /**
     * A control is `invalid` when its `status` is `INVALID`.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if this control has failed one or more of its validation checks,
     * false otherwise.
     */
    get invalid(): boolean;
    /**
     * A control is `pending` when its `status` is `PENDING`.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if this control is in the process of conducting a validation check,
     * false otherwise.
     */
    get pending(): boolean;
    /**
     * A control is `disabled` when its `status` is `DISABLED`.
     *
     * Disabled controls are exempt from validation checks and
     * are not included in the aggregate value of their ancestor
     * controls.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if the control is disabled, false otherwise.
     */
    get disabled(): boolean;
    /**
     * A control is `enabled` as long as its `status` is not `DISABLED`.
     *
     * @returns True if the control has any status other than 'DISABLED',
     * false if the status is 'DISABLED'.
     *
     * @see {@link AbstractControl.status}
     *
     */
    get enabled(): boolean;
    /**
     * An object containing any errors generated by failing validation,
     * or null if there are no errors.
     */
    readonly errors: ValidationErrors | null;
    /**
     * A control is `pristine` if the user has not yet changed
     * the value in the UI.
     *
     * @returns True if the user has not yet changed the value in the UI; compare `dirty`.
     * Programmatic changes to a control's value do not mark it dirty.
     */
    get pristine(): boolean;
    private set pristine(value);
    /** @internal */
    readonly _pristine: import("@angular/core").Signal<boolean>;
    private readonly pristineReactive;
    /**
     * A control is `dirty` if the user has changed the value
     * in the UI.
     *
     * @returns True if the user has changed the value of this control in the UI; compare `pristine`.
     * Programmatic changes to a control's value do not mark it dirty.
     */
    get dirty(): boolean;
    /**
     * True if the control is marked as `touched`.
     *
     * A control is marked `touched` once the user has triggered
     * a `blur` event on it.
     */
    get touched(): boolean;
    private set touched(value);
    /** @internal */
    readonly _touched: import("@angular/core").Signal<boolean>;
    private readonly touchedReactive;
    /**
     * True if the control has not been marked as touched
     *
     * A control is `untouched` if the user has not yet triggered
     * a `blur` event on it.
     */
    get untouched(): boolean;
    /**
     * Exposed as observable, see below.
     *
     * @internal
     */
    readonly _events: Subject<ControlEvent<TValue>>;
    /**
     * A multicasting observable that emits an event every time the state of the control changes.
     * It emits for value, status, pristine or touched changes.
     *
     * **Note**: On value change, the emit happens right after a value of this control is updated. The
     * value of a parent control (for example if this FormControl is a part of a FormGroup) is updated
     * later, so accessing a value of a parent control (using the `value` property) from the callback
     * of this event might result in getting a value that has not been updated yet. Subscribe to the
     * `events` of the parent control instead.
     * For other event types, the events are emitted after the parent control has been updated.
     *
     */
    readonly events: Observable<ControlEvent<TValue>>;
    /**
     * A multicasting observable that emits an event every time the value of the control changes, in
     * the UI or programmatically. It also emits an event each time you call enable() or disable()
     * without passing along {emitEvent: false} as a function argument.
     *
     * **Note**: the emit happens right after a value of this control is updated. The value of a
     * parent control (for example if this FormControl is a part of a FormGroup) is updated later, so
     * accessing a value of a parent control (using the `value` property) from the callback of this
     * event might result in getting a value that has not been updated yet. Subscribe to the
     * `valueChanges` event of the parent control instead.
     */
    readonly valueChanges: Observable<TValue>;
    /**
     * A multicasting observable that emits an event every time the validation `status` of the control
     * recalculates.
     *
     * @see {@link FormControlStatus}
     * @see {@link AbstractControl.status}
     */
    readonly statusChanges: Observable<FormControlStatus>;
    /**
     * Reports the update strategy of the `AbstractControl` (meaning
     * the event on which the control updates itself).
     * Possible values: `'change'` | `'blur'` | `'submit'`
     * Default value: `'change'`
     */
    get updateOn(): FormHooks;
    /**
     * Sets the synchronous validators that are active on this control.  Calling
     * this overwrites any existing synchronous validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * If you want to add a new validator without affecting existing ones, consider
     * using `addValidators()` method instead.
     */
    setValidators(validators: ValidatorFn | ValidatorFn[] | null): void;
    /**
     * Sets the asynchronous validators that are active on this control. Calling this
     * overwrites any existing asynchronous validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * If you want to add a new validator without affecting existing ones, consider
     * using `addAsyncValidators()` method instead.
     */
    setAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[] | null): void;
    /**
     * Add a synchronous validator or validators to this control, without affecting other validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * Adding a validator that already exists will have no effect. If duplicate validator functions
     * are present in the `validators` array, only the first instance would be added to a form
     * control.
     *
     * @param validators The new validator function or functions to add to this control.
     */
    addValidators(validators: ValidatorFn | ValidatorFn[]): void;
    /**
     * Add an asynchronous validator or validators to this control, without affecting other
     * validators.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * Adding a validator that already exists will have no effect.
     *
     * @param validators The new asynchronous validator function or functions to add to this control.
     */
    addAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void;
    /**
     * Remove a synchronous validator from this control, without affecting other validators.
     * Validators are compared by function reference; you must pass a reference to the exact same
     * validator function as the one that was originally set. If a provided validator is not found,
     * it is ignored.
     *
     * @usageNotes
     *
     * ### Reference to a ValidatorFn
     *
     * ```
     * // Reference to the RequiredValidator
     * const ctrl = new FormControl<string | null>('', Validators.required);
     * ctrl.removeValidators(Validators.required);
     *
     * // Reference to anonymous function inside MinValidator
     * const minValidator = Validators.min(3);
     * const ctrl = new FormControl<string | null>('', minValidator);
     * expect(ctrl.hasValidator(minValidator)).toEqual(true)
     * expect(ctrl.hasValidator(Validators.min(3))).toEqual(false)
     *
     * ctrl.removeValidators(minValidator);
     * ```
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * @param validators The validator or validators to remove.
     */
    removeValidators(validators: ValidatorFn | ValidatorFn[]): void;
    /**
     * Remove an asynchronous validator from this control, without affecting other validators.
     * Validators are compared by function reference; you must pass a reference to the exact same
     * validator function as the one that was originally set. If a provided validator is not found, it
     * is ignored.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     * @param validators The asynchronous validator or validators to remove.
     */
    removeAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void;
    /**
     * Check whether a synchronous validator function is present on this control. The provided
     * validator must be a reference to the exact same function that was provided.
     *
     * @usageNotes
     *
     * ### Reference to a ValidatorFn
     *
     * ```
     * // Reference to the RequiredValidator
     * const ctrl = new FormControl<number | null>(0, Validators.required);
     * expect(ctrl.hasValidator(Validators.required)).toEqual(true)
     *
     * // Reference to anonymous function inside MinValidator
     * const minValidator = Validators.min(3);
     * const ctrl = new FormControl<number | null>(0, minValidator);
     * expect(ctrl.hasValidator(minValidator)).toEqual(true)
     * expect(ctrl.hasValidator(Validators.min(3))).toEqual(false)
     * ```
     *
     * @param validator The validator to check for presence. Compared by function reference.
     * @returns Whether the provided validator was found on this control.
     */
    hasValidator(validator: ValidatorFn): boolean;
    /**
     * Check whether an asynchronous validator function is present on this control. The provided
     * validator must be a reference to the exact same function that was provided.
     *
     * @param validator The asynchronous validator to check for presence. Compared by function
     *     reference.
     * @returns Whether the provided asynchronous validator was found on this control.
     */
    hasAsyncValidator(validator: AsyncValidatorFn): boolean;
    /**
     * Empties out the synchronous validator list.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     */
    clearValidators(): void;
    /**
     * Empties out the async validator list.
     *
     * When you add or remove a validator at run time, you must call
     * `updateValueAndValidity()` for the new validation to take effect.
     *
     */
    clearAsyncValidators(): void;
    /**
     * Marks the control as `touched`. A control is touched by focus and
     * blur events that do not change the value.
     *
     * @see {@link markAsUntouched()}
     * @see {@link markAsDirty()}
     * @see {@link markAsPristine()}
     *
     * @param opts Configuration options that determine how the control propagates changes
     * and emits events after marking is applied.
     * * `onlySelf`: When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `events`
     * observable emits a `TouchedChangeEvent` with the `touched` property being `true`.
     * When false, no events are emitted.
     */
    markAsTouched(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     * @internal Used to propagate the source control downwards
     */
    markAsTouched(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        sourceControl?: AbstractControl;
    }): void;
    /**
     * Marks the control and all its descendant controls as `dirty`.
     * @see {@link markAsDirty()}
     *
     * @param opts Configuration options that determine how the control propagates changes
     * and emits events after marking is applied.
     * * `emitEvent`: When true or not supplied (the default), the `events`
     * observable emits a `PristineChangeEvent` with the `pristine` property being `false`.
     * When false, no events are emitted.
     */
    markAllAsDirty(opts?: {
        emitEvent?: boolean;
    }): void;
    /**
     * Marks the control and all its descendant controls as `touched`.
     * @see {@link markAsTouched()}
     *
     * @param opts Configuration options that determine how the control propagates changes
     * and emits events after marking is applied.
     * * `emitEvent`: When true or not supplied (the default), the `events`
     * observable emits a `TouchedChangeEvent` with the `touched` property being `true`.
     * When false, no events are emitted.
     */
    markAllAsTouched(opts?: {
        emitEvent?: boolean;
    }): void;
    /**
     * Marks the control as `untouched`.
     *
     * If the control has any children, also marks all children as `untouched`
     * and recalculates the `touched` status of all parent controls.
     *
     * @see {@link markAsTouched()}
     * @see {@link markAsDirty()}
     * @see {@link markAsPristine()}
     *
     * @param opts Configuration options that determine how the control propagates changes
     * and emits events after the marking is applied.
     * * `onlySelf`: When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `events`
     * observable emits a `TouchedChangeEvent` with the `touched` property being `false`.
     * When false, no events are emitted.
     */
    markAsUntouched(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     *
     * @internal Used to propagate the source control downwards
     */
    markAsUntouched(opts: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        sourceControl?: AbstractControl;
    }): void;
    /**
     * Marks the control as `dirty`. A control becomes dirty when
     * the control's value is changed through the UI; compare `markAsTouched`.
     *
     * @see {@link markAsTouched()}
     * @see {@link markAsUntouched()}
     * @see {@link markAsPristine()}
     *
     * @param opts Configuration options that determine how the control propagates changes
     * and emits events after marking is applied.
     * * `onlySelf`: When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `events`
     * observable emits a `PristineChangeEvent` with the `pristine` property being `false`.
     * When false, no events are emitted.
     */
    markAsDirty(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     * @internal Used to propagate the source control downwards
     */
    markAsDirty(opts: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        sourceControl?: AbstractControl;
    }): void;
    /**
     * Marks the control as `pristine`.
     *
     * If the control has any children, marks all children as `pristine`,
     * and recalculates the `pristine` status of all parent
     * controls.
     *
     * @see {@link markAsTouched()}
     * @see {@link markAsUntouched()}
     * @see {@link markAsDirty()}
     *
     * @param opts Configuration options that determine how the control emits events after
     * marking is applied.
     * * `onlySelf`: When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `events`
     * observable emits a `PristineChangeEvent` with the `pristine` property being `true`.
     * When false, no events are emitted.
     */
    markAsPristine(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     * @internal Used to propagate the source control downwards
     */
    markAsPristine(opts: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        sourceControl?: AbstractControl;
    }): void;
    /**
     * Marks the control as `pending`.
     *
     * A control is pending while the control performs async validation.
     *
     * @see {@link AbstractControl.status}
     *
     * @param opts Configuration options that determine how the control propagates changes and
     * emits events after marking is applied.
     * * `onlySelf`: When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `statusChanges`
     * observable emits an event with the latest status the control is marked pending
     * and the `events` observable emits a `StatusChangeEvent` with the `status` property being
     * `PENDING` When false, no events are emitted.
     *
     */
    markAsPending(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     * @internal Used to propagate the source control downwards
     */
    markAsPending(opts: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        sourceControl?: AbstractControl;
    }): void;
    /**
     * Disables the control. This means the control is exempt from validation checks and
     * excluded from the aggregate value of any parent. Its status is `DISABLED`.
     *
     * If the control has children, all children are also disabled.
     *
     * @see {@link AbstractControl.status}
     *
     * @param opts Configuration options that determine how the control propagates
     * changes and emits events after the control is disabled.
     * * `onlySelf`: When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `statusChanges`,
     * `valueChanges` and `events`
     * observables emit events with the latest status and value when the control is disabled.
     * When false, no events are emitted.
     */
    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     * @internal Used to propagate the source control downwards
     */
    disable(opts: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        sourceControl?: AbstractControl;
    }): void;
    /**
     * Enables the control. This means the control is included in validation checks and
     * the aggregate value of its parent. Its status recalculates based on its value and
     * its validators.
     *
     * By default, if the control has children, all children are enabled.
     *
     * @see {@link AbstractControl.status}
     *
     * @param opts Configure options that control how the control propagates changes and
     * emits events when marked as untouched
     * * `onlySelf`: When true, mark only this control. When false or not supplied,
     * marks all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `statusChanges`,
     * `valueChanges` and `events`
     * observables emit events with the latest status and value when the control is enabled.
     * When false, no events are emitted.
     */
    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    private _updateAncestors;
    /**
     * Sets the parent of the control
     *
     * @param parent The new parent.
     */
    setParent(parent: FormGroup | FormArray | null): void;
    /**
     * Sets the value of the control. Abstract method (implemented in sub-classes).
     */
    abstract setValue(value: TRawValue, options?: Object): void;
    /**
     * Patches the value of the control. Abstract method (implemented in sub-classes).
     */
    abstract patchValue(value: TValue, options?: Object): void;
    /**
     * Resets the control. Abstract method (implemented in sub-classes).
     */
    abstract reset(value?: TValueWithOptionalControlStates, options?: Object): void;
    /**
     * The raw value of this control. For most control implementations, the raw value will include
     * disabled children.
     */
    getRawValue(): any;
    /**
     * Recalculates the value and validation status of the control.
     *
     * By default, it also updates the value and validity of its ancestors.
     *
     * @param opts Configuration options determine how the control propagates changes and emits events
     * after updates and validity checks are applied.
     * * `onlySelf`: When true, only update this control. When false or not supplied,
     * update all direct ancestors. Default is false.
     * * `emitEvent`: When true or not supplied (the default), the `statusChanges`,
     * `valueChanges` and `events`
     * observables emit events with the latest status and value when the control is updated.
     * When false, no events are emitted.
     */
    updateValueAndValidity(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    /**
     * @internal Used to propagate the source control downwards
     */
    updateValueAndValidity(opts: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        sourceControl?: AbstractControl;
    }): void;
    /** @internal */
    _updateTreeValidity(opts?: {
        emitEvent?: boolean;
    }): void;
    private _setInitialStatus;
    private _runValidator;
    private _runAsyncValidator;
    private _cancelExistingSubscription;
    /**
     * Sets errors on a form control when running validations manually, rather than automatically.
     *
     * Calling `setErrors` also updates the validity of the parent control.
     *
     * Note: Manually set errors are always overwritten by the results of the next validation run.
     *
     * @param opts Configuration options that determine how the control propagates
     * changes and emits events after the control errors are set.
     * * `emitEvent`: When true or not supplied (the default), the `statusChanges`
     * observable emits an event after the errors are set.
     *
     * @usageNotes
     *
     * ### Manually set the errors for a control
     *
     * ```ts
     * const login = new FormControl('someLogin');
     * login.setErrors({
     *   notUnique: true
     * });
     *
     * expect(login.valid).toEqual(false);
     * expect(login.errors).toEqual({ notUnique: true });
     *
     * login.setValue('someOtherLogin');
     *
     * expect(login.valid).toEqual(true);
     * ```
     */
    setErrors(errors: ValidationErrors | null, opts?: {
        emitEvent?: boolean;
    }): void;
    /** @internal */
    setErrors(errors: ValidationErrors | null, opts?: {
        emitEvent?: boolean;
        shouldHaveEmitted?: boolean;
    }): void;
    /**
     * Retrieves a child control given the control's name or path.
     *
     * This signature for get supports strings and `const` arrays (`.get(['foo', 'bar'] as const)`).
     */
    get<P extends string | readonly (string | number)[]>(path: P): AbstractControl<ɵGetProperty<TRawValue, P>> | null;
    /**
     * Retrieves a child control given the control's name or path.
     *
     * This signature for `get` supports non-const (mutable) arrays. Inferred type
     * information will not be as robust, so prefer to pass a `readonly` array if possible.
     */
    get<P extends string | Array<string | number>>(path: P): AbstractControl<ɵGetProperty<TRawValue, P>> | null;
    /**
     * @description
     * Reports error data for the control with the given path.
     *
     * @param errorCode The code of the error to check
     * @param path A list of control names that designates how to move from the current control
     * to the control that should be queried for errors.
     *
     * @usageNotes
     * For example, for the following `FormGroup`:
     *
     * ```ts
     * form = new FormGroup({
     *   address: new FormGroup({ street: new FormControl() })
     * });
     * ```
     *
     * The path to the 'street' control from the root form would be 'address' -> 'street'.
     *
     * It can be provided to this method in one of two formats:
     *
     * 1. An array of string control names, e.g. `['address', 'street']`
     * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
     *
     * @returns error data for that particular error. If the control or error is not present,
     * null is returned.
     */
    getError(errorCode: string, path?: Array<string | number> | string): any;
    /**
     * @description
     * Reports whether the control with the given path has the error specified.
     *
     * @param errorCode The code of the error to check
     * @param path A list of control names that designates how to move from the current control
     * to the control that should be queried for errors.
     *
     * @usageNotes
     * For example, for the following `FormGroup`:
     *
     * ```ts
     * form = new FormGroup({
     *   address: new FormGroup({ street: new FormControl() })
     * });
     * ```
     *
     * The path to the 'street' control from the root form would be 'address' -> 'street'.
     *
     * It can be provided to this method in one of two formats:
     *
     * 1. An array of string control names, e.g. `['address', 'street']`
     * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
     *
     * If no path is given, this method checks for the error on the current control.
     *
     * @returns whether the given error is present in the control at the given path.
     *
     * If the control is not present, false is returned.
     */
    hasError(errorCode: string, path?: Array<string | number> | string): boolean;
    /**
     * Retrieves the top-level ancestor of this control.
     */
    get root(): AbstractControl;
    /** @internal */
    _updateControlsErrors(emitEvent: boolean, changedControl: AbstractControl, shouldHaveEmitted?: boolean): void;
    /** @internal */
    _initObservables(): void;
    private _calculateStatus;
    /** @internal */
    abstract _updateValue(): void;
    /** @internal */
    abstract _forEachChild(cb: (c: AbstractControl) => void): void;
    /** @internal */
    abstract _anyControls(condition: (c: AbstractControl) => boolean): boolean;
    /** @internal */
    abstract _allControlsDisabled(): boolean;
    /** @internal */
    abstract _syncPendingControls(): boolean;
    /** @internal */
    _anyControlsHaveStatus(status: FormControlStatus): boolean;
    /** @internal */
    _anyControlsDirty(): boolean;
    /** @internal */
    _anyControlsTouched(): boolean;
    /** @internal */
    _updatePristine(opts: {
        onlySelf?: boolean;
    }, changedControl: AbstractControl): void;
    /** @internal */
    _updateTouched(opts: {
        onlySelf?: boolean;
    } | undefined, changedControl: AbstractControl): void;
    /** @internal */
    _onDisabledChange: Array<(isDisabled: boolean) => void>;
    /** @internal */
    _registerOnCollectionChange(fn: () => void): void;
    /** @internal */
    _setUpdateStrategy(opts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): void;
    /**
     * Check to see if parent has been marked artificially dirty.
     *
     * @internal
     */
    private _parentMarkedDirty;
    /** @internal */
    _find(name: string | number): AbstractControl | null;
    /**
     * Internal implementation of the `setValidators` method. Needs to be separated out into a
     * different method, because it is called in the constructor and it can break cases where
     * a control is extended.
     */
    private _assignValidators;
    /**
     * Internal implementation of the `setAsyncValidators` method. Needs to be separated out into a
     * different method, because it is called in the constructor and it can break cases where
     * a control is extended.
     */
    private _assignAsyncValidators;
}
