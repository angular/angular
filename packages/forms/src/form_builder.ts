/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {AsyncValidatorFn, ValidatorFn} from './directives/validators';
import {ReactiveFormsModule} from './form_providers';
import {AbstractControl, AbstractControlOptions, FormHooks} from './model/abstract_model';
import {FormArray, UntypedFormArray} from './model/form_array';
import {FormControl, FormControlOptions, FormControlState, UntypedFormControl} from './model/form_control';
import {FormGroup, UntypedFormGroup} from './model/form_group';

function isAbstractControlOptions(options: AbstractControlOptions|{[key: string]: any}|null|
                                  undefined): options is AbstractControlOptions {
  return !!options &&
      ((options as AbstractControlOptions).asyncValidators !== undefined ||
       (options as AbstractControlOptions).validators !== undefined ||
       (options as AbstractControlOptions).updateOn !== undefined);
}

function isFormControlOptions(options: FormControlOptions|{[key: string]: any}|null|
                              undefined): options is FormControlOptions {
  return !!options &&
      (isAbstractControlOptions(options) ||
       (options as FormControlOptions).initialValueIsDefault !== undefined);
}

/**
 * ControlConfig<T> is a tuple containing a value of type T, plus optional validators and async
 * validators.
 *
 * @publicApi
 */
export type ControlConfig<T> = [T|FormControlState<T>, (ValidatorFn|(ValidatorFn[]))?, (AsyncValidatorFn|AsyncValidatorFn[])?];

// Disable clang-format to produce clearer formatting for these multiline types.
// clang-format off

/**
 * FormBuilder accepts values in various container shapes, as well as raw values.
 * Element returns the appropriate corresponding model class.
 */
export type ɵElement<T> =
  T extends FormControl<infer U> ? FormControl<U> :
  T extends FormGroup<infer U> ? FormGroup<U> :
  T extends FormArray<infer U> ? FormArray<U> :
  T extends AbstractControl<infer U> ? AbstractControl<U> :
  T extends FormControlState<infer U> ? FormControl<U|null> :
  T extends ControlConfig<infer U> ? FormControl<U|null> :
  // ControlConfig can be too much for the compiler to infer in the wrapped case. This is
  // not surprising, since it's practically death-by-polymorphism (e.g. the optional validators
  // members that might be arrays). Watch for ControlConfigs that might fall through.
  T extends Array<infer U|ValidatorFn|ValidatorFn[]|AsyncValidatorFn|AsyncValidatorFn[]> ? FormControl<U|null> :
  // Fallthough case: T is not a container type; use is directly as a value.
  FormControl<T|null>;

// clang-format on

/**
 * @description
 * Creates an `AbstractControl` from a user-specified configuration.
 *
 * The `FormBuilder` provides syntactic sugar that shortens creating instances of a
 * `FormControl`, `FormGroup`, or `FormArray`. It reduces the amount of boilerplate needed to
 * build complex forms.
 *
 * @see [Reactive Forms Guide](guide/reactive-forms)
 *
 * @publicApi
 */
@Injectable({providedIn: ReactiveFormsModule})
export class FormBuilder {
  group<T extends {}>(
      controls: T,
      options?: AbstractControlOptions|null,
      ): FormGroup<{[K in keyof T]: ɵElement<T[K]>}>;

  /**
   * @description
   * Construct a new `FormGroup` instance.
   *
   * @deprecated This API is not typesafe and can result in issues with Closure Compiler renaming.
   * Use the `FormBuilder#group` overload with `AbstractControlOptions` instead.
   * Note that `AbstractControlOptions` expects `validators` and `asyncValidators` to be valid
   * validators. If you have custom validators, make sure their validation function parameter is
   * `AbstractControl` and not a sub-class, such as `FormGroup`. These functions will be called
   * with an object of type `AbstractControl` and that cannot be automatically downcast to a
   * subclass, so TypeScript sees this as an error. For example, change the `(group: FormGroup) =>
   * ValidationErrors|null` signature to be `(group: AbstractControl) => ValidationErrors|null`.
   *
   * @param controls A record of child controls. The key for each child is the name
   * under which the control is registered.
   *
   * @param options Configuration options object for the `FormGroup`. The legacy configuration
   * object consists of:
   * * `validator`: A synchronous validator function, or an array of validator functions.
   * * `asyncValidator`: A single async validator or array of async validator functions
   * Note: the legacy format is deprecated and might be removed in one of the next major versions
   * of Angular.
   */
  group(
      controls: {[key: string]: any},
      options: {[key: string]: any},
      ): FormGroup;

  /**
   * @description
   * Construct a new `FormGroup` instance.
   *
   * @param controls A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param options Configuration options object for the `FormGroup`. The object should have the
   * `AbstractControlOptions` type and might contain the following fields:
   * * `validators`: A synchronous validator function, or an array of validator functions.
   * * `asyncValidators`: A single async validator or array of async validator functions.
   * * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur'
   * | submit').
   */
  group(controls: {[key: string]: any}, options: AbstractControlOptions|{[key: string]:
                                                                             any}|null = null):
      FormGroup {
    const reducedControls = this._reduceControls(controls);

    let validators: ValidatorFn|ValidatorFn[]|null = null;
    let asyncValidators: AsyncValidatorFn|AsyncValidatorFn[]|null = null;
    let updateOn: FormHooks|undefined = undefined;

    if (options !== null) {
      if (isAbstractControlOptions(options)) {
        // `options` are `AbstractControlOptions`
        validators = options.validators != null ? options.validators : null;
        asyncValidators = options.asyncValidators != null ? options.asyncValidators : null;
        updateOn = options.updateOn != null ? options.updateOn : undefined;
      } else {
        // `options` are legacy form group options
        validators = (options as any)['validator'] != null ? (options as any)['validator'] : null;
        asyncValidators =
            (options as any)['asyncValidator'] != null ? (options as any)['asyncValidator'] : null;
      }
    }

    // Cast to `any` because the inferred types are not as specific as Element.
    return new FormGroup(reducedControls, {asyncValidators, updateOn, validators}) as any;
  }

  control<T>(formState: T|FormControlState<T>, opts: FormControlOptions&{
    initialValueIsDefault: true
  }): FormControl<T>;

  control<T>(
      formState: T|FormControlState<T>,
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormControl<T|null>;

  /**
   * @description
   * Construct a new `FormControl` with the given state, validators and options. Set
   * `{initialValueIsDefault: true}` in the options to get a non-nullable control. Otherwise, the
   * control will be nullable.
   *
   * @param formState Initializes the control with an initial state value, or
   * with an object that contains both a value and a disabled status.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or a `FormControlOptions` object that contains
   * validation functions and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator
   * functions.
   *
   * @usageNotes
   *
   * ### Initialize a control as disabled
   *
   * The following example returns a control with an initial value in a disabled state.
   *
   * <code-example path="forms/ts/formBuilder/form_builder_example.ts" region="disabled-control">
   * </code-example>
   */
  control<T>(
      formState: T|FormControlState<T>,
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormControl {
    return new FormControl(formState, validatorOrOpts, asyncValidator);
  }

  /**
   * Constructs a new `FormArray` from the given array of configurations,
   * validators and options.
   *
   * @param controls An array of child controls or control configs. Each child control is given an
   *     index when it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of such functions, or an
   *     `AbstractControlOptions` object that contains
   * validation functions and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions.
   */
  array<T>(
      controls: Array<T>, validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormArray<ɵElement<T>> {
    const createdControls = controls.map(c => this._createControl(c));
    // Cast to `any` because the inferred types are not as specific as Element.
    return new FormArray(createdControls, validatorOrOpts, asyncValidator) as any;
  }

  /** @internal */
  _reduceControls<T>(controls:
                         {[k: string]: T|ControlConfig<T>|FormControlState<T>|AbstractControl<T>}):
      {[key: string]: AbstractControl} {
    const createdControls: {[key: string]: AbstractControl} = {};
    Object.keys(controls).forEach(controlName => {
      createdControls[controlName] = this._createControl(controls[controlName]);
    });
    return createdControls;
  }

  /** @internal */
  _createControl<T>(controls: T|FormControlState<T>|ControlConfig<T>|FormControl<T>|
                    AbstractControl<T>): FormControl<T>|FormControl<T|null>|AbstractControl<T> {
    if (controls instanceof FormControl) {
      return controls as FormControl<T>;
    } else if (controls instanceof AbstractControl) {  // A control; just return it
      return controls;
    } else if (Array.isArray(controls)) {  // ControlConfig Tuple
      const value: T|FormControlState<T> = controls[0];
      const validator: ValidatorFn|ValidatorFn[]|null = controls.length > 1 ? controls[1]! : null;
      const asyncValidator: AsyncValidatorFn|AsyncValidatorFn[]|null =
          controls.length > 2 ? controls[2]! : null;
      return this.control<T>(value, validator, asyncValidator);
    } else {  // T or FormControlState<T>
      return this.control<T>(controls);
    }
  }
}

/**
 * UntypedFormBuilder is the same as @see FormBuilder, but it provides untyped controls.
 */
@Injectable({providedIn: ReactiveFormsModule})
export class UntypedFormBuilder extends FormBuilder {
  /**
   * @see FormBuilder#group
   */
  override group(
      controlsConfig: {[key: string]: any},
      options?: AbstractControlOptions|null,
      ): UntypedFormGroup;

  /**
   * @deprecated This API is not typesafe and can result in issues with Closure Compiler renaming.
   * Use the `FormBuilder#group` overload with `AbstractControlOptions` instead.
   */
  override group(
      controlsConfig: {[key: string]: any},
      options: {[key: string]: any},
      ): UntypedFormGroup;

  override group(
      controlsConfig: {[key: string]: any},
      options: AbstractControlOptions|{[key: string]: any}|null = null): UntypedFormGroup {
    return super.group(controlsConfig, options);
  }

  /**
   * @see FormBuilder#control
   */
  override control(
      formState: any, validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): UntypedFormControl {
    return super.control(formState, validatorOrOpts, asyncValidator);
  }

  /**
   * @see FormBuilder#array
   */
  override array(
      controlsConfig: any[],
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): UntypedFormArray {
    return super.array(controlsConfig, validatorOrOpts, asyncValidator);
  }
}
