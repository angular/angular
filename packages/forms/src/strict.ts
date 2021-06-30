/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';

import {AsyncValidatorFn, ValidatorFn} from './directives/validators';
import {AbstractControl, AbstractControlOptions, DISABLED, FormArray, FormControl, FormGroup, INVALID, PENDING, VALID,} from './model';

type FormStatus = typeof VALID|typeof INVALID|typeof PENDING|typeof DISABLED;

/**
 * Recursively make all form values optional, except for values of StrictFormControls.
 */
type PartialFormValue<T> = T extends StrictFormArray<infer U>?
    PartialFormArrayValue<U>:
    T extends StrictFormGroup<infer V>? PartialFormGroupValue<V>:
                                        T extends StrictFormControl<infer W>? W|undefined : never;

type PartialFormArrayValue<T> = Array<PartialFormValue<T>>;

type PartialFormGroupValue<T> = {
  [key in keyof T] +?: PartialFormValue<T[key]>;
};

/**
 * A deep required form value (the counterpart to `PartialFormValue`).
 */
type RequiredFormValue<T> = T extends StrictFormArray<infer U>?
    RequiredFormArrayValue<U>:
    T extends StrictFormGroup<infer V>? RequiredFormGroupValue<V>:
                                        T extends StrictFormControl<infer W>? W : never;

type RequiredFormArrayValue<T> = Array<RequiredFormValue<T>>;

type RequiredFormGroupValue<T> = {
  [key in keyof T] -?: RequiredFormValue<T[key]>;
};

/**
 * Either a StrictFormArray, StrictFormGroup or StrictFormControl.
 */
type GenericStrictFormElement<T> =
    T extends StrictFormArray<infer U>? StrictFormArray<U>: T extends StrictFormGroup<infer V>?
    StrictFormGroup<StrictFormGroupElements<V>>:
    T extends StrictFormControl<infer W>? StrictFormControl<W>: never;

type StrictFormGroupElements<T> = {
  [key in keyof T]: GenericStrictFormElement<T[key]>;
};

/**
 * In some methods of the Form Controls, you can either pass a raw value, or a value and a disabled
 * state.
 */
type InitialValue<T> =|T|{
  value: T;
  disabled: boolean;
};

/**
 * The type of the value that is passed as first parameter when resetting a StrictFormArray or
 * StrictFormGroup.
 */
type FormElementResetValue<T> = T extends StrictFormArray<infer U>?
    Array<FormElementResetValue<U>>:
    T extends StrictFormGroup<infer V>?
    FormGroupResetValue<V>:
    T extends StrictFormControl<infer W>? InitialValue<W>: never;

type FormGroupResetValue<T> = {
  [key in keyof T] -?: FormElementResetValue<T[key]>;
};

type ValueOf<T> = T[keyof T];

/**
 * Get only the keys that are optional.
 */
type OptionalKeys<T extends object> =
    Exclude<ValueOf<{[K in keyof T]: T extends Record<K, T[K]>? undefined : K}>, undefined>;

/**
 * A strictly typed version of `FormControl`, enforcing the definition of a "form model".
 *
 * @see `FormControl`
 * @see [Usage Notes](#usage-notes)
 *
 * @usageNotes
 *
 * ### Creating Strict Form Controls
 *
 * Instantiate a `StrictFormControl`, with an initial value.
 *
 * ```ts
 * const control = new StrictFormControl<string>('some value');
 * console.log(control.value); // 'some value'
 * ```
 *
 * The following example initializes the control with a form state object.
 *
 * ```ts
 * const control = new StrictFormControl<string>({ value: 'n/a', disabled: true });
 * console.log(control.value);  // 'n/a'
 * console.log(control.status); // 'DISABLED
 * ```
 *
 * @publicApi
 */
export class StrictFormControl<T> extends FormControl {
  readonly value: T|undefined;
  readonly valueChanges!: Observable<T>;

  readonly status!: FormStatus;
  readonly statusChanges!: Observable<FormStatus>;

  constructor(
      formState?: InitialValue<T>,
      validatorOrOpts?:|ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    super(formState, validatorOrOpts, asyncValidator);
  }

  setValue(value: T, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean;
  }): void {
    super.setValue(value, options);
  }

  patchValue(value: T, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
    emitModelToViewChange?: boolean;
    emitViewToModelChange?: boolean;
  }): void {
    super.patchValue(value, options);
  }

  reset(formState?: InitialValue<T>, options?: {onlySelf?: boolean; emitEvent?: boolean}): void {
    super.reset(formState, options);
  }
}

/**
 * A strictly typed version of `FormGroup`, enforcing the definition of a "form model".
 *
 * @see `FormGroup`
 * @see [Usage Notes](#usage-notes)
 *
 * @usageNotes
 *
 * ### Create a form group with 2 controls
 *
 * First, define the structure of the form (the "form model").
 *
 * ```ts
 * type MyFormModel = StrictFormGroup<Name>;

 * interface Name {
 *   firstName: StrictFormControl<string>;
 *   lastName: StrictFormControl<string>;
 * }
 * ```
 *
 * Then, create the actual form.
 *
 * ```ts
 * const form: MyFormModel = new StrictFormGroup<Name>({
 *   firstName: new StrictFormControl<string>('John'),
 *   lastName: new StrictFormControl<string>('Doe')
 * });
 * ```
 *
 * Now, you can access the individual controls of our nested form.
 *
 * ```ts
 * console.log(form.controls.firstName.value); // 'John'
 * ```
 *
 * ### Complex example with nested form elements
 *
 * First, define the "form model".
 *
 * ```ts
 * type MyFormModel = StrictFormGroup<ShoppingCheckout>;
 *
 * interface ShoppingCheckout {
 *   address: StrictFormGroup<Address>;
 *   cart: StrictFormArray<Cart>;
 * }
 *
 * interface Address {
 *   street: StrictFormControl<string>;
 *   streetNo: StrictFormControl<number>;
 *   country?: StrictFormControl<string>;
 * }
 *
 * type Cart = StrictFormGroup<CartEntry>;
 * interface CartEntry {
 *   product: StrictFormControl<Product>;
 *   quantity: StrictFormControl<number>;
 * }
 *
 * interface Product {
 *   productName: string;
 *   isAvailable: boolean;
 *   discount?: number;
 * }
 * ```
 *
 * Then, create the actual form.
 *
 * ```ts
 * const form: MyFormModel = new StrictFormGroup<ShoppingCheckout>({
 *   address: new StrictFormGroup<Address>({
 *     street: new StrictFormControl<string>('My Street'),
 *     streetNo: new StrictFormControl<number>(1),
 *   }),
 *   cart: new StrictFormArray<Cart>([])
 * });
 * ```
 *
 * @publicApi
 */
export class StrictFormGroup<T extends StrictFormGroupElements<T>> extends FormGroup {
  readonly value!: PartialFormGroupValue<T>;
  readonly valueChanges!: Observable<PartialFormGroupValue<T>>;

  readonly status!: FormStatus;
  readonly statusChanges!: Observable<FormStatus>;

  constructor(
      public controls: StrictFormGroupElements<T>,
      validatorOrOpts?:|ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  setValue(value: RequiredFormGroupValue<T>, options?: {onlySelf?: boolean; emitEvent?: boolean}):
      void {
    super.setValue(value, options);
  }

  patchValue(value: PartialFormGroupValue<T>, options?: {onlySelf?: boolean; emitEvent?: boolean}):
      void {
    super.patchValue(value, options);
  }

  reset(value?: FormGroupResetValue<T>, options?: {onlySelf?: boolean; emitEvent?: boolean}): void {
    super.reset(value, options);
  }

  // The Generic in this method and the following ones is used to provide a constraint to "control"
  // based on the provided "name".
  registerControl<K extends Extract<keyof T, string>>(
      name: K, control: GenericStrictFormElement<T[K]>): AbstractControl {
    return super.registerControl(name, control);
  }

  addControl<K extends Extract<keyof T, string>>(name: K, control: GenericStrictFormElement<T[K]>):
      void {
    super.addControl(name, control);
  }

  removeControl(name: Extract<OptionalKeys<T>, string>): void {
    super.removeControl(name);
  }

  setControl<K extends Extract<keyof T, string>>(name: K, control: GenericStrictFormElement<T[K]>):
      void {
    super.setControl(name, control);
  }

  contains(controlName: Extract<keyof T, string>): boolean {
    return super.contains(controlName);
  }
}

/**
 * A strictly typed version of `FormArray`, enforcing the definition of a "form model".
 *
 * @see `FormArray`
 * @see [Usage Notes](#usage-notes)
 *
 * @usageNotes
 *
 * ### Create an array of form controls
 *
 * First, define the structure of the form (the "form model").
 *
 * ```ts
 * type MyFormModel = StrictFormArray<Name>;
 *
 * type Name = StrictFormControl<string>;
 * ```
 *
 * Then, create the actual form.
 *
 * ```ts
 * const form: MyFormModel = new StrictFormArray<Name>([
 *   new StrictFormControl<string>('Nancy'),
 *   new StrictFormControl<string>('Drew'),
 * ]);
 *
 * console.log(form.controls[0].value); // 'Nancy'
 * ```
 *
 * @publicApi
 */
export class StrictFormArray<T> extends FormArray {
  readonly value!: PartialFormArrayValue<T>;
  readonly valueChanges!: Observable<PartialFormArrayValue<T>>;

  readonly status!: FormStatus;
  readonly statusChanges!: Observable<FormStatus>;

  constructor(
      public controls: Array<GenericStrictFormElement<T>>,
      validatorOrOpts?:|ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  at(index: number): GenericStrictFormElement<T> {
    return super.at(index) as GenericStrictFormElement<T>;
  }

  push(control: GenericStrictFormElement<T>): void {
    super.push(control);
  }

  insert(index: number, control: GenericStrictFormElement<T>): void {
    super.insert(index, control);
  }

  setControl(index: number, control: GenericStrictFormElement<T>): void {
    super.setControl(index, control);
  }

  setValue(value: RequiredFormArrayValue<T>, options?: {onlySelf?: boolean; emitEvent?: boolean}):
      void {
    super.setValue(value, options);
  }

  patchValue(value: PartialFormArrayValue<T>, options?: {onlySelf?: boolean; emitEvent?: boolean}):
      void {
    super.patchValue(value, options);
  }

  reset(value?: FormElementResetValue<T>, options?: {onlySelf?: boolean; emitEvent?: boolean}):
      void {
    super.reset(value, options);
  }
}