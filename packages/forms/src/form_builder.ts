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
import {AbstractControl, AbstractControlOptions, FormArray, FormControl, FormGroup, FormHooks} from './model';

function isAbstractControlOptions(options: AbstractControlOptions|
                                  {[key: string]: any}): options is AbstractControlOptions {
  return (<AbstractControlOptions>options).asyncValidators !== undefined ||
      (<AbstractControlOptions>options).validators !== undefined ||
      (<AbstractControlOptions>options).updateOn !== undefined;
}

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
@Injectable({providedIn: ReactiveFormsModule})
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
  group(
      controlsConfig: {[key: string]: any},
      options?: AbstractControlOptions|null,
      ): FormGroup;
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
  group(
      controlsConfig: {[key: string]: any},
      options: {[key: string]: any},
      ): FormGroup;
  group(
      controlsConfig: {[key: string]: any},
      options: AbstractControlOptions|{[key: string]: any}|null = null): FormGroup {
    const controls = this._reduceControls(controlsConfig);

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

    return new FormGroup(controls, {asyncValidators, updateOn, validators});
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
  control(
      formState: any, validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormControl {
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
  array(
      controlsConfig: any[],
      validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): FormArray {
    const controls = controlsConfig.map(c => this._createControl(c));
    return new FormArray(controls, validatorOrOpts, asyncValidator);
  }

  /** @internal */
  _reduceControls(controlsConfig: {[k: string]: any}): {[key: string]: AbstractControl} {
    const controls: {[key: string]: AbstractControl} = {};
    Object.keys(controlsConfig).forEach(controlName => {
      controls[controlName] = this._createControl(controlsConfig[controlName]);
    });
    return controls;
  }

  /** @internal */
  _createControl(controlConfig: any): AbstractControl {
    if (controlConfig instanceof FormControl || controlConfig instanceof FormGroup ||
        controlConfig instanceof FormArray) {
      return controlConfig;

    } else if (Array.isArray(controlConfig)) {
      const value = controlConfig[0];
      const validator: ValidatorFn = controlConfig.length > 1 ? controlConfig[1] : null;
      const asyncValidator: AsyncValidatorFn = controlConfig.length > 2 ? controlConfig[2] : null;
      return this.control(value, validator, asyncValidator);

    } else {
      return this.control(controlConfig);
    }
  }
}
