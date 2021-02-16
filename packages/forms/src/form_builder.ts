/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {AsyncValidatorFn, ValidatorFn} from './directives/validators';
import {AbstractControl, AbstractControlOptions, FormArray, FormControl, FormControlState, FormGroup, FormHooks, FormSection} from './model';

function isAbstractControlOptions<T extends AbstractControl>(
    options: AbstractControlOptions<T>|{[key: string]: any}): options is AbstractControlOptions<T> {
  return (<AbstractControlOptions>options).asyncValidators !== undefined ||
      (<AbstractControlOptions>options).validators !== undefined ||
      (<AbstractControlOptions>options).updateOn !== undefined;
}

type FormControlConfig<T> = FormControlState<T>
  | [
    FormControlState<T>,
    (ValidatorFn<FormControl<T>> | ValidatorFn<FormControl<T>>[] | AbstractControlOptions<FormControl<T>>)?,
    (AsyncValidatorFn<FormControl<T>> | AsyncValidatorFn<FormControl<T>>[])?
  ];

type ConfigToForm<T extends {[key: string]: AbstractControl | FormControlConfig<any>}> = [{
  [K in keyof T]: (T[K] extends AbstractControl ? T[K] : T[K] extends FormControlConfig<infer U>?
                       FormControl<U>:
                       never)
}][0];

/**
 * @description
 * Creates an `AbstractControl` from a user-specified configuration.
 *
 * The `FormBuilder` provides syntactic sugar that shortens creating instances of a `FormControl`,
 * `FormGroup`, or `FormArray`. It reduces the amount of boilerplate needed to build complex
 * forms.
 *
 * @see [Reactive Forms Guide](/guide/reactive-forms)
 *
 * @publicApi
 */
@Injectable()
export class FormBuilder {
  /**
   * @description
   * Construct a new `FormGroup` instance.
   *
   * @param controlsConfig A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param options Configuration options object for the `FormGroup`. The object should have the
   * the `AbstractControlOptions` type and might contain the following fields:
   * * `validators`: A synchronous validator function, or an array of validator functions
   * * `asyncValidators`: A single async validator or array of async validator functions
   * * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur' |
   * submit')
   */
  group<T extends AbstractControl>(
      controlsConfig: {[key: string]: T},
      options?: AbstractControlOptions<FormGroup<T>>|null): FormGroup<T>;
  /**
   * @description
   * Construct a new `FormGroup` instance.
   *
   * @deprecated This API is not typesafe and can result in issues with Closure Compiler renaming.
   * Use the `FormBuilder#group` overload with `AbstractControlOptions` instead.
   * Note that `AbstractControlOptions` expects `validators` and `asyncValidators` to be valid
   * validators. If you have custom validators, make sure their validation function parameter is
   * `AbstractControl` and not a sub-class, such as `FormGroup`. These functions will be called with
   * an object of type `AbstractControl` and that cannot be automatically downcast to a subclass, so
   * TypeScript sees this as an error. For example, change the `(group: FormGroup) =>
   * ValidationErrors|null` signature to be `(group: AbstractControl) => ValidationErrors|null`.
   *
   * @param controlsConfig A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param options Configuration options object for the `FormGroup`. The legacy configuration
   * object consists of:
   * * `validator`: A synchronous validator function, or an array of validator functions
   * * `asyncValidator`: A single async validator or array of async validator functions
   * Note: the legacy format is deprecated and might be removed in one of the next major versions
   * of Angular.
   */
  group<T extends AbstractControl>(
      controlsConfig: {[key: string]: T}, options: {[key: string]: any}): FormGroup<T>;
  /**
   * @description
   * Construct a new `FormGroup` instance.
   *
   * @param controlsConfig A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param options Configuration options object for the `FormGroup`. The object should have the
   * the `AbstractControlOptions` type and might contain the following fields:
   * * `validators`: A synchronous validator function, or an array of validator functions
   * * `asyncValidators`: A single async validator or array of async validator functions
   * * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur' |
   * submit')
   */
  group<T>(
      controlsConfig: {[key: string]: FormControlConfig<T>},
      options?: AbstractControlOptions<FormGroup<FormControl<T>>>|null): FormGroup<FormControl<T>>;
  /**
   * @description
   * Construct a new `FormGroup` instance.
   *
   * @deprecated This API is not typesafe and can result in issues with Closure Compiler renaming.
   * Use the `FormBuilder#group` overload with `AbstractControlOptions` instead.
   * Note that `AbstractControlOptions` expects `validators` and `asyncValidators` to be valid
   * validators. If you have custom validators, make sure their validation function parameter is
   * `AbstractControl` and not a sub-class, such as `FormGroup`. These functions will be called with
   * an object of type `AbstractControl` and that cannot be automatically downcast to a subclass, so
   * TypeScript sees this as an error. For example, change the `(group: FormGroup) =>
   * ValidationErrors|null` signature to be `(group: AbstractControl) => ValidationErrors|null`.
   *
   * @param controlsConfig A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param options Configuration options object for the `FormGroup`. The legacy configuration
   * object consists of:
   * * `validator`: A synchronous validator function, or an array of validator functions
   * * `asyncValidator`: A single async validator or array of async validator functions
   * Note: the legacy format is deprecated and might be removed in one of the next major versions
   * of Angular.
   */
  group<T>(controlsConfig: {[key: string]: FormControlConfig<T>}, options: {[key: string]: any}):
      FormGroup<FormControl<T>>;
  group(
      controlsConfig: {[key: string]: any},
      options: AbstractControlOptions<FormGroup<any>>|{[key: string]: any}|
      null = null): FormGroup<any> {
    return new FormGroup(this._reduceControls(controlsConfig), this._normalizeOptions(options));
  }

  /**
   * @description
   * Construct a new `FormSection` instance.
   *
   * @param controlsConfig A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param options Configuration options object for the `FormSection`. The object should have the
   * the `AbstractControlOptions` type and might contain the following fields:
   * * `validators`: A synchronous validator function, or an array of validator functions
   * * `asyncValidators`: A single async validator or array of async validator functions
   * * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur' |
   * submit')
   */
  section<T extends {[key: string]: AbstractControl | FormControlConfig<any>}>(
      controlsConfig: T, options?: AbstractControlOptions<FormSection<ConfigToForm<T>>>|null):
      FormSection<ConfigToForm<T>>;
  /**
   * @description
   * Construct a new `FormSection` instance.
   *
   * @deprecated This API is not typesafe and can result in issues with Closure Compiler renaming.
   * Use the `FormBuilder#section` overload with `AbstractControlOptions` instead.
   * Note that `AbstractControlOptions` expects `validators` and `asyncValidators` to be valid
   * validators. If you have custom validators, make sure their validation function parameter is
   * `AbstractControl` and not a sub-class, such as `FormSection`. These functions will be called
   * with an object of type `AbstractControl` and that cannot be automatically downcast to a
   * subclass, so TypeScript sees this as an error. For example, change the `(section: FormSection)
   * => ValidationErrors|null` signature to be `(section: AbstractControl) =>
   * ValidationErrors|null`.
   *
   * @param controlsConfig A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param options Configuration options object for the `FormSection`. The legacy configuration
   * object consists of:
   * * `validator`: A synchronous validator function, or an array of validator functions
   * * `asyncValidator`: A single async validator or array of async validator functions
   * Note: the legacy format is deprecated and might be removed in one of the next major versions
   * of Angular.
   */
  section<T extends {[key: string]: AbstractControl | FormControlConfig<any>}>(
      controlsConfig: T, options: {[key: string]: any}): FormSection<ConfigToForm<T>>;
  section(
      controlsConfig: {[key: string]: any},
      options: AbstractControlOptions<FormSection<any>>|{[key: string]: any}|null = null) {
    return new FormSection(this._reduceControls(controlsConfig), this._normalizeOptions(options));
  }

  /**
   * @description
   * Construct a new `FormControl` with the given state, validators and options.
   *
   * @param formState Initializes the control with an initial state value, or
   * with an object that contains both a value and a disabled status.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains
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
  control<T = any>(
      formState: FormControlState<T>,
      validatorOrOpts?: ValidatorFn<FormControl<T>>|ValidatorFn<FormControl<T>>[]|
      AbstractControlOptions<FormControl<T>>|null,
      asyncValidator?: AsyncValidatorFn<FormControl<T>>|AsyncValidatorFn<FormControl<T>>[]|
      null): FormControl<T> {
    return new FormControl(formState, validatorOrOpts, asyncValidator);
  }

  /**
   * Constructs a new `FormArray` from the given array of configurations,
   * validators and options.
   *
   * @param controlsConfig An array of child controls or control configs. Each
   * child control is given an index when it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains
   * validation functions and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator
   * functions.
   */
  array<T extends AbstractControl = AbstractControl>(
      controlsConfig: T[],
      validatorOrOpts?: ValidatorFn<FormArray<T>>|ValidatorFn<FormArray<T>>[]|
      AbstractControlOptions<FormArray<T>>|null,
      asyncValidator?: AsyncValidatorFn<FormArray<T>>|AsyncValidatorFn<FormArray<T>>[]|
      null): FormArray<T>;
  array<T>(
      controlsConfig: FormControlConfig<T>[],
      validatorOrOpts?: ValidatorFn<FormArray<FormControl<T>>>|
      ValidatorFn<FormArray<FormControl<T>>>[]|AbstractControlOptions<FormArray<FormControl<T>>>|
      null,
      asyncValidator?: AsyncValidatorFn<FormArray<FormControl<T>>>|
      AsyncValidatorFn<FormArray<FormControl<T>>>[]|null): FormArray<FormControl<T>>;
  array(
      controlsConfig: any[],
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormArray<any> {
    const controls = controlsConfig.map(c => this._createControl(c));
    return new FormArray(controls, validatorOrOpts, asyncValidator);
  }

  /** @internal */
  _normalizeOptions<T extends AbstractControl>(options?: AbstractControlOptions<T>|
                                               {[key: string]: any}|
                                               null): AbstractControlOptions<T> {
    let validators: ValidatorFn|ValidatorFn[]|null = null;
    let asyncValidators: AsyncValidatorFn|AsyncValidatorFn[]|null = null;
    let updateOn: FormHooks|undefined = undefined;

    if (options != null) {
      if (isAbstractControlOptions(options)) {
        // `options` are `AbstractControlOptions`
        validators = options.validators != null ? options.validators : null;
        asyncValidators = options.asyncValidators != null ? options.asyncValidators : null;
        updateOn = options.updateOn != null ? options.updateOn : undefined;
      } else {
        // `options` are legacy form group options
        validators = options['validator'] != null ? options['validator'] : null;
        asyncValidators = options['asyncValidator'] != null ? options['asyncValidator'] : null;
      }
    }

    return {asyncValidators, updateOn, validators};
  }

  /** @internal */
  _reduceControls(controlsConfig: {[key: string]: any}): {[key: string]: AbstractControl} {
    const controls: {[key: string]: AbstractControl} = {};
    Object.keys(controlsConfig).forEach(controlName => {
      controls[controlName] = this._createControl(controlsConfig[controlName]);
    });
    return controls;
  }

  /** @internal */
  _createControl<T extends AbstractControl>(controlConfig: T): T;
  /** @internal */
  _createControl<T>(controlConfig: FormControlConfig<T>): FormControl<T>;
  /** @internal */
  _createControl<T>(controlConfig: AbstractControl|FormControlConfig<T>) {
    if (controlConfig instanceof FormControl || controlConfig instanceof FormGroup ||
        controlConfig instanceof FormArray || controlConfig instanceof FormSection) {
      return controlConfig;

    } else if (Array.isArray(controlConfig)) {
      const value = controlConfig[0];
      const validator = controlConfig.length > 1 ? controlConfig[1] : null;
      const asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null;
      return this.control(value, validator, asyncValidator);

    } else {
      return this.control(controlConfig);
    }
  }
}
