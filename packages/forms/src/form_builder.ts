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
import {AbstractControl, AbstractControlOptions, FormArray, FormControl, FormControlOptions, FormGroup, FormHooks, FormState, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from './model';

function isAbstractControlOptions(options: AbstractControlOptions|
                                  {[key: string]: any}): options is AbstractControlOptions {
  return (<AbstractControlOptions>options).asyncValidators !== undefined ||
      (<AbstractControlOptions>options).validators !== undefined ||
      (<AbstractControlOptions>options).updateOn !== undefined;
}

/**
 * ControlConfig<T> is a tuple containing a value of type T, plus optional validators and async
 * validators.
 *
 * @publicApi
 */
 export type ControlConfig<T> = [T|FormState<T>, (ValidatorFn|(ValidatorFn[]))?, (AsyncValidatorFn|AsyncValidatorFn[])?];

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
   /**
    * @description
    * Construct a new `FormGroup` instance.
    *
    * @param cc A collection of child controls. The key for each child is the name
    * under which it is registered.
    *
    * @param options Configuration options object for the `FormGroup`. The object should have the
    * `AbstractControlOptions` type and might contain the following fields:
    * * `validators`: A synchronous validator function, or an array of validator functions.
    * * `asyncValidators`: A single async validator or array of async validator functions.
    * * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur' |
    * submit').
    */
   group<T extends {[key: string]: any} = {[key: string]: any}>(
       controls: {
         // We include FormControl before AbstractControl because types are inferred in order, and
         // we prefer to infer the most specific type.
         [K in keyof T]: FormState<T[K]>|ControlConfig<T[K]>|FormControl<T[K]>|
         AbstractControl<T[K]>|T[K]
       },
       options?: AbstractControlOptions|null,
       ): FormGroup<{[K in keyof T]: AbstractControl<T[K]>}>;

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
         validators = options['validator'] != null ? options['validator'] : null;
         asyncValidators = options['asyncValidator'] != null ? options['asyncValidator'] : null;
       }
     }

     return new FormGroup(reducedControls, {asyncValidators, updateOn, validators});
   }

   // This signature captures calls which set `initialValueIsDefault: true`.
   control<T = any>(formState: T|FormState<T>, opts: FormControlOptions&{
     initialValueIsDefault: true
   }): FormControl<T>;

   control<T = any>(
       formState: T|FormState<T>,
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
   control<T = any>(
       formState: T|FormState<T>,
       validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
       asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|
       null): FormControl<T|null>|FormControl<T> {
     return new FormControl(formState, validatorOrOpts, asyncValidator);
   }

   /**
    * Constructs a new `FormArray` from the given array of configurations,
    * validators and options.
    *
    * @param cc An array of child controls or control configs. Each child control is given an index
    *     when it is registered.
    *
    * @param validatorOrOpts A synchronous validator function, or an array of such functions, or an
    *     `AbstractControlOptions` object that contains
    * validation functions and a validation trigger.
    *
    * @param asyncValidator A single async validator or array of async validator functions.
    */
   array<T = AbstractControl<any>>(
       controls: Array<T|FormState<T>|ControlConfig<T>|AbstractControl<T>|FormControl<T>>,
       validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
       asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|
       null): FormArray<AbstractControl<T|null>> {
     const createdControls = controls.map(c => this._createControl(c));
     return new FormArray(createdControls, validatorOrOpts, asyncValidator);
   }

   /** @internal */
   _reduceControls<T>(controls: {[k: string]: T|ControlConfig<T>|FormState<T>|AbstractControl<T>}):
       {[key: string]: AbstractControl} {
     const createdControls: {[key: string]: AbstractControl} = {};
     Object.keys(controls).forEach(controlName => {
       createdControls[controlName] = this._createControl(controls[controlName]);
     });
     return createdControls;
   }

   /** @internal */
   _createControl<T>(controls: T|FormState<T>|ControlConfig<T>|AbstractControl<T>|
                     FormControl<T>): AbstractControl<T>|AbstractControl<T|null> {
     if (controls instanceof FormControl) {
       return controls as FormControl<T>;
     } else if (controls instanceof AbstractControl) {  // A control; just return it
       return controls;

     } else if (Array.isArray(controls)) {  // ControlConfig Tuple
       const value: T|FormState<T> = controls[0];
       const validator: ValidatorFn|ValidatorFn[]|null = controls.length > 1 ? controls[1]! : null;
       const asyncValidator: AsyncValidatorFn|AsyncValidatorFn[]|null =
           controls.length > 2 ? controls[2]! : null;
       return this.control<T>(value, validator, asyncValidator);

     } else {  // T or FormState<T>
       return this.control<T>(controls);
     }
   }
 }

 /**
  * UntypedFormBuilder is the same as @see FormBuilder, but it provides untyped controls.
  */
 @Injectable({providedIn: ReactiveFormsModule})
 export class UntypedFormBuilder {
   private _typedBuilder: FormBuilder;

   constructor() {
     this._typedBuilder = new FormBuilder();
   }

   /**
    * @see FormBuilder#group
    */
   group(
       controlsConfig: {[key: string]: any},
       options?: AbstractControlOptions|null,
       ): UntypedFormGroup;
   /**
    * @deprecated
    */
   group(
       controlsConfig: {[key: string]: any},
       options: {[key: string]: any},
       ): UntypedFormGroup;
   group(
       controlsConfig: {[key: string]: any},
       options: AbstractControlOptions|{[key: string]: any}|
       null = null): UntypedFormGroup{return this._typedBuilder.group(controlsConfig, options)};

   /**
    * @see FormBuilder#control
    */
   control(
       formState: any, validatorOrOpts?: ValidatorFn|ValidatorFn[]|FormControlOptions|null,
       asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): UntypedFormControl {
     return this._typedBuilder.control(formState, validatorOrOpts, asyncValidator);
   }

   /**
    * @see FormBuilder#array
    */
   array(
       controlsConfig: any[],
       validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
       asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null): UntypedFormArray {
     return this._typedBuilder.array(controlsConfig, validatorOrOpts, asyncValidator);
   }
 }
