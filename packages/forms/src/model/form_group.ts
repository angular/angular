/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵWritable as Writable} from '@angular/core';

import {AsyncValidatorFn, ValidatorFn} from '../directives/validators';

import {
  AbstractControl,
  AbstractControlOptions,
  assertAllValuesPresent,
  assertControlPresent,
  pickAsyncValidators,
  pickValidators,
  ɵRawValue,
  ɵTypedOrUntyped,
  ɵValue,
} from './abstract_model';
import {FormControlState} from './form_control';

/**
 * FormGroupValue extracts the type of `.value` from a FormGroup's inner object type. The untyped
 * case falls back to {[key: string]: any}.
 *
 * Angular uses this type internally to support Typed Forms; do not use it directly.
 *
 * For internal use only.
 */

export type ɵFormGroupArgumentValue<T extends {[K in keyof T]?: AbstractControl<any>}> =
  ɵTypedOrUntyped<
    T,
    Partial<{[K in keyof T]: ɵValue<T[K]> | FormControlState<ɵValue<T[K]>>}>,
    {[key: string]: any}
  >;

export type ɵFormGroupValue<T extends {[K in keyof T]?: AbstractControl<any>}> = ɵTypedOrUntyped<
  T,
  Partial<{[K in keyof T]: ɵValue<T[K]>}>,
  {[key: string]: any}
>;

/**
 * FormGroupRawValue extracts the type of `.getRawValue()` from a FormGroup's inner object type. The
 * untyped case falls back to {[key: string]: any}.
 *
 * Angular uses this type internally to support Typed Forms; do not use it directly.
 *
 * For internal use only.
 */
export type ɵFormGroupRawValue<T extends {[K in keyof T]?: AbstractControl<any>}> = ɵTypedOrUntyped<
  T,
  {[K in keyof T]: ɵRawValue<T[K]>},
  {[key: string]: any}
>;

/**
 * OptionalKeys returns the union of all optional keys in the object.
 *
 * Angular uses this type internally to support Typed Forms; do not use it directly.
 */
export type ɵOptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

/**
 * Tracks the value and validity state of a group of `FormControl` instances.
 *
 * A `FormGroup` aggregates the values of each child `FormControl` into one object,
 * with each control name as the key.  It calculates its status by reducing the status values
 * of its children. For example, if one of the controls in a group is invalid, the entire
 * group becomes invalid.
 *
 * `FormGroup` is one of the four fundamental building blocks used to define forms in Angular,
 * along with `FormControl`, `FormArray`, and `FormRecord`.
 *
 * When instantiating a `FormGroup`, pass in a collection of child controls as the first
 * argument. The key for each child registers the name for the control.
 *
 * `FormGroup` is intended for use cases where the keys are known ahead of time.
 * If you need to dynamically add and remove controls, use {@link FormRecord} instead.
 *
 * `FormGroup` accepts an optional type parameter `TControl`, which is an object type with inner
 * control types as values.
 *
 * @usageNotes
 *
 * ### Create a form group with 2 controls
 *
 * ```ts
 * const form = new FormGroup({
 *   first: new FormControl('Nancy', Validators.minLength(2)),
 *   last: new FormControl('Drew'),
 * });
 *
 * console.log(form.value);   // {first: 'Nancy', last; 'Drew'}
 * console.log(form.status);  // 'VALID'
 * ```
 *
 * ### The type argument, and optional controls
 *
 * `FormGroup` accepts one generic argument, which is an object containing its inner controls.
 * This type will usually be inferred automatically, but you can always specify it explicitly if you
 * wish.
 *
 * If you have controls that are optional (i.e. they can be removed, you can use the `?` in the
 * type):
 *
 * ```ts
 * const form = new FormGroup<{
 *   first: FormControl<string|null>,
 *   middle?: FormControl<string|null>, // Middle name is optional.
 *   last: FormControl<string|null>,
 * }>({
 *   first: new FormControl('Nancy'),
 *   last: new FormControl('Drew'),
 * });
 * ```
 *
 * ### Create a form group with a group-level validator
 *
 * You include group-level validators as the second arg, or group-level async
 * validators as the third arg. These come in handy when you want to perform validation
 * that considers the value of more than one child control.
 *
 * ```ts
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
 * ```ts
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
export class FormGroup<
  TControl extends {[K in keyof TControl]: AbstractControl<any>} = any,
> extends AbstractControl<
  ɵTypedOrUntyped<TControl, ɵFormGroupValue<TControl>, any>,
  ɵTypedOrUntyped<TControl, ɵFormGroupRawValue<TControl>, any>,
  ɵTypedOrUntyped<TControl, ɵFormGroupArgumentValue<TControl>, any>
> {
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
    controls: TControl,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    (typeof ngDevMode === 'undefined' || ngDevMode) && validateFormGroupControls(controls);
    this.controls = controls;
    this._initObservables();
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`. The status should be broadcasted via the `statusChanges` observable,
      // so we set `emitEvent` to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator,
    });
  }

  public controls: ɵTypedOrUntyped<TControl, TControl, {[key: string]: AbstractControl<any>}>;

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
  registerControl<K extends string & keyof TControl>(name: K, control: TControl[K]): TControl[K];
  registerControl(
    this: FormGroup<{[key: string]: AbstractControl<any>}>,
    name: string,
    control: AbstractControl<any>,
  ): AbstractControl<any>;

  registerControl<K extends string & keyof TControl>(name: K, control: TControl[K]): TControl[K] {
    if (this.controls[name]) return (this.controls as any)[name];
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
  addControl(
    this: FormGroup<{[key: string]: AbstractControl<any>}>,
    name: string,
    control: AbstractControl,
    options?: {emitEvent?: boolean},
  ): void;
  addControl<K extends string & keyof TControl>(
    name: K,
    control: Required<TControl>[K],
    options?: {
      emitEvent?: boolean;
    },
  ): void;

  addControl<K extends string & keyof TControl>(
    name: K,
    control: Required<TControl>[K],
    options: {
      emitEvent?: boolean;
    } = {},
  ): void {
    this.registerControl(name, control);
    this.updateValueAndValidity({emitEvent: options.emitEvent});
    this._onCollectionChange();
  }

  removeControl(
    this: FormGroup<{[key: string]: AbstractControl<any>}>,
    name: string,
    options?: {
      emitEvent?: boolean;
    },
  ): void;
  removeControl<S extends string>(
    name: ɵOptionalKeys<TControl> & S,
    options?: {
      emitEvent?: boolean;
    },
  ): void;

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
  removeControl(name: string, options: {emitEvent?: boolean} = {}): void {
    if ((this.controls as any)[name])
      (this.controls as any)[name]._registerOnCollectionChange(() => {});
    delete (this.controls as any)[name];
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
  setControl<K extends string & keyof TControl>(
    name: K,
    control: TControl[K],
    options?: {
      emitEvent?: boolean;
    },
  ): void;
  setControl(
    this: FormGroup<{[key: string]: AbstractControl<any>}>,
    name: string,
    control: AbstractControl,
    options?: {emitEvent?: boolean},
  ): void;

  setControl<K extends string & keyof TControl>(
    name: K,
    control: TControl[K],
    options: {
      emitEvent?: boolean;
    } = {},
  ): void {
    if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
    delete this.controls[name];
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
  contains<K extends string>(controlName: K): boolean;
  contains(this: FormGroup<{[key: string]: AbstractControl<any>}>, controlName: string): boolean;

  contains<K extends string & keyof TControl>(controlName: K): boolean {
    return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
  }

  /**
   * Sets the value of the `FormGroup`. It accepts an object that matches
   * the structure of the group, with control names as keys.
   *
   * @usageNotes
   * ### Set the complete value for the form group
   *
   * ```ts
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
  override setValue(
    value: ɵFormGroupRawValue<TControl>,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {},
  ): void {
    assertAllValuesPresent(this, true, value);
    (Object.keys(value) as Array<keyof TControl>).forEach((name) => {
      assertControlPresent(this, true, name as any);
      (this.controls as any)[name].setValue((value as any)[name], {
        onlySelf: true,
        emitEvent: options.emitEvent,
      });
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
   * ```ts
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
  override patchValue(
    value: ɵFormGroupValue<TControl>,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {},
  ): void {
    // Even though the `value` argument type doesn't allow `null` and `undefined` values, the
    // `patchValue` can be called recursively and inner data structures might have these values, so
    // we just ignore such cases when a field containing FormGroup instance receives `null` or
    // `undefined` as a value.
    if (value == null /* both `null` and `undefined` */) return;
    (Object.keys(value) as Array<keyof TControl>).forEach((name) => {
      // The compiler cannot see through the uninstantiated conditional type of `this.controls`, so
      // `as any` is required.
      const control = (this.controls as any)[name];
      if (control) {
        control.patchValue(
          /* Guaranteed to be present, due to the outer forEach. */ value[
            name as keyof ɵFormGroupValue<TControl>
          ]!,
          {onlySelf: true, emitEvent: options.emitEvent},
        );
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
   * ```ts
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
    value: ɵTypedOrUntyped<TControl, ɵFormGroupArgumentValue<TControl>, any> = {},
    options: {onlySelf?: boolean; emitEvent?: boolean} = {},
  ): void {
    this._forEachChild((control: AbstractControl, name) => {
      control.reset(value ? (value as any)[name] : null, {
        onlySelf: true,
        emitEvent: options.emitEvent,
      });
    });
    this._updatePristine(options, this);
    this._updateTouched(options, this);
    this.updateValueAndValidity(options);
  }

  /**
   * The aggregate value of the `FormGroup`, including any disabled controls.
   *
   * Retrieves all values regardless of disabled status.
   */
  override getRawValue(): ɵTypedOrUntyped<TControl, ɵFormGroupRawValue<TControl>, any> {
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
    Object.keys(this.controls).forEach((key) => {
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
    (this as Writable<this>).value = this._reduceValue() as any;
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
  _reduceValue(): Partial<TControl> {
    let acc: Partial<TControl> = {};
    return this._reduceChildren(acc, (acc, control, name) => {
      if (control.enabled || this.disabled) {
        acc[name] = control.value;
      }
      return acc;
    });
  }

  /** @internal */
  _reduceChildren<T, K extends keyof TControl>(
    initValue: T,
    fn: (acc: T, control: TControl[K], name: K) => T,
  ): T {
    let res = initValue;
    this._forEachChild((control: TControl[K], name: K) => {
      res = fn(res, control, name);
    });
    return res;
  }

  /** @internal */
  override _allControlsDisabled(): boolean {
    for (const controlName of Object.keys(this.controls) as Array<keyof TControl>) {
      if ((this.controls as any)[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(this.controls).length > 0 || this.disabled;
  }

  /** @internal */
  override _find(name: string | number): AbstractControl | null {
    return this.controls.hasOwnProperty(name as string)
      ? (this.controls as any)[name as keyof TControl]
      : null;
  }
}

/**
 * Will validate that none of the controls has a key with a dot
 * Throws other wise
 */
function validateFormGroupControls<TControl>(controls: {
  [K in keyof TControl]: AbstractControl<any, any>;
}) {
  const invalidKeys = Object.keys(controls).filter((key) => key.includes('.'));
  if (invalidKeys.length > 0) {
    // TODO: make this an error once there are no more uses in G3
    console.warn(
      `FormGroup keys cannot include \`.\`, please replace the keys for: ${invalidKeys.join(',')}.`,
    );
  }
}

interface UntypedFormGroupCtor {
  new (
    controls: {[key: string]: AbstractControl},
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  ): UntypedFormGroup;

  /**
   * The presence of an explicit `prototype` property provides backwards-compatibility for apps that
   * manually inspect the prototype chain.
   */
  prototype: FormGroup<any>;
}

/**
 * UntypedFormGroup is a non-strongly-typed version of `FormGroup`.
 */
export type UntypedFormGroup = FormGroup<any>;

export const UntypedFormGroup: UntypedFormGroupCtor = FormGroup;

/**
 * @description
 * Asserts that the given control is an instance of `FormGroup`
 *
 * @publicApi
 */
export const isFormGroup = (control: unknown): control is FormGroup => control instanceof FormGroup;

/**
 * Tracks the value and validity state of a collection of `FormControl` instances, each of which has
 * the same value type.
 *
 * `FormRecord` is very similar to {@link FormGroup}, except it can be used with a dynamic keys,
 * with controls added and removed as needed.
 *
 * `FormRecord` accepts one generic argument, which describes the type of the controls it contains.
 *
 * @usageNotes
 *
 * ```ts
 * let numbers = new FormRecord({bill: new FormControl('415-123-456')});
 * numbers.addControl('bob', new FormControl('415-234-567'));
 * numbers.removeControl('bill');
 * ```
 *
 * @publicApi
 */
export class FormRecord<TControl extends AbstractControl = AbstractControl> extends FormGroup<{
  [key: string]: TControl;
}> {}

export interface FormRecord<TControl> {
  /**
   * Registers a control with the records's list of controls.
   *
   * See `FormGroup#registerControl` for additional information.
   */
  registerControl(name: string, control: TControl): TControl;

  /**
   * Add a control to this group.
   *
   * See `FormGroup#addControl` for additional information.
   */
  addControl(name: string, control: TControl, options?: {emitEvent?: boolean}): void;

  /**
   * Remove a control from this group.
   *
   * See `FormGroup#removeControl` for additional information.
   */
  removeControl(name: string, options?: {emitEvent?: boolean}): void;

  /**
   * Replace an existing control.
   *
   * See `FormGroup#setControl` for additional information.
   */
  setControl(name: string, control: TControl, options?: {emitEvent?: boolean}): void;

  /**
   * Check whether there is an enabled control with the given name in the group.
   *
   * See `FormGroup#contains` for additional information.
   */
  contains(controlName: string): boolean;

  /**
   * Sets the value of the `FormRecord`. It accepts an object that matches
   * the structure of the group, with control names as keys.
   *
   * See `FormGroup#setValue` for additional information.
   */
  setValue(
    value: {[key: string]: ɵRawValue<TControl>},
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    },
  ): void;

  /**
   * Patches the value of the `FormRecord`. It accepts an object with control
   * names as keys, and does its best to match the values to the correct controls
   * in the group.
   *
   * See `FormGroup#patchValue` for additional information.
   */
  patchValue(
    value: {[key: string]: ɵValue<TControl>},
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    },
  ): void;

  /**
   * Resets the `FormRecord`, marks all descendants `pristine` and `untouched` and sets
   * the value of all descendants to null.
   *
   * See `FormGroup#reset` for additional information.
   */
  reset(
    value?: {[key: string]: ɵValue<TControl> | FormControlState<ɵValue<TControl>>},
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    },
  ): void;

  /**
   * The aggregate value of the `FormRecord`, including any disabled controls.
   *
   * See `FormGroup#getRawValue` for additional information.
   */
  getRawValue(): {[key: string]: ɵRawValue<TControl>};
}

/**
 * @description
 * Asserts that the given control is an instance of `FormRecord`
 *
 * @publicApi
 */
export const isFormRecord = (control: unknown): control is FormRecord =>
  control instanceof FormRecord;
