/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵWritable as Writable} from '@angular/core';

import {AsyncValidatorFn, ValidatorFn} from '../directives/validators';
import {removeListItem} from '../util';

import {
  AbstractControl,
  AbstractControlOptions,
  isOptionsObj,
  pickAsyncValidators,
  pickValidators,
} from './abstract_model';

/**
 * FormControlState is a boxed form value. It is an object with a `value` key and a `disabled` key.
 *
 * @publicApi
 */
export interface FormControlState<T> {
  value: T;
  disabled: boolean;
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
  nonNullable?: boolean;

  /**
   * @deprecated Use `nonNullable` instead.
   */
  initialValueIsDefault?: boolean;
}

/**
 * Tracks the value and validation status of an individual form control.
 *
 * This is one of the four fundamental building blocks of Angular forms, along with
 * `FormGroup`, `FormArray` and `FormRecord`. It extends the `AbstractControl` class that
 * implements most of the base functionality for accessing the value, validation status,
 * user interactions and events.
 *
 * `FormControl` takes a single generic argument, which describes the type of its value. This
 * argument always implicitly includes `null` because the control can be reset. To change this
 * behavior, set `nonNullable` or see the usage notes below.
 *
 * See [usage examples below](#usage-notes).
 *
 * @see {@link AbstractControl}
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
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
 * ### The single type argument
 *
 * `FormControl` accepts a generic argument, which describes the type of its value.
 * In most cases, this argument will be inferred.
 *
 * If you are initializing the control to `null`, or you otherwise wish to provide a
 * wider type, you may specify the argument explicitly:
 *
 * ```ts
 * let fc = new FormControl<string|null>(null);
 * fc.setValue('foo');
 * ```
 *
 * You might notice that `null` is always added to the type of the control.
 * This is because the control will become `null` if you call `reset`. You can change
 * this behavior by setting `{nonNullable: true}`.
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
 * ### Reset the control back to a specific value
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
 * ### Reset the control to its initial value
 *
 * If you wish to always reset the control to its initial value (instead of null),
 * you can pass the `nonNullable` option:
 *
 * ```ts
 * const control = new FormControl('Nancy', {nonNullable: true});
 *
 * console.log(control.value); // 'Nancy'
 *
 * control.reset();
 *
 * console.log(control.value); // 'Nancy'
 * ```
 *
 * ### Reset the control back to an initial value and disabled
 *
 * ```ts
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
export interface FormControl<TValue = any> extends AbstractControl<TValue> {
  /**
   * The default value of this FormControl, used whenever the control is reset without an explicit
   * value. See {@link FormControlOptions#nonNullable} for more information on configuring
   * a default value.
   */
  readonly defaultValue: TValue;

  /** @internal */
  _onChange: Function[];

  /**
   * This field holds a pending value that has not yet been applied to the form's value.
   * @internal
   */
  _pendingValue: TValue;

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
  setValue(
    value: TValue,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    },
  ): void;

  /**
   * Patches the value of a control.
   *
   * This function is functionally the same as {@link FormControl#setValue setValue} at this level.
   * It exists for symmetry with {@link FormGroup#patchValue patchValue} on `FormGroups` and
   * `FormArrays`, where it does behave differently.
   *
   * @see {@link FormControl#setValue} for options
   */
  patchValue(
    value: TValue,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    },
  ): void;

  /**
   * Resets the form control, marking it `pristine` and `untouched`, and resetting
   * the value. The new value will be the provided value (if passed), `null`, or the initial value
   * if `nonNullable` was set in the constructor via {@link FormControlOptions}.
   *
   * ```ts
   * // By default, the control will reset to null.
   * const dog = new FormControl('spot');
   * dog.reset(); // dog.value is null
   *
   * // If this flag is set, the control will instead reset to the initial value.
   * const cat = new FormControl('tabby', {nonNullable: true});
   * cat.reset(); // cat.value is "tabby"
   *
   * // A value passed to reset always takes precedence.
   * const fish = new FormControl('finn', {nonNullable: true});
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
  reset(
    formState?: TValue | FormControlState<TValue>,
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    },
  ): void;

  /**
   * For a simple FormControl, the raw value is equivalent to the value.
   */
  getRawValue(): TValue;

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

// This internal interface is present to avoid a naming clash, resulting in the wrong `FormControl`
// symbol being used.
type FormControlInterface<TValue = any> = FormControl<TValue>;

/**
 * Various available constructors for `FormControl`.
 * Do not use this interface directly. Instead, use `FormControl`:
 * ```ts
 * const fc = new FormControl('foo');
 * ```
 * This symbol is prefixed with ɵ to make plain that it is an internal symbol.
 */
export interface ɵFormControlCtor {
  /**
   * Construct a FormControl with no initial value or validators.
   */
  new (): FormControl<any>;

  /**
   * Creates a new `FormControl` instance.
   *
   * @param value Initializes the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param opts A `FormControlOptions` object that contains validation functions and a
   * validation trigger. `nonNullable` have to be `true`
   */
  new <T = any>(
    value: FormControlState<T> | T,
    opts: FormControlOptions & {nonNullable: true},
  ): FormControl<T>;

  /**
   * @deprecated Use `nonNullable` instead.
   */
  new <T = any>(
    value: FormControlState<T> | T,
    opts: FormControlOptions & {
      initialValueIsDefault: true;
    },
  ): FormControl<T>;

  /**
   * @deprecated When passing an `options` argument, the `asyncValidator` argument has no effect.
   */
  new <T = any>(
    value: FormControlState<T> | T,
    opts: FormControlOptions,
    asyncValidator: AsyncValidatorFn | AsyncValidatorFn[],
  ): FormControl<T | null>;

  /**
   * Creates a new `FormControl` instance.
   *
   * @param value Initializes the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or a `FormControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   */
  new <T = any>(
    value: FormControlState<T> | T,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ): FormControl<T | null>;

  /**
   * The presence of an explicit `prototype` property provides backwards-compatibility for apps that
   * manually inspect the prototype chain.
   */
  prototype: FormControl<any>;
}

function isFormControlState(formState: unknown): formState is FormControlState<unknown> {
  return (
    typeof formState === 'object' &&
    formState !== null &&
    Object.keys(formState).length === 2 &&
    'value' in formState &&
    'disabled' in formState
  );
}

export const FormControl: ɵFormControlCtor = class FormControl<TValue = any>
  extends AbstractControl<TValue>
  implements FormControlInterface<TValue>
{
  /** @publicApi */
  public readonly defaultValue: TValue = null as unknown as TValue;

  /** @internal */
  _onChange: Array<Function> = [];

  /** @internal */
  _pendingValue!: TValue;

  /** @internal */
  _pendingChange: boolean = false;

  constructor(
    // formState and defaultValue will only be null if T is nullable
    formState: FormControlState<TValue> | TValue = null as unknown as TValue,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this._applyFormState(formState);
    this._setUpdateStrategy(validatorOrOpts);
    this._initObservables();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`.
      // The status should be broadcasted via the `statusChanges` observable, so we set
      // `emitEvent` to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator,
    });
    if (
      isOptionsObj(validatorOrOpts) &&
      (validatorOrOpts.nonNullable || validatorOrOpts.initialValueIsDefault)
    ) {
      if (isFormControlState(formState)) {
        this.defaultValue = formState.value;
      } else {
        this.defaultValue = formState;
      }
    }
  }

  override setValue(
    value: TValue,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    } = {},
  ): void {
    (this as Writable<this>).value = this._pendingValue = value;
    if (this._onChange.length && options.emitModelToViewChange !== false) {
      this._onChange.forEach((changeFn) =>
        changeFn(this.value, options.emitViewToModelChange !== false),
      );
    }
    this.updateValueAndValidity(options);
  }

  override patchValue(
    value: TValue,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    } = {},
  ): void {
    this.setValue(value, options);
  }

  override reset(
    formState: TValue | FormControlState<TValue> = this.defaultValue,
    options: {onlySelf?: boolean; emitEvent?: boolean} = {},
  ): void {
    this._applyFormState(formState);
    this.markAsPristine(options);
    this.markAsUntouched(options);
    this.setValue(this.value, options);
    this._pendingChange = false;
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

  private _applyFormState(formState: FormControlState<TValue> | TValue) {
    if (isFormControlState(formState)) {
      (this as Writable<this>).value = this._pendingValue = formState.value;
      formState.disabled
        ? this.disable({onlySelf: true, emitEvent: false})
        : this.enable({onlySelf: true, emitEvent: false});
    } else {
      (this as Writable<this>).value = this._pendingValue = formState;
    }
  }
};

interface UntypedFormControlCtor {
  new (): UntypedFormControl;

  new (
    formState?: any,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ): UntypedFormControl;

  /**
   * The presence of an explicit `prototype` property provides backwards-compatibility for apps that
   * manually inspect the prototype chain.
   */
  prototype: FormControl<any>;
}

/**
 * UntypedFormControl is a non-strongly-typed version of `FormControl`.
 */
export type UntypedFormControl = FormControl<any>;

export const UntypedFormControl: UntypedFormControlCtor = FormControl;

/**
 * @description
 * Asserts that the given control is an instance of `FormControl`
 *
 * @publicApi
 */
export const isFormControl = (control: unknown): control is FormControl =>
  control instanceof FormControl;
