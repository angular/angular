/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, ɵRuntimeError as RuntimeError} from '@angular/core';
import {never, Observable} from 'rxjs';

import {missingControlError, missingControlValueError, noControlsError} from './directives/reactive_errors';
import {removeListItem} from './directives/shared';
import {AsyncValidatorFn, ValidationErrors, ValidatorFn} from './directives/validators';
import {RuntimeErrorCode} from './errors';
import {addValidators, composeAsyncValidators, composeValidators, hasValidator, removeValidators, toObservable} from './validators';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;

/**
 * Reports that a FormControl is valid, meaning that no errors exist in the input value.
 *
 * @see `status`
 */
export const VALID = 'VALID';

/**
 * Reports that a FormControl is invalid, meaning that an error exists in the input value.
 *
 * @see `status`
 */
export const INVALID = 'INVALID';

/**
 * Reports that a FormControl is pending, meaning that that async validation is occurring and
 * errors are not yet available for the input value.
 *
 * @see `markAsPending`
 * @see `status`
 */
export const PENDING = 'PENDING';

/**
 * Reports that a FormControl is disabled, meaning that the control is exempt from ancestor
 * calculations of validity or value.
 *
 * @see `markAsDisabled`
 * @see `status`
 */
export const DISABLED = 'DISABLED';

/**
 * A form can have several different statuses. Each
 * possible status is returned as a string literal.
 *
 * * **VALID**: Reports that a FormControl is valid, meaning that no errors exist in the input
 * value.
 * * **INVALID**: Reports that a FormControl is invalid, meaning that an error exists in the input
 * value.
 * * **PENDING**: Reports that a FormControl is pending, meaning that that async validation is
 * occurring and errors are not yet available for the input value.
 * * **DISABLED**: Reports that a FormControl is
 * disabled, meaning that the control is exempt from ancestor calculations of validity or value.
 *
 * @publicApi
 */
export type FormControlStatus = 'VALID'|'INVALID'|'PENDING'|'DISABLED';

function _find(control: AbstractControl, path: Array<string|number>|string, delimiter: string) {
  if (path == null) return null;

  if (!Array.isArray(path)) {
    path = path.split(delimiter);
  }
  if (Array.isArray(path) && path.length === 0) return null;

  // Not using Array.reduce here due to a Chrome 80 bug
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
  let controlToFind: AbstractControl|null = control;
  path.forEach((name: string|number) => {
    if (isFormGroup(controlToFind)) {
      controlToFind = controlToFind.controls.hasOwnProperty(name as string) ?
          controlToFind.controls[name] :
          null;
    } else if (isFormArray(controlToFind)) {
      controlToFind = controlToFind.at(<number>name) || null;
    } else {
      controlToFind = null;
    }
  });
  return controlToFind;
}

/**
 * Gets validators from either an options object or given validators.
 */
function pickValidators(validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|
                        null): ValidatorFn|ValidatorFn[]|null {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.validators : validatorOrOpts) || null;
}

/**
 * Creates validator function by combining provided validators.
 */
function coerceToValidator(validator: ValidatorFn|ValidatorFn[]|null): ValidatorFn|null {
  return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}

/**
 * Gets async validators from either an options object or given validators.
 */
function pickAsyncValidators(
    asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null,
    validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null): AsyncValidatorFn|
    AsyncValidatorFn[]|null {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.asyncValidators : asyncValidator) || null;
}

/**
 * Creates async validator function by combining provided async validators.
 */
function coerceToAsyncValidator(asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|
                                null): AsyncValidatorFn|null {
  return Array.isArray(asyncValidator) ? composeAsyncValidators(asyncValidator) :
                                         asyncValidator || null;
}

export type FormHooks = 'change'|'blur'|'submit';

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
  validators?: ValidatorFn|ValidatorFn[]|null;
  /**
   * @description
   * The list of async validators applied to control.
   */
  asyncValidators?: AsyncValidatorFn|AsyncValidatorFn[]|null;
  /**
   * @description
   * The event name for control to update upon.
   */
  updateOn?: 'change'|'blur'|'submit';
}

/**
 * Interface for options provided to a `FormControl`.
 *
 * This interface extends all options from {@link AbstractControlOptions}, plus some options
 * unique to `FormControl`.
 *
 * @publicApi
 */
export interface FormControlOptions extends AbstractControlOptions {
  /**
   * @description
   * Whether to use the initial value used to construct the `FormControl` as its default value
   * as well. If this option is false or not provided, the default value of a FormControl is `null`.
   * When a FormControl is reset without an explicit value, its value reverts to
   * its default value.
   */
  initialValueIsDefault?: boolean;
}

function isOptionsObj(validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|
                      null): validatorOrOpts is AbstractControlOptions {
  return validatorOrOpts != null && !Array.isArray(validatorOrOpts) &&
      typeof validatorOrOpts === 'object';
}

export const isFormControl = (control: unknown): control is FormControl =>
    control instanceof FormControl;

export const isFormGroup = (control: unknown): control is FormGroup => control instanceof FormGroup;

export const isFormArray = (control: unknown): control is FormArray => control instanceof FormArray;

function getRawValue(control: AbstractControl): any {
  return isFormControl(control) ? control.value : (control as FormGroup | FormArray).getRawValue();
}

function assertControlPresent(parent: FormGroup<any>|FormArray<any>, key: string|number): void {
  const isGroup = isFormGroup(parent);
  const controls = parent.controls as {[key: string|number]: unknown};
  const collection = isGroup ? Object.keys(controls) : controls;
  if (!collection.length) {
    throw new RuntimeError(
        RuntimeErrorCode.NO_CONTROLS, NG_DEV_MODE ? noControlsError(isGroup) : '');
  }
  if (!controls[key]) {
    throw new RuntimeError(
        RuntimeErrorCode.MISSING_CONTROL, NG_DEV_MODE ? missingControlError(isGroup, key) : '');
  }
}

function assertAllValuesPresent(control: FormGroup<any>|FormArray<any>, value: any): void {
  const isGroup = isFormGroup(control);
  control._forEachChild((_: unknown, key: string|number) => {
    if (value[key] === undefined) {
      throw new RuntimeError(
          RuntimeErrorCode.MISSING_CONTROL_VALUE,
          NG_DEV_MODE ? missingControlValueError(isGroup, key) : '');
    }
  });
}

/**
 * `TypedOrUntyped` allows one of two different types to be selected, depending on whether the Forms
 * class it's applied to is typed or not.
 *
 * This is for internal Angular usage to support typed forms; do not directly use it.
 *
 * @publicApi
 */
export type TypedOrUntyped<T, Typed, Untyped> = T extends never ? Untyped : Typed;

/**
 * Value gives the type of `.value` in an `AbstractControl`.
 *
 * @publicApi
 */
export type Value<T extends AbstractControl|undefined> =
    T extends AbstractControl<any, any>? T['value'] : never;

/**
 * Value gives the type of `.getRawValue()` in an `AbstractControl`.
 *
 * @publicApi
 */
export type RawValue<T extends AbstractControl|undefined> = T extends AbstractControl<any, any>?
    (T['setValue'] extends((v: infer R) => void) ? R : never) :
    never;

// clang-format off

/**
 * Tokenize splits a string literal S by a delimeter D.
 */
type Tokenize<S extends string, D extends string> =
    string extends S ? string[] : /* S must be a literal */
                       S extends `${infer T}${D}${infer U}` ? [T, ...Tokenize<U, D>] :
                      [S] /* Base case */
    ;

/**
 * CoerceStrArrToNumArr accepts an array of strings, and converts any numeric string to a number.
 */
type CoerceStrArrToNumArr<S> =                                           
    S extends [infer Head, ...infer Tail] ?                              
    Head extends `${number}` ? [number, ...CoerceStrArrToNumArr<Tail>] :
                               [Head, ...CoerceStrArrToNumArr<Tail>] :
    []                                                                   
    ;

/**
 * Navigate takes a type T and an array K, and returns the type of T[K[0]][K[1]][K[2]]...
 */
type Navigate<T, K extends(Array<string|number>)> = 
    T extends object ? /* T must be indexable (object or array) */
    (K extends [infer Head, ...infer Tail] ? /* Split K into head and tail */
         (Head extends keyof T ? /* head(K) must index T */
              (Tail extends(string|number)[] ? /* tail(K) must be an array */
               [] extends Tail ? T[Head] : /* base case: K can be split, but Tail is empty */
                   (Navigate<T[Head], Tail>) /* explore T[head(K)] by tail(K) */ :
               any) /* tail(K) was not an array, give up */ :
              any) /* head(K) does not index T, give up */ :
         any) /* K cannot be split, give up */ :
    any /* T is not indexable, give up */
    ;

// clang-format on

/**
 * Writeable removes readonly from all keys.
 */
type Writeable<T> = {
  -readonly[P in keyof T]: T[P]
};

/**
 * GetProperty takes a type T and an some property names or indices K.
 * If K is a dot-separated string, it is tokenized into an array before proceeding.
 * Then, the type of the nested property at K is computed: T[K[0]][K[1]][K[2]]...
 * This works with both objects, which are indexed by property name, and arrays, which are indexed
 * numerically.
 *
 * @publicApi
 */
export type Get<T, K> =                                                   /*\n*/
    K extends string ? Get<T, CoerceStrArrToNumArr<Tokenize<K, '.'>>>:    /*\n*/
                       Writeable<K> extends Array<string|number>? Navigate<T, Writeable<K>>: /*\n*/
                                               any                                                                   /*\n*/
    ;

/**
 * This is the base class for `FormControl`, `FormGroup`, and `FormArray`.
 *
 * It provides some of the shared behavior that all controls and groups of controls have, like
 * running validators, calculating status, and resetting state. It also defines the properties
 * that are shared between all sub-classes, like `value`, `valid`, and `dirty`. It shouldn't be
 * instantiated directly.
 *
 * The first type parameter ValueT represents the value type of the control (`control.value`).
 * The optional type parameter RawValueT  represents the raw value type (`control.getRawValue()`).
 *
 * @see [Forms Guide](/guide/forms)
 * @see [Reactive Forms Guide](/guide/reactive-forms)
 * @see [Dynamic Forms Guide](/guide/dynamic-form)
 *
 * @publicApi
 */
export abstract class AbstractControl<ValueT = any, RawValueT extends ValueT = ValueT> {
  /** @internal */
  _pendingDirty = false;

  /**
   * Indicates that a control has its own pending asynchronous validation in progress.
   *
   * @internal
   */
  _hasOwnPendingAsyncValidator = false;

  /** @internal */
  _pendingTouched = false;

  /** @internal */
  _onCollectionChange = () => {};

  /** @internal */
  _updateOn?: FormHooks;

  private _parent: FormGroup|FormArray|null = null;
  private _asyncValidationSubscription: any;

  /**
   * Contains the result of merging synchronous validators into a single validator function
   * (combined using `Validators.compose`).
   *
   * @internal
   */
  private _composedValidatorFn: ValidatorFn|null;

  /**
   * Contains the result of merging asynchronous validators into a single validator function
   * (combined using `Validators.composeAsync`).
   *
   * @internal
   */
  private _composedAsyncValidatorFn: AsyncValidatorFn|null;

  /**
   * Synchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setValidators` function
   *  - while calling the setter on the `validator` field (e.g. `control.validator = validatorFn`)
   *
   * @internal
   */
  private _rawValidators: ValidatorFn|ValidatorFn[]|null;

  /**
   * Asynchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setAsyncValidators` function
   *  - while calling the setter on the `asyncValidator` field (e.g. `control.asyncValidator =
   * asyncValidatorFn`)
   *
   * @internal
   */
  private _rawAsyncValidators: AsyncValidatorFn|AsyncValidatorFn[]|null;

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
  public readonly value!: ValueT;

  /**
   * Initialize the AbstractControl instance.
   *
   * @param validators The function or array of functions that is used to determine the validity of
   *     this control synchronously.
   * @param asyncValidators The function or array of functions that is used to determine validity of
   *     this control asynchronously.
   */
  constructor(
      validators: ValidatorFn|ValidatorFn[]|null,
      asyncValidators: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    this._rawValidators = validators;
    this._rawAsyncValidators = asyncValidators;
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
    this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
  }

  /**
   * Returns the function that is used to determine the validity of this control synchronously.
   * If multiple validators have been added, this will be a single composed function.
   * See `Validators.compose()` for additional information.
   */
  get validator(): ValidatorFn|null {
    return this._composedValidatorFn;
  }
  set validator(validatorFn: ValidatorFn|null) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }

  /**
   * Returns the function that is used to determine the validity of this control asynchronously.
   * If multiple validators have been added, this will be a single composed function.
   * See `Validators.compose()` for additional information.
   */
  get asyncValidator(): AsyncValidatorFn|null {
    return this._composedAsyncValidatorFn;
  }
  set asyncValidator(asyncValidatorFn: AsyncValidatorFn|null) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
  }

  /**
   * The parent control.
   */
  get parent(): FormGroup|FormArray|null {
    return this._parent;
  }

  /**
   * The validation status of the control.
   *
   * @see `FormControlStatus`
   *
   * These status values are mutually exclusive, so a control cannot be
   * both valid AND invalid or invalid AND disabled.
   */
  public readonly status!: FormControlStatus;

  /**
   * A control is `valid` when its `status` is `VALID`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if the control has passed all of its validation tests,
   * false otherwise.
   */
  get valid(): boolean {
    return this.status === VALID;
  }

  /**
   * A control is `invalid` when its `status` is `INVALID`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if this control has failed one or more of its validation checks,
   * false otherwise.
   */
  get invalid(): boolean {
    return this.status === INVALID;
  }

  /**
   * A control is `pending` when its `status` is `PENDING`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if this control is in the process of conducting a validation check,
   * false otherwise.
   */
  get pending(): boolean {
    return this.status == PENDING;
  }

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
  get disabled(): boolean {
    return this.status === DISABLED;
  }

  /**
   * A control is `enabled` as long as its `status` is not `DISABLED`.
   *
   * @returns True if the control has any status other than 'DISABLED',
   * false if the status is 'DISABLED'.
   *
   * @see {@link AbstractControl.status}
   *
   */
  get enabled(): boolean {
    return this.status !== DISABLED;
  }

  /**
   * An object containing any errors generated by failing validation,
   * or null if there are no errors.
   */
  public readonly errors!: ValidationErrors|null;

  /**
   * A control is `pristine` if the user has not yet changed
   * the value in the UI.
   *
   * @returns True if the user has not yet changed the value in the UI; compare `dirty`.
   * Programmatic changes to a control's value do not mark it dirty.
   */
  public readonly pristine: boolean = true;

  /**
   * A control is `dirty` if the user has changed the value
   * in the UI.
   *
   * @returns True if the user has changed the value of this control in the UI; compare `pristine`.
   * Programmatic changes to a control's value do not mark it dirty.
   */
  get dirty(): boolean {
    return !this.pristine;
  }

  /**
   * True if the control is marked as `touched`.
   *
   * A control is marked `touched` once the user has triggered
   * a `blur` event on it.
   */
  public readonly touched: boolean = false;

  /**
   * True if the control has not been marked as touched
   *
   * A control is `untouched` if the user has not yet triggered
   * a `blur` event on it.
   */
  get untouched(): boolean {
    return !this.touched;
  }

  /**
   * A multicasting observable that emits an event every time the value of the control changes, in
   * the UI or programmatically. It also emits an event each time you call enable() or disable()
   * without passing along {emitEvent: false} as a function argument.
   */
  public readonly valueChanges!: Observable<ValueT>;

  /**
   * A multicasting observable that emits an event every time the validation `status` of the control
   * recalculates.
   *
   * @see `FormControlStatus`
   * @see {@link AbstractControl.status}
   *
   */
  public readonly statusChanges!: Observable<FormControlStatus>;

  /**
   * Reports the update strategy of the `AbstractControl` (meaning
   * the event on which the control updates itself).
   * Possible values: `'change'` | `'blur'` | `'submit'`
   * Default value: `'change'`
   */
  get updateOn(): FormHooks {
    return this._updateOn ? this._updateOn : (this.parent ? this.parent.updateOn : 'change');
  }

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
  setValidators(validators: ValidatorFn|ValidatorFn[]|null): void {
    this._rawValidators = validators;
    this._composedValidatorFn = coerceToValidator(validators);
  }

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
  setAsyncValidators(validators: AsyncValidatorFn|AsyncValidatorFn[]|null): void {
    this._rawAsyncValidators = validators;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(validators);
  }

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
  addValidators(validators: ValidatorFn|ValidatorFn[]): void {
    this.setValidators(addValidators(validators, this._rawValidators));
  }

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
  addAsyncValidators(validators: AsyncValidatorFn|AsyncValidatorFn[]): void {
    this.setAsyncValidators(addValidators(validators, this._rawAsyncValidators));
  }

  /**
   * Remove a synchronous validator from this control, without affecting other validators.
   * Validators are compared by function reference; you must pass a reference to the exact same
   * validator function as the one that was originally set. If a provided validator is not found,
   * it is ignored.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * @param validators The validator or validators to remove.
   */
  removeValidators(validators: ValidatorFn|ValidatorFn[]): void {
    this.setValidators(removeValidators(validators, this._rawValidators));
  }

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
  removeAsyncValidators(validators: AsyncValidatorFn|AsyncValidatorFn[]): void {
    this.setAsyncValidators(removeValidators(validators, this._rawAsyncValidators));
  }

  /**
   * Check whether a synchronous validator function is present on this control. The provided
   * validator must be a reference to the exact same function that was provided.
   *
   * @param validator The validator to check for presence. Compared by function reference.
   * @returns Whether the provided validator was found on this control.
   */
  hasValidator(validator: ValidatorFn): boolean {
    return hasValidator(this._rawValidators, validator);
  }

  /**
   * Check whether an asynchronous validator function is present on this control. The provided
   * validator must be a reference to the exact same function that was provided.
   *
   * @param validator The asynchronous validator to check for presence. Compared by function
   *     reference.
   * @returns Whether the provided asynchronous validator was found on this control.
   */
  hasAsyncValidator(validator: AsyncValidatorFn): boolean {
    return hasValidator(this._rawAsyncValidators, validator);
  }

  /**
   * Empties out the synchronous validator list.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   */
  clearValidators(): void {
    this.validator = null;
  }

  /**
   * Empties out the async validator list.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   */
  clearAsyncValidators(): void {
    this.asyncValidator = null;
  }

  /**
   * Marks the control as `touched`. A control is touched by focus and
   * blur events that do not change the value.
   *
   * @see `markAsUntouched()`
   * @see `markAsDirty()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsTouched(opts: {onlySelf?: boolean} = {}): void {
    (this as {touched: boolean}).touched = true;

    if (this._parent && !opts.onlySelf) {
      this._parent.markAsTouched(opts);
    }
  }

  /**
   * Marks the control and all its descendant controls as `touched`.
   * @see `markAsTouched()`
   */
  markAllAsTouched(): void {
    this.markAsTouched({onlySelf: true});

    this._forEachChild((control: AbstractControl) => control.markAllAsTouched());
  }

  /**
   * Marks the control as `untouched`.
   *
   * If the control has any children, also marks all children as `untouched`
   * and recalculates the `touched` status of all parent controls.
   *
   * @see `markAsTouched()`
   * @see `markAsDirty()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after the marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsUntouched(opts: {onlySelf?: boolean} = {}): void {
    (this as {touched: boolean}).touched = false;
    this._pendingTouched = false;

    this._forEachChild((control: AbstractControl) => {
      control.markAsUntouched({onlySelf: true});
    });

    if (this._parent && !opts.onlySelf) {
      this._parent._updateTouched(opts);
    }
  }

  /**
   * Marks the control as `dirty`. A control becomes dirty when
   * the control's value is changed through the UI; compare `markAsTouched`.
   *
   * @see `markAsTouched()`
   * @see `markAsUntouched()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsDirty(opts: {onlySelf?: boolean} = {}): void {
    (this as {pristine: boolean}).pristine = false;

    if (this._parent && !opts.onlySelf) {
      this._parent.markAsDirty(opts);
    }
  }

  /**
   * Marks the control as `pristine`.
   *
   * If the control has any children, marks all children as `pristine`,
   * and recalculates the `pristine` status of all parent
   * controls.
   *
   * @see `markAsTouched()`
   * @see `markAsUntouched()`
   * @see `markAsDirty()`
   *
   * @param opts Configuration options that determine how the control emits events after
   * marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsPristine(opts: {onlySelf?: boolean} = {}): void {
    (this as {pristine: boolean}).pristine = true;
    this._pendingDirty = false;

    this._forEachChild((control: AbstractControl) => {
      control.markAsPristine({onlySelf: true});
    });

    if (this._parent && !opts.onlySelf) {
      this._parent._updatePristine(opts);
    }
  }

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
   * observable emits an event with the latest status the control is marked pending.
   * When false, no events are emitted.
   *
   */
  markAsPending(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    (this as {status: FormControlStatus}).status = PENDING;

    if (opts.emitEvent !== false) {
      (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
    }

    if (this._parent && !opts.onlySelf) {
      this._parent.markAsPending(opts);
    }
  }

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
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is disabled.
   * When false, no events are emitted.
   */
  disable(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    // If parent has been marked artificially dirty we don't want to re-calculate the
    // parent's dirtiness based on the children.
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

    (this as {status: FormControlStatus}).status = DISABLED;
    (this as {errors: ValidationErrors | null}).errors = null;
    this._forEachChild((control: AbstractControl) => {
      control.disable({...opts, onlySelf: true});
    });
    this._updateValue();

    if (opts.emitEvent !== false) {
      (this.valueChanges as EventEmitter<ValueT>).emit(this.value);
      (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
    }

    this._updateAncestors({...opts, skipPristineCheck});
    this._onDisabledChange.forEach((changeFn) => changeFn(true));
  }

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
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is enabled.
   * When false, no events are emitted.
   */
  enable(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    // If parent has been marked artificially dirty we don't want to re-calculate the
    // parent's dirtiness based on the children.
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

    (this as {status: FormControlStatus}).status = VALID;
    this._forEachChild((control: AbstractControl) => {
      control.enable({...opts, onlySelf: true});
    });
    this.updateValueAndValidity({onlySelf: true, emitEvent: opts.emitEvent});

    this._updateAncestors({...opts, skipPristineCheck});
    this._onDisabledChange.forEach((changeFn) => changeFn(false));
  }

  private _updateAncestors(
      opts: {onlySelf?: boolean, emitEvent?: boolean, skipPristineCheck?: boolean}): void {
    if (this._parent && !opts.onlySelf) {
      this._parent.updateValueAndValidity(opts);
      if (!opts.skipPristineCheck) {
        this._parent._updatePristine();
      }
      this._parent._updateTouched();
    }
  }

  /**
   * Sets the parent of the control
   *
   * @param parent The new parent.
   */
  setParent(parent: FormGroup|FormArray|null): void {
    this._parent = parent;
  }

  /**
   * Sets the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract setValue(value: RawValueT, options?: Object): void;

  /**
   * Patches the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract patchValue(value: ValueT, options?: Object): void;

  /**
   * Resets the control. Abstract method (implemented in sub-classes).
   */
  abstract reset(value?: ValueT, options?: Object): void;

  /**
   * Recalculates the value and validation status of the control.
   *
   * By default, it also updates the value and validity of its ancestors.
   *
   * @param opts Configuration options determine how the control propagates changes and emits events
   * after updates and validity checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is updated.
   * When false, no events are emitted.
   */
  updateValueAndValidity(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    this._setInitialStatus();
    this._updateValue();

    if (this.enabled) {
      this._cancelExistingSubscription();
      (this as {errors: ValidationErrors | null}).errors = this._runValidator();
      (this as {status: FormControlStatus}).status = this._calculateStatus();

      if (this.status === VALID || this.status === PENDING) {
        this._runAsyncValidator(opts.emitEvent);
      }
    }

    if (opts.emitEvent !== false) {
      (this.valueChanges as EventEmitter<ValueT>).emit(this.value);
      (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
    }

    if (this._parent && !opts.onlySelf) {
      this._parent.updateValueAndValidity(opts);
    }
  }

  /** @internal */
  _updateTreeValidity(opts: {emitEvent?: boolean} = {emitEvent: true}): void {
    this._forEachChild((ctrl: AbstractControl) => ctrl._updateTreeValidity(opts));
    this.updateValueAndValidity({onlySelf: true, emitEvent: opts.emitEvent});
  }

  private _setInitialStatus() {
    (this as {status: FormControlStatus}).status = this._allControlsDisabled() ? DISABLED : VALID;
  }

  private _runValidator(): ValidationErrors|null {
    return this.validator ? this.validator(this) : null;
  }

  private _runAsyncValidator(emitEvent?: boolean): void {
    if (this.asyncValidator) {
      (this as {status: FormControlStatus}).status = PENDING;
      this._hasOwnPendingAsyncValidator = true;
      const obs = toObservable(this.asyncValidator(this));
      this._asyncValidationSubscription = obs.subscribe((errors: ValidationErrors|null) => {
        this._hasOwnPendingAsyncValidator = false;
        // This will trigger the recalculation of the validation status, which depends on
        // the state of the asynchronous validation (whether it is in progress or not). So, it is
        // necessary that we have updated the `_hasOwnPendingAsyncValidator` boolean flag first.
        this.setErrors(errors, {emitEvent});
      });
    }
  }

  private _cancelExistingSubscription(): void {
    if (this._asyncValidationSubscription) {
      this._asyncValidationSubscription.unsubscribe();
      this._hasOwnPendingAsyncValidator = false;
    }
  }

  /**
   * Sets errors on a form control when running validations manually, rather than automatically.
   *
   * Calling `setErrors` also updates the validity of the parent control.
   *
   * @usageNotes
   *
   * ### Manually set the errors for a control
   *
   * ```
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
  setErrors(errors: ValidationErrors|null, opts: {emitEvent?: boolean} = {}): void {
    (this as {errors: ValidationErrors | null}).errors = errors;
    this._updateControlsErrors(opts.emitEvent !== false);
  }

  /**
   * Retrieves a child control given the control's name or path.
   *
   * This signature for get supports strings and `const` arrays (`.get(['foo', 'bar'] as const)`).
   */
  get<P extends string|(readonly(string|number)[])>(path: P):
      AbstractControl<Get<RawValueT, P>>|null;

  /**
   * Retrieves a child control given the control's name or path.
   *
   * This signature for `get` supports non-const (mutable) arrays. Inferred type
   * information will not be as robust, so prefer to pass a `readonly` array if possible.
   */
  get<P extends string|Array<string|number>>(path: P): AbstractControl<Get<RawValueT, P>>|null;

  /**
   * Retrieves a child control given the control's name or path.
   *
   * @param path A dot-delimited string or array of string/number values that define the path to the
   * control. If a string is provided, passing it as a string literal will result in improved type
   * information. Likewise, if an array is provided, passing it `as const` will cause improved type
   * information to be available.
   *
   * @usageNotes
   * ### Retrieve a nested control
   *
   * For example, to get a `name` control nested within a `person` sub-group:
   *
   * * `this.form.get('person.name');`
   *
   * -OR-
   *
   * * `this.form.get(['person', 'name'] as const);` // `as const` gives improved typings
   *
   * ### Retrieve a control in a FormArray
   *
   * When accessing an element inside a FormArray, you can use an element index.
   * For example, to get a `price` control from the first element in an `items` array you can use:
   *
   * * `this.form.get('items.0.price');`
   *
   * -OR-
   *
   * * `this.form.get(['items', 0, 'price']);`
   */
  get<P extends string|((string | number)[])>(path: P): AbstractControl<Get<RawValueT, P>>|null {
    return _find(this, path, '.');
  }

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
   * ```
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
  getError(errorCode: string, path?: Array<string|number>|string): any {
    const control = path ? this.get(path) : this;
    return control && control.errors ? control.errors[errorCode] : null;
  }

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
   * ```
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
  hasError(errorCode: string, path?: Array<string|number>|string): boolean {
    return !!this.getError(errorCode, path);
  }

  /**
   * Retrieves the top-level ancestor of this control.
   */
  get root(): AbstractControl {
    let x: AbstractControl = this;

    while (x._parent) {
      x = x._parent;
    }

    return x;
  }

  /** @internal */
  _updateControlsErrors(emitEvent: boolean): void {
    (this as {status: FormControlStatus}).status = this._calculateStatus();

    if (emitEvent) {
      (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
    }

    if (this._parent) {
      this._parent._updateControlsErrors(emitEvent);
    }
  }

  /** @internal */
  _initObservables() {
    (this as {valueChanges: Observable<ValueT>}).valueChanges = new EventEmitter();
    (this as {statusChanges: Observable<FormControlStatus>}).statusChanges = new EventEmitter();
  }


  private _calculateStatus(): FormControlStatus {
    if (this._allControlsDisabled()) return DISABLED;
    if (this.errors) return INVALID;
    if (this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(PENDING)) return PENDING;
    if (this._anyControlsHaveStatus(INVALID)) return INVALID;
    return VALID;
  }

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
  _anyControlsHaveStatus(status: FormControlStatus): boolean {
    return this._anyControls((control: AbstractControl) => control.status === status);
  }

  /** @internal */
  _anyControlsDirty(): boolean {
    return this._anyControls((control: AbstractControl) => control.dirty);
  }

  /** @internal */
  _anyControlsTouched(): boolean {
    return this._anyControls((control: AbstractControl) => control.touched);
  }

  /** @internal */
  _updatePristine(opts: {onlySelf?: boolean} = {}): void {
    (this as {pristine: boolean}).pristine = !this._anyControlsDirty();

    if (this._parent && !opts.onlySelf) {
      this._parent._updatePristine(opts);
    }
  }

  /** @internal */
  _updateTouched(opts: {onlySelf?: boolean} = {}): void {
    (this as {touched: boolean}).touched = this._anyControlsTouched();

    if (this._parent && !opts.onlySelf) {
      this._parent._updateTouched(opts);
    }
  }

  /** @internal */
  _onDisabledChange: Array<(isDisabled: boolean) => void> = [];

  /** @internal */
  _registerOnCollectionChange(fn: () => void): void {
    this._onCollectionChange = fn;
  }

  /** @internal */
  _setUpdateStrategy(opts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null): void {
    if (isOptionsObj(opts) && opts.updateOn != null) {
      this._updateOn = opts.updateOn!;
    }
  }
  /**
   * Check to see if parent has been marked artificially dirty.
   *
   * @internal
   */
  private _parentMarkedDirty(onlySelf?: boolean): boolean {
    const parentDirty = this._parent && this._parent.dirty;
    return !onlySelf && !!parentDirty && !this._parent!._anyControlsDirty();
  }
}

/**
 * FormState is a boxed form value. It is an object with a `value` key and a `disabled` key.
 */
export interface FormState<T> {
  value: T;
  disabled: boolean;
}

/**
 * Tracks the value and validation status of an individual form control.
 *
 * This is one of the three fundamental building blocks of Angular forms, along with
 * `FormGroup` and `FormArray`. It extends the `AbstractControl` class that
 * implements most of the base functionality for accessing the value, validation status,
 * user interactions and events. See [usage examples below](#usage-notes).
 *
 * @see `AbstractControl`
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see [Usage Notes](#usage-notes)
 *
 * @publicApi
 *
 * @overriddenImplementation ɵFormControlCtor
 *
 * @usageNotes
 *
 * ### Initializing Form Controls
 *
 * Instantiate a `FormControl`, with an initial value.
 *
 * ```ts
 * const control = new FormControl('some value');
 * console.log(control.value);     // 'some value'
 * ```
 *
 * The following example initializes the control with a form state object. The `value`
 * and `disabled` keys are required in this case.
 *
 * ```ts
 * const control = new FormControl({ value: 'n/a', disabled: true });
 * console.log(control.value);     // 'n/a'
 * console.log(control.status);    // 'DISABLED'
 * ```
 *
 * The following example initializes the control with a synchronous validator.
 *
 * ```ts
 * const control = new FormControl('', Validators.required);
 * console.log(control.value);      // ''
 * console.log(control.status);     // 'INVALID'
 * ```
 *
 * The following example initializes the control using an options object.
 *
 * ```ts
 * const control = new FormControl('', {
 *    validators: Validators.required,
 *    asyncValidators: myAsyncValidator
 * });
 * ```
 *
 * ### Configure the control to update on a blur event
 *
 * Set the `updateOn` option to `'blur'` to update on the blur `event`.
 *
 * ```ts
 * const control = new FormControl('', { updateOn: 'blur' });
 * ```
 *
 * ### Configure the control to update on a submit event
 *
 * Set the `updateOn` option to `'submit'` to update on a submit `event`.
 *
 * ```ts
 * const control = new FormControl('', { updateOn: 'submit' });
 * ```
 *
 * ### Reset the control back to an initial value
 *
 * You reset to a specific form state by passing through a standalone
 * value or a form state object that contains both a value and a disabled state
 * (these are the only two properties that cannot be calculated).
 *
 * ```ts
 * const control = new FormControl('Nancy');
 *
 * console.log(control.value); // 'Nancy'
 *
 * control.reset('Drew');
 *
 * console.log(control.value); // 'Drew'
 * ```
 *
 * ### Reset the control back to an initial value and disabled
 *
 * ```
 * const control = new FormControl('Nancy');
 *
 * console.log(control.value); // 'Nancy'
 * console.log(control.status); // 'VALID'
 *
 * control.reset({ value: 'Drew', disabled: true });
 *
 * console.log(control.value); // 'Drew'
 * console.log(control.status); // 'DISABLED'
 * ```
 */
export interface FormControl<ValueT = any> extends AbstractControl<ValueT> {
  /**
   * The default value of this FormControl, used whenever the control is reset without an explicit
   * value. See {@link FormControlOptions#initialValueIsDefault} for more information on configuring
   * a default value.
   */
  readonly defaultValue: ValueT;

  /** @internal */
  _onChange: Function[];

  /**
   * This field holds a pending value that has not yet been applied to the form's value.
   * It is `any` because the value is untyped.
   * @internal
   */
  _pendingValue: ValueT;

  /** @internal */
  _pendingChange: boolean;

  /**
   * Sets a new value for the form control.
   *
   * @param value The new value for the control.
   * @param options Configuration options that determine how the control propagates changes
   * and emits events when the value changes.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   * * `emitModelToViewChange`: When true or not supplied  (the default), each change triggers an
   * `onChange` event to
   * update the view.
   * * `emitViewToModelChange`: When true or not supplied (the default), each change triggers an
   * `ngModelChange`
   * event to update the model.
   *
   */
  setValue(value: ValueT, options?: {
    onlySelf?: boolean,
    emitEvent?: boolean,
    emitModelToViewChange?: boolean,
    emitViewToModelChange?: boolean
  }): void;

  /**
   * Patches the value of a control.
   *
   * This function is functionally the same as {@link FormControl#setValue setValue} at this level.
   * It exists for symmetry with {@link FormGroup#patchValue patchValue} on `FormGroups` and
   * `FormArrays`, where it does behave differently.
   *
   * @see `setValue` for options
   */
  patchValue(value: ValueT, options?: {
    onlySelf?: boolean,
    emitEvent?: boolean,
    emitModelToViewChange?: boolean,
    emitViewToModelChange?: boolean
  }): void;

  /**
   * Resets the form control, marking it `pristine` and `untouched`, and resetting
   * the value. The new value will be the provided value (if passed), `null`, or the initial value
   * if `initialValueIsDefault` was set in the constructor via {@link FormControlOptions}.
   *
   * ```ts
   * // By default, the control will reset to null.
   * const dog = new FormControl('spot');
   * dog.reset(); // dog.value is null
   *
   * // If this flag is set, the control will instead reset to the initial value.
   * const cat = new FormControl('tabby', {initialValueIsDefault: true});
   * cat.reset(); // cat.value is "tabby"
   *
   * // A value passed to reset always takes precedence.
   * const fish = new FormControl('finn', {initialValueIsDefault: true});
   * fish.reset('bubble'); // fish.value is "bubble"
   * ```
   *
   * @param formState Resets the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param options Configuration options that determine how the control propagates changes
   * and emits events after the value changes.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   *
   */
  reset(formState?: ValueT|FormState<ValueT>, options?: {onlySelf?: boolean, emitEvent?: boolean}):
      void;

  /**
   * For a simple FormControl, the raw value is equivalent to the value.
   */
  getRawValue(): ValueT;

  /**
   * @internal
   */
  _updateValue(): void;

  /**
   * @internal
   */
  _anyControls(condition: (c: AbstractControl) => boolean): boolean;

  /**
   * @internal
   */
  _allControlsDisabled(): boolean;


  /**
   * Register a listener for change events.
   *
   * @param fn The method that is called when the value changes
   */
  registerOnChange(fn: Function): void;


  /**
   * Internal function to unregister a change events listener.
   * @internal
   */
  _unregisterOnChange(fn: (value?: any, emitModelEvent?: boolean) => void): void;

  /**
   * Register a listener for disabled events.
   *
   * @param fn The method that is called when the disabled status changes.
   */
  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void;

  /**
   * Internal function to unregister a disabled event listener.
   * @internal
   */
  _unregisterOnDisabledChange(fn: (isDisabled: boolean) => void): void;

  /**
   * @internal
   */
  _forEachChild(cb: (c: AbstractControl) => void): void;

  /** @internal */
  _syncPendingControls(): boolean;
}

type FormControlInterface<ValueT = any> = FormControl<ValueT>;

/**
 * Various available constructors for `FormControl`.
 * Do not use this interface directly. Instead, use `FormControl`:
 * ```
 * const fc = new FormControl('foo');
 * ```
 * This symbol is prefixed with ɵ to make plain that it is an internal symbol.
 */
export interface ɵFormControlCtor {
  /**
   * Construct a FormControl with no initial value or validators.
   */
  new(): FormControl;

  /**
   * Creates a new `FormControl` instance.
   *
   * @param formState Initializes the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or a `FormControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   */
  new<T = any>(value: FormState<T>|T, opts: FormControlOptions&{initialValueIsDefault: true}):
      FormControl<T>;
  new<T = any>(
      value: FormState<T>|T, validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormControl<T|null>;

  /**
   * The presence of an explicit `prototype` property provides backwards-compatibility for apps that
   * manually inspect the prototype chain.
   */
  prototype: FormControl;
}

function isFormState<T>(formState: unknown): formState is FormState<T> {
  return typeof formState === 'object' && formState !== null &&
      Object.keys(formState).length === 2 && 'value' in formState && 'disabled' in formState;
}

export const FormControl: ɵFormControlCtor =
    (class FormControl<ValueT = any> extends AbstractControl<
         ValueT> implements FormControlInterface<ValueT> {
      /** @publicApi */
      public readonly defaultValue: ValueT = null as unknown as ValueT;

      /** @internal */
      _onChange: Array<Function> = [];

      /** @internal */
      _pendingValue!: ValueT;

      /** @internal */
      _pendingChange: boolean = false;

      constructor(
          // formState and defaultValue will only be null if T is nullable
          formState: FormState<ValueT>|ValueT = null as unknown as ValueT,
          validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
          asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
        super(
            pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
        this._applyFormState(formState);
        this._setUpdateStrategy(validatorOrOpts);
        this._initObservables();
        this.updateValueAndValidity({
          onlySelf: true,
          // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
          // `VALID` or `INVALID`.
          // The status should be broadcasted via the `statusChanges` observable, so we set
          // `emitEvent` to `true` to allow that during the control creation process.
          emitEvent: !!this.asyncValidator
        });
        if (isOptionsObj(validatorOrOpts) && validatorOrOpts.initialValueIsDefault) {
          if (isFormState(formState)) {
            this.defaultValue = formState.value;
          } else {
            this.defaultValue = formState;
          }
        }
      }

      override setValue(value: ValueT, options: {
        onlySelf?: boolean,
        emitEvent?: boolean,
        emitModelToViewChange?: boolean,
        emitViewToModelChange?: boolean
      } = {}): void {
        (this as {value: ValueT}).value = this._pendingValue = value;
        if (this._onChange.length && options.emitModelToViewChange !== false) {
          this._onChange.forEach(
              (changeFn) => changeFn(this.value, options.emitViewToModelChange !== false));
        }
        this.updateValueAndValidity(options);
      }

      override patchValue(value: ValueT, options: {
        onlySelf?: boolean,
        emitEvent?: boolean,
        emitModelToViewChange?: boolean,
        emitViewToModelChange?: boolean
      } = {}): void {
        this.setValue(value, options);
      }

      override reset(
          formState: ValueT|FormState<ValueT> = this.defaultValue,
          options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
        this._applyFormState(formState as FormState<ValueT>| ValueT);
        this.markAsPristine(options);
        this.markAsUntouched(options);
        this.setValue(this.value, options);
        this._pendingChange = false;
      }

      getRawValue(): ValueT {
        return this.value;
      }

      /**  @internal */
      override _updateValue(): void {}

      /**  @internal */
      override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
        return false;
      }

      /**  @internal */
      override _allControlsDisabled(): boolean {
        return this.disabled;
      }

      registerOnChange(fn: Function): void {
        this._onChange.push(fn);
      }

      /** @internal */
      _unregisterOnChange(fn: (value?: any, emitModelEvent?: boolean) => void): void {
        removeListItem(this._onChange, fn);
      }

      registerOnDisabledChange(fn: (isDisabled: boolean) => void): void {
        this._onDisabledChange.push(fn);
      }

      /** @internal */
      _unregisterOnDisabledChange(fn: (isDisabled: boolean) => void): void {
        removeListItem(this._onDisabledChange, fn);
      }

      /** @internal */
      override _forEachChild(cb: (c: AbstractControl) => void): void {}

      /** @internal */
      override _syncPendingControls(): boolean {
        if (this.updateOn === 'submit') {
          if (this._pendingDirty) this.markAsDirty();
          if (this._pendingTouched) this.markAsTouched();
          if (this._pendingChange) {
            this.setValue(this._pendingValue, {onlySelf: true, emitModelToViewChange: false});
            return true;
          }
        }
        return false;
      }

      private _applyFormState(formState: FormState<ValueT>|ValueT) {
        if (isFormState(formState)) {
          (this as {value: ValueT}).value = this._pendingValue = formState.value;
          formState.disabled ? this.disable({onlySelf: true, emitEvent: false}) :
                               this.enable({onlySelf: true, emitEvent: false});
        } else {
          (this as {value: ValueT}).value = this._pendingValue = formState;
        }
      }
    });

interface UntypedFormControlCtor {
  new(): UntypedFormControl;

  new(formState?: any, validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): UntypedFormControl;

  prototype: FormControl;
}

/**
 * UntypedFormControl is a non-strongly-typed @see FormControl.
 */
export type UntypedFormControl = FormControl;

export const UntypedFormControl: UntypedFormControlCtor = FormControl;

/**
 * `FormGroupTypedOrUntyped` allows one of two different types to be selected, depending on whether
 * the FormGroup it's applied to is strongly typed or not.
 *
 * This is for internal Angular usage to support typed forms; do not directly use it.
 *
 * @publicApi
 */
export type FormGroupTypedOrUntyped<ControlT, Typed, Untyped> = {
  [key: string]: any
} extends ControlT ? Untyped : Typed;

/**
 * FormGroupValue extracts the type of `.value` from a FormGroup's inner object type.
 *
 * Angular uses this type internally to support Typed Forms; do not use it directly.
 *
 * @publicApi
 */
export type FormGroupValue<T extends {[K in keyof T]?: AbstractControl}> =
    FormGroupTypedOrUntyped<T, Partial<{[K in keyof T]: Value<T[K]>}>, {[key: string]: any}>;

/**
 * FormGroupRawValue extracts the type of `.getRawValue()` from a FormGroup's inner object type.
 *
 * Angular uses this type internally to support Typed Forms; do not use it directly.
 *
 * @publicApi
 */
export type FormGroupRawValue<T extends {[K in keyof T]?: AbstractControl}> =
    FormGroupTypedOrUntyped<T, {[K in keyof T]: RawValue<T[K]>}, {[key: string]: any}>;

/**
 * Typescript's builtin keyof implicitly includes `number`, because numbers are coerced to strings
 * by javascript. For the purposes of checking enumerated keys, it is sufficient to only look at
 * string keys.
 */
type StringKeysOf<T extends object> = Extract<keyof T, string>;

/**
 * OptionalKeys returns the union of all optional keys in the object.
 *
 * Angular uses this type internally to support Typed Forms; do not use it directly.
 */
type OptionalKeys<T> = {
  [K in keyof T] -?: undefined extends T[K] ? K : never
}[keyof T];

/**
 * RequiredKeys returns the union of all required keys in the object.
 *
 * Angular uses this type internally to support Typed Forms; do not use it directly.
 */
type RequiredKeys<T> = {
  [K in keyof T] -?: undefined extends T[K] ? never : K
}[keyof T];

/**
 * IndexSignatureOf<T> returns an object having the index signature from T. If no index signature is
 * present in T, this will return an empty object.
 */
type IndexSignatureOf<T> = {
  [K in keyof T as string extends K ? K : number extends K ? K : never]: T[K]
};

/**
 * KnownKeys returns all named (non-index) keys in T.
 */
type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
};

/**
 * HasIndexSignature returns T if string has an index signature, else never.
 */
type HasIndexSignature<T> = IndexSignatureOf<T> extends Record<any, never>? never : T;

/**
 * KeyIsRemovable determines whether V is a removable property in the object T.
 * If V is a required named property in T, then V is never removable.
 * If V is an optional named property in T, then V is always removable.
 * If V is not a named property but an index signature is present in T, then V is removable.
 *
 * @publicApi
 */
export type KeyIsRemovable<T, V extends string> = HasIndexSignature<T> extends never ?
    OptionalKeys<T>:
    V&(V extends RequiredKeys<KnownKeys<T>>? never : {});

/**
 * Tracks the value and validity state of a group of `FormControl` instances.
 *
 * A `FormGroup` aggregates the values of each child `FormControl` into one object,
 * with each control name as the key.  It calculates its status by reducing the status values
 * of its children. For example, if one of the controls in a group is invalid, the entire
 * group becomes invalid.
 *
 * `FormGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with `FormControl` and `FormArray`.
 *
 * When instantiating a `FormGroup`, pass in a collection of child controls as the first
 * argument. The key for each child registers the name for the control.
 *
 * `FormGroup` accepts an optional type parameter `ControlT`, which is an object type with inner
 * control types as values.
 *
 * @usageNotes
 *
 * ### Create a form group with 2 controls
 *
 * ```
 * const form = new FormGroup({
 *   first: new FormControl('Nancy', Validators.minLength(2)),
 *   last: new FormControl('Drew'),
 * });
 *
 * console.log(form.value);   // {first: 'Nancy', last; 'Drew'}
 * console.log(form.status);  // 'VALID'
 * ```
 *
 * ### Create a form group with a group-level validator
 *
 * You include group-level validators as the second arg, or group-level async
 * validators as the third arg. These come in handy when you want to perform validation
 * that considers the value of more than one child control.
 *
 * ```
 * const form = new FormGroup({
 *   password: new FormControl('', Validators.minLength(2)),
 *   passwordConfirm: new FormControl('', Validators.minLength(2)),
 * }, passwordMatchValidator);
 *
 *
 * function passwordMatchValidator(g: FormGroup) {
 *    return g.get('password').value === g.get('passwordConfirm').value
 *       ? null : {'mismatch': true};
 * }
 * ```
 *
 * Like `FormControl` instances, you choose to pass in
 * validators and async validators as part of an options object.
 *
 * ```
 * const form = new FormGroup({
 *   password: new FormControl('')
 *   passwordConfirm: new FormControl('')
 * }, { validators: passwordMatchValidator, asyncValidators: otherValidator });
 * ```
 *
 * ### Set the updateOn property for all controls in a form group
 *
 * The options object is used to set a default value for each child
 * control's `updateOn` property. If you set `updateOn` to `'blur'` at the
 * group level, all child controls default to 'blur', unless the child
 * has explicitly specified a different `updateOn` value.
 *
 * ```ts
 * const c = new FormGroup({
 *   one: new FormControl()
 * }, { updateOn: 'blur' });
 * ```
 *
 * ### Using a FormGroup with optional controls
 *
 * It is possible to have optional controls in a FormGroup. An optional control can be removed later
 * using `removeControl`, and can be omitted when calling `reset`. Optional controls must be
 * declared optional in the group's type.
 *
 * ```ts
 * const c = new FormGroup<{one?: FormControl<string>}>({
 *   one: new FormControl('')
 * });
 * ```
 *
 * Notice that `c.value.one` has type `string|null|undefined`. This is because calling `c.reset({})`
 * without providing the optional key `one` will cause it to become `null`.
 *
 * @publicApi
 */
export class FormGroup<ControlT extends {
  [K in keyof ControlT]: AbstractControl<Value<ControlT[K]>, RawValue<ControlT[K]>>
} = {
  [key: string]: AbstractControl
}> extends
    AbstractControl<
        FormGroupTypedOrUntyped<ControlT, FormGroupValue<ControlT>, any>,
        FormGroupTypedOrUntyped<ControlT, FormGroupRawValue<ControlT>, any>> {
  /**
   * Creates a new `FormGroup` instance.
   *
   * @param controls A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   */
  constructor(
      public controls: ControlT,
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this._initObservables();
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`. The status should be broadcasted via the `statusChanges` observable,
      // so we set `emitEvent` to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator
    });
  }

  /**
   * Registers a control with the group's list of controls. In a strongly-typed group, the control
   * must be in the group's type (possibly as an optional key).
   *
   * This method does not update the value or validity of the control.
   * Use {@link FormGroup#addControl addControl} instead.
   *
   * @param name The control name to register in the collection
   * @param control Provides the control for the given name
   */
  registerControl<K extends StringKeysOf<ControlT>>(name: K, control: ControlT[K]): ControlT[K] {
    if (this.controls[name]) return this.controls[name];
    this.controls[name] = control;
    control.setParent(this as FormGroup);
    control._registerOnCollectionChange(this._onCollectionChange);
    return control;
  }

  /**
   * Add a control to this group. In a strongly-typed group, the control must be in the group's type
   * (possibly as an optional key).
   *
   * If a control with a given name already exists, it would *not* be replaced with a new one.
   * If you want to replace an existing control, use the {@link FormGroup#setControl setControl}
   * method instead. This method also updates the value and validity of the control.
   *
   * @param name The control name to add to the collection
   * @param control Provides the control for the given name
   * @param options Specifies whether this FormGroup instance should emit events after a new
   *     control is added.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * added. When false, no events are emitted.
   */
  addControl<K extends StringKeysOf<ControlT>>(name: K, control: Required<ControlT>[K], options: {
    emitEvent?: boolean
  } = {}): void {
    this.registerControl(name, control);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  /**
   * Remove a control from this group. In a strongly-typed group, required controls cannot be
   * removed.
   *
   * This method also updates the value and validity of the control.
   *
   * @param name The control name to remove from the collection
   * @param options Specifies whether this FormGroup instance should emit events after a
   *     control is removed.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * removed. When false, no events are emitted.
   */
  removeControl<S extends string>(name: KeyIsRemovable<ControlT, S>, options: {
    emitEvent?: boolean
  } = {}): void {
    if (this.controls[name as keyof ControlT])
      this.controls[name as keyof ControlT]._registerOnCollectionChange(() => {});
    delete (this.controls[name as keyof ControlT]);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  /**
   * Replace an existing control. In a strongly-typed group, the control must be in the group's type
   * (possibly as an optional key).
   *
   * If a control with a given name does not exist in this `FormGroup`, it will be added.
   *
   * @param name The control name to replace in the collection
   * @param control Provides the control for the given name
   * @param options Specifies whether this FormGroup instance should emit events after an
   *     existing control is replaced.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * replaced with a new one. When false, no events are emitted.
   */
  setControl<K extends StringKeysOf<ControlT>>(name: K, control: ControlT[K], options: {
    emitEvent?: boolean
  } = {}): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    delete (this.controls[name]);
    if (control) this.registerControl(name, control);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  /**
   * Check whether there is an enabled control with the given name in the group.
   *
   * Reports false for disabled controls. If you'd like to check for existence in the group
   * only, use {@link AbstractControl#get get} instead.
   *
   * @param controlName The control name to check for existence in the collection
   *
   * @returns false for disabled controls, true otherwise.
   */
  contains<K extends StringKeysOf<ControlT>>(controlName: K): boolean {
    return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
  }

  /**
   * Sets the value of the `FormGroup`. It accepts an object that matches
   * the structure of the group, with control names as keys.
   *
   * @usageNotes
   * ### Set the complete value for the form group
   *
   * ```
   * const form = new FormGroup({
   *   first: new FormControl(),
   *   last: new FormControl()
   * });
   *
   * console.log(form.value);   // {first: null, last: null}
   *
   * form.setValue({first: 'Nancy', last: 'Drew'});
   * console.log(form.value);   // {first: 'Nancy', last: 'Drew'}
   * ```
   *
   * @throws When strict checks fail, such as setting the value of a control
   * that doesn't exist or if you exclude a value of a control that does exist.
   *
   * @param value The new value for the control that matches the structure of the group.
   * @param options Configuration options that determine how the control propagates changes
   * and emits events after the value changes.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   */
  override setValue(value: FormGroupRawValue<ControlT>, options: {
    onlySelf?: boolean,
    emitEvent?: boolean
  } = {}): void {
    assertAllValuesPresent(this, value);
    (Object.keys(value) as Array<keyof ControlT>).forEach(name => {
      assertControlPresent(this, name as any);
      this.controls[name].setValue(
          (value as any)[name], {onlySelf: true, emitEvent: options.emitEvent});
    });
    this.updateValueAndValidity(options);
  }

  /**
   * Patches the value of the `FormGroup`. It accepts an object with control
   * names as keys, and does its best to match the values to the correct controls
   * in the group.
   *
   * It accepts both super-sets and sub-sets of the group without throwing an error.
   *
   * @usageNotes
   * ### Patch the value for a form group
   *
   * ```
   * const form = new FormGroup({
   *    first: new FormControl(),
   *    last: new FormControl()
   * });
   * console.log(form.value);   // {first: null, last: null}
   *
   * form.patchValue({first: 'Nancy'});
   * console.log(form.value);   // {first: 'Nancy', last: null}
   * ```
   *
   * @param value The object that matches the structure of the group.
   * @param options Configuration options that determine how the control propagates changes and
   * emits events after the value is patched.
   * * `onlySelf`: When true, each change only affects this control and not its parent. Default is
   * true.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control value
   * is updated. When false, no events are emitted. The configuration options are passed to
   * the {@link AbstractControl#updateValueAndValidity updateValueAndValidity} method.
   */
  override patchValue(value: FormGroupValue<ControlT>, options: {
    onlySelf?: boolean,
    emitEvent?: boolean
  } = {}): void {
    // Even though the `value` argument type doesn't allow `null` and `undefined` values, the
    // `patchValue` can be called recursively and inner data structures might have these values, so
    // we just ignore such cases when a field containing FormGroup instance receives `null` or
    // `undefined` as a value.
    if (value == null /* both `null` and `undefined` */) return;
    (Object.keys(value) as Array<keyof ControlT>).forEach(name => {
      if (this.controls[name]) {
        this.controls[name]!.patchValue(
            /* Guaranteed to be present, due to the outer forEach. */ value
                [name as keyof FormGroupValue<ControlT>]!,
            {onlySelf: true, emitEvent: options.emitEvent});
      }
    });
    this.updateValueAndValidity(options);
  }

  /**
   * Resets the `FormGroup`, marks all descendants `pristine` and `untouched` and sets
   * the value of all descendants to their default values, or null if no defaults were provided.
   *
   * You reset to a specific form state by passing in a map of states
   * that matches the structure of your form, with control names as keys. The state
   * is a standalone value or a form state object with both a value and a disabled
   * status.
   *
   * @param value Resets the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param options Configuration options that determine how the control propagates changes
   * and emits events when the group is reset.
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   *
   * @usageNotes
   *
   * ### Reset the form group values
   *
   * ```ts
   * const form = new FormGroup({
   *   first: new FormControl('first name'),
   *   last: new FormControl('last name')
   * });
   *
   * console.log(form.value);  // {first: 'first name', last: 'last name'}
   *
   * form.reset({ first: 'name', last: 'last name' });
   *
   * console.log(form.value);  // {first: 'name', last: 'last name'}
   * ```
   *
   * ### Reset the form group values and disabled status
   *
   * ```
   * const form = new FormGroup({
   *   first: new FormControl('first name'),
   *   last: new FormControl('last name')
   * });
   *
   * form.reset({
   *   first: {value: 'name', disabled: true},
   *   last: 'last'
   * });
   *
   * console.log(form.value);  // {last: 'last'}
   * console.log(form.get('first').status);  // 'DISABLED'
   * ```
   */
  override reset(
      value: FormGroupTypedOrUntyped<ControlT, FormGroupValue<ControlT>, any> = {} as unknown as
          FormGroupValue<ControlT>,
      options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    this._forEachChild((control, name) => {
      control.reset((value as any)[name], {onlySelf: true, emitEvent: options.emitEvent});
    });
    this._updatePristine(options);
    this._updateTouched(options);
    this.updateValueAndValidity(options);
  }

  /**
   * The aggregate value of the `FormGroup`, including any disabled controls.
   *
   * Retrieves all values regardless of disabled status.
   */
  getRawValue(): FormGroupTypedOrUntyped<ControlT, FormGroupRawValue<ControlT>, any> {
    return this._reduceChildren({}, (acc, control, name) => {
      (acc as any)[name] = (control as any).getRawValue();
      return acc;
    }) as any;
  }

  /** @internal */
  override _syncPendingControls(): boolean {
    let subtreeUpdated = this._reduceChildren(false, (updated: boolean, child) => {
      return child._syncPendingControls() ? true : updated;
    });
    if (subtreeUpdated) this.updateValueAndValidity({onlySelf: true});
    return subtreeUpdated;
  }

  /** @internal */
  override _forEachChild(cb: (v: any, k: any) => void): void {
    Object.keys(this.controls).forEach(key => {
      // The list of controls can change (for ex. controls might be removed) while the loop
      // is running (as a result of invoking Forms API in `valueChanges` subscription), so we
      // have to null check before invoking the callback.
      const control = (this.controls as any)[key];
      control && cb(control, key);
    });
  }

  /** @internal */
  _setUpControls(): void {
    this._forEachChild((control) => {
      control.setParent(this);
      control._registerOnCollectionChange(this._onCollectionChange);
    });
  }

  /** @internal */
  override _updateValue(): void {
    (this as {value: any}).value = this._reduceValue();
  }

  /** @internal */
  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    for (const [controlName, control] of Object.entries(this.controls)) {
      if (this.contains(controlName as any) && condition(control as any)) {
        return true;
      }
    }
    return false;
  }

  /** @internal */
  _reduceValue(): Partial<ControlT> {
    let acc: Partial<ControlT> = {};
    return this._reduceChildren(acc, (acc, control, name) => {
      if (control.enabled || this.disabled) {
        acc[name] = control.value;
      }
      return acc;
    });
  }

  /** @internal */
  _reduceChildren<T, K extends keyof ControlT>(
      initValue: T, fn: (acc: T, control: ControlT[K], name: K) => T): T {
    let res = initValue;
    this._forEachChild((control: ControlT[K], name: K) => {
      res = fn(res, control, name);
    });
    return res;
  }

  /** @internal */
  override _allControlsDisabled(): boolean {
    for (const controlName of (Object.keys(this.controls) as Array<keyof ControlT>)) {
      if (this.controls[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(this.controls).length > 0 || this.disabled;
  }
}

interface UntypedFormGroupCtor {
  new(controls: {[key: string]: AbstractControl},
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): UntypedFormGroup;

  prototype: FormGroup;
}

/**
 * UntypedFormGroup is a non-strongly-typed @see FormGroup.
 */
export type UntypedFormGroup = FormGroup;

export const UntypedFormGroup: UntypedFormGroupCtor = FormGroup;

/**
 * `FormArrayTypedOrUntyped` allows one of two different types to be selected, depending on whether
 * the FormArray it's applied to is strongly typed or not.
 *
 * This is for internal Angular usage to support typed forms; do not directly use it.
 *
 * @publicApi
 */
type FormArrayTypedOrUntyped<T extends AbstractControl<any>, Typed, Untyped> =
    T extends AbstractControl<infer U>? (unknown extends U ? Untyped : Typed) : never;

/**
 * Tracks the value and validity state of an array of `FormControl`,
 * `FormGroup` or `FormArray` instances.
 *
 * A `FormArray` aggregates the values of each child `FormControl` into an array.
 * It calculates its status by reducing the status values of its children. For example, if one of
 * the controls in a `FormArray` is invalid, the entire array becomes invalid.
 *
 * `FormArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with `FormControl` and `FormGroup`.
 *
 * @usageNotes
 *
 * ### Create an array of form controls
 *
 * ```
 * const arr = new FormArray([
 *   new FormControl('Nancy', Validators.minLength(2)),
 *   new FormControl('Drew'),
 * ]);
 *
 * console.log(arr.value);   // ['Nancy', 'Drew']
 * console.log(arr.status);  // 'VALID'
 * ```
 *
 * ### Create a form array with array-level validators
 *
 * You include array-level validators and async validators. These come in handy
 * when you want to perform validation that considers the value of more than one child
 * control.
 *
 * The two types of validators are passed in separately as the second and third arg
 * respectively, or together as part of an options object.
 *
 * ```
 * const arr = new FormArray([
 *   new FormControl('Nancy'),
 *   new FormControl('Drew')
 * ], {validators: myValidator, asyncValidators: myAsyncValidator});
 * ```
 *
 * ### Set the updateOn property for all controls in a form array
 *
 * The options object is used to set a default value for each child
 * control's `updateOn` property. If you set `updateOn` to `'blur'` at the
 * array level, all child controls default to 'blur', unless the child
 * has explicitly specified a different `updateOn` value.
 *
 * ```ts
 * const arr = new FormArray([
 *    new FormControl()
 * ], {updateOn: 'blur'});
 * ```
 *
 * ### Adding or removing controls from a form array
 *
 * To change the controls in the array, use the `push`, `insert`, `removeAt` or `clear` methods
 * in `FormArray` itself. These methods ensure the controls are properly tracked in the
 * form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
 * the `FormArray` directly, as that result in strange and unexpected behavior such
 * as broken change detection.
 *
 * @publicApi
 */
export class FormArray<ControlT extends AbstractControl<Value<ControlT>, RawValue<ControlT>> =
                                            AbstractControl> extends
    AbstractControl<
        FormArrayTypedOrUntyped<ControlT, Array<Value<ControlT>>, any>,
        FormArrayTypedOrUntyped<ControlT, Array<RawValue<ControlT>>, any>> {
  /**
   * Creates a new `FormArray` instance.
   *
   * @param controls An array of child controls. Each child control is given an index
   * where it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   */
  constructor(
      public controls: Array<ControlT>,
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this._initObservables();
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`.
      // The status should be broadcasted via the `statusChanges` observable, so we set
      // `emitEvent` to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator
    });
  }

  /**
   * Get the `AbstractControl` at the given `index` in the array.
   *
   * @param index Index in the array to retrieve the control. If `index` is negative, it will wrap
   *     around from the back, and if index is greatly negative (less than `-length`), the result is
   * undefined. This behavior is the same as `Array.at(index)`.
   */
  at(index: number): ControlT {
    return this.controls[this._adjustIndex(index)];
  }

  /**
   * Insert a new `AbstractControl` at the end of the array.
   *
   * @param control Form control to be inserted
   * @param options Specifies whether this FormArray instance should emit events after a new
   *     control is added.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * inserted. When false, no events are emitted.
   */
  push(control: ControlT, options: {emitEvent?: boolean} = {}): void {
    this.controls.push(control);
    this._registerControl(control);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  /**
   * Insert a new `AbstractControl` at the given `index` in the array.
   *
   * @param index Index in the array to insert the control. If `index` is negative, wraps around
   *     from the back. If `index` is greatly negative (less than `-length`), prepends to the array.
   * This behavior is the same as `Array.splice(index, 0, control)`.
   * @param control Form control to be inserted
   * @param options Specifies whether this FormArray instance should emit events after a new
   *     control is inserted.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * inserted. When false, no events are emitted.
   */
  insert(index: number, control: ControlT, options: {emitEvent?: boolean} = {}): void {
    this.controls.splice(index, 0, control);

    this._registerControl(control);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
  }

  /**
   * Remove the control at the given `index` in the array.
   *
   * @param index Index in the array to remove the control.  If `index` is negative, wraps around
   *     from the back. If `index` is greatly negative (less than `-length`), removes the first
   *     element. This behavior is the same as `Array.splice(index, 1)`.
   * @param options Specifies whether this FormArray instance should emit events after a
   *     control is removed.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * removed. When false, no events are emitted.
   */
  removeAt(index: number, options: {emitEvent?: boolean} = {}): void {
    // Adjust the index, then clamp it at no less than 0 to prevent undesired underflows.
    let adjustedIndex = this._adjustIndex(index);
    if (adjustedIndex < 0) adjustedIndex = 0;

    if (this.controls[adjustedIndex])
      this.controls[adjustedIndex]._registerOnCollectionChange(() => {});
    this.controls.splice(adjustedIndex, 1);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
  }

  /**
   * Replace an existing control.
   *
   * @param index Index in the array to replace the control. If `index` is negative, wraps around
   *     from the back. If `index` is greatly negative (less than `-length`), replaces the first
   *     element. This behavior is the same as `Array.splice(index, 1, control)`.
   * @param control The `AbstractControl` control to replace the existing control
   * @param options Specifies whether this FormArray instance should emit events after an
   *     existing control is replaced with a new one.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * replaced with a new one. When false, no events are emitted.
   */
  setControl(index: number, control: ControlT, options: {emitEvent?: boolean} = {}): void {
    // Adjust the index, then clamp it at no less than 0 to prevent undesired underflows.
    let adjustedIndex = this._adjustIndex(index);
    if (adjustedIndex < 0) adjustedIndex = 0;

    if (this.controls[adjustedIndex])
      this.controls[adjustedIndex]._registerOnCollectionChange(() => {});
    this.controls.splice(adjustedIndex, 1);

    if (control) {
      this.controls.splice(adjustedIndex, 0, control);
      this._registerControl(control);
    }

    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  /**
   * Length of the control array.
   */
  get length(): number {
    return this.controls.length;
  }

  /**
   * Sets the value of the `FormArray`. It accepts an array that matches
   * the structure of the control.
   *
   * This method performs strict checks, and throws an error if you try
   * to set the value of a control that doesn't exist or if you exclude the
   * value of a control.
   *
   * @usageNotes
   * ### Set the values for the controls in the form array
   *
   * ```
   * const arr = new FormArray([
   *   new FormControl(),
   *   new FormControl()
   * ]);
   * console.log(arr.value);   // [null, null]
   *
   * arr.setValue(['Nancy', 'Drew']);
   * console.log(arr.value);   // ['Nancy', 'Drew']
   * ```
   *
   * @param value Array of values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   */
  override setValue(value: Array<RawValue<ControlT>>, options: {
    onlySelf?: boolean,
    emitEvent?: boolean
  } = {}): void {
    assertAllValuesPresent(this, value);
    value.forEach((newValue: any, index: number) => {
      assertControlPresent(this, index);
      (this.at(index) as any).setValue(newValue, {onlySelf: true, emitEvent: options.emitEvent});
    });
    this.updateValueAndValidity(options);
  }

  /**
   * Patches the value of the `FormArray`. It accepts an array that matches the
   * structure of the control, and does its best to match the values to the correct
   * controls in the group.
   *
   * It accepts both super-sets and sub-sets of the array without throwing an error.
   *
   * @usageNotes
   * ### Patch the values for controls in a form array
   *
   * ```
   * const arr = new FormArray([
   *    new FormControl(),
   *    new FormControl()
   * ]);
   * console.log(arr.value);   // [null, null]
   *
   * arr.patchValue(['Nancy']);
   * console.log(arr.value);   // ['Nancy', null]
   * ```
   *
   * @param value Array of latest values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control
   * value is updated. When false, no events are emitted. The configuration options are passed to
   * the {@link AbstractControl#updateValueAndValidity updateValueAndValidity} method.
   */
  override patchValue(value: Array<Value<ControlT>>, options: {
    onlySelf?: boolean,
    emitEvent?: boolean
  } = {}): void {
    // Even though the `value` argument type doesn't allow `null` and `undefined` values, the
    // `patchValue` can be called recursively and inner data structures might have these values,
    // so we just ignore such cases when a field containing FormArray instance receives `null` or
    // `undefined` as a value.
    if (value == null /* both `null` and `undefined` */) return;

    value.forEach((newValue, index) => {
      if (this.at(index)) {
        (this.at(index) as any)
            .patchValue(newValue, {onlySelf: true, emitEvent: options.emitEvent});
      }
    });
    this.updateValueAndValidity(options);
  }

  /**
   * Resets the `FormArray` and all descendants are marked `pristine` and `untouched`, and the
   * value of all descendants to null or null maps.
   *
   * You reset to a specific form state by passing in an array of states
   * that matches the structure of the control. The state is a standalone value
   * or a form state object with both a value and a disabled status.
   *
   * @usageNotes
   * ### Reset the values in a form array
   *
   * ```ts
   * const arr = new FormArray([
   *    new FormControl(),
   *    new FormControl()
   * ]);
   * arr.reset(['name', 'last name']);
   *
   * console.log(arr.value);  // ['name', 'last name']
   * ```
   *
   * ### Reset the values in a form array and the disabled status for the first control
   *
   * ```
   * arr.reset([
   *   {value: 'name', disabled: true},
   *   'last'
   * ]);
   *
   * console.log(arr.value);  // ['last']
   * console.log(arr.at(0).status);  // 'DISABLED'
   * ```
   *
   * @param value Array of values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   */
  override reset(value: any = [], options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
    this._forEachChild((control: AbstractControl, index: number) => {
      control.reset(value[index], {onlySelf: true, emitEvent: options.emitEvent});
    });
    this._updatePristine(options);
    this._updateTouched(options);
    this.updateValueAndValidity(options);
  }

  /**
   * The aggregate value of the array, including any disabled controls.
   *
   * Reports all values regardless of disabled status.
   */
  getRawValue(): Array<RawValue<ControlT>> {
    return this.controls.map((control, idx) => {
      return control instanceof FormControl ? control.value : (control as any).getRawValue();
    }) as any;
  }

  /**
   * Remove all controls in the `FormArray`.
   *
   * @param options Specifies whether this FormArray instance should emit events after all
   *     controls are removed.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when all controls
   * in this FormArray instance are removed. When false, no events are emitted.
   *
   * @usageNotes
   * ### Remove all elements from a FormArray
   *
   * ```ts
   * const arr = new FormArray([
   *    new FormControl(),
   *    new FormControl()
   * ]);
   * console.log(arr.length);  // 2
   *
   * arr.clear();
   * console.log(arr.length);  // 0
   * ```
   *
   * It's a simpler and more efficient alternative to removing all elements one by one:
   *
   * ```ts
   * const arr = new FormArray([
   *    new FormControl(),
   *    new FormControl()
   * ]);
   *
   * while (arr.length) {
   *    arr.removeAt(0);
   * }
   * ```
   */
  clear(options: {emitEvent?: boolean} = {}): void {
    if (this.controls.length < 1) return;
    this._forEachChild((control) => control._registerOnCollectionChange(() => {}));
    this.controls.splice(0);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
  }

  /**
   * Adjusts a negative index by summing it with the length of the array. For very negative
   * indices, the result may remain negative.
   * @internal
   */
  private _adjustIndex(index: number): number {
    return index < 0 ? index + this.length : index;
  }

  /** @internal */
  override _syncPendingControls(): boolean {
    let subtreeUpdated = this.controls.reduce((updated, child) => {
      return child._syncPendingControls() ? true : updated;
    }, false);
    if (subtreeUpdated) this.updateValueAndValidity({onlySelf: true});
    return subtreeUpdated;
  }

  /** @internal */
  override _forEachChild(cb: (c: AbstractControl, index: number) => void): void {
    this.controls.forEach((control: AbstractControl, index: number) => {
      cb(control, index);
    });
  }

  /** @internal */
  override _updateValue(): void {
    (this as any).value = this.controls.filter((control) => control.enabled || this.disabled)
                              .map((control) => control.value);
  }

  /** @internal */
  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    return this.controls.some((control) => control.enabled && condition(control));
  }

  /** @internal */
  _setUpControls(): void {
    this._forEachChild((control) => this._registerControl(control));
  }

  /** @internal */
  override _allControlsDisabled(): boolean {
    for (const control of this.controls) {
      if (control.enabled) return false;
    }
    return this.controls.length > 0 || this.disabled;
  }

  private _registerControl(control: AbstractControl) {
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
  }
}

interface UntypedFormArrayCtor {
  new(controls: AbstractControl[],
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): UntypedFormArray;

  prototype: FormArray;
}

/**
 * UntypedFormArray is a non-strongly-typed @see FormArray.
 */
export type UntypedFormArray = FormArray;

export const UntypedFormArray: UntypedFormArrayCtor = FormArray;
