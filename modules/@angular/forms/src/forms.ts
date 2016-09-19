/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * This module is used for handling user input, by defining and building a {@link FormGroup} that
 * consists of {@link FormControl} objects, and mapping them onto the DOM. {@link FormControl}
 * objects can then be used to read information from the form DOM elements.
 *
 * Forms providers are not included in default providers; you must import these providers
 * explicitly.
 */


export {AbstractControlDirective} from './directives/abstract_control_directive';
export {AbstractFormGroupDirective} from './directives/abstract_form_group_directive';
export {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor';
export {ControlContainer} from './directives/control_container';
export {ControlValueAccessor, NG_VALUE_ACCESSOR} from './directives/control_value_accessor';
export {DefaultValueAccessor} from './directives/default_value_accessor';
export {Form} from './directives/form_interface';
export {NgControl} from './directives/ng_control';
export {NgControlStatus, NgControlStatusGroup} from './directives/ng_control_status';
export {NgForm} from './directives/ng_form';
export {NgModel} from './directives/ng_model';
export {NgModelGroup} from './directives/ng_model_group';
export {RadioControlValueAccessor} from './directives/radio_control_value_accessor';
export {FormControlDirective} from './directives/reactive_directives/form_control_directive';
export {FormControlName} from './directives/reactive_directives/form_control_name';
export {FormGroupDirective} from './directives/reactive_directives/form_group_directive';
export {FormArrayName} from './directives/reactive_directives/form_group_name';
export {FormGroupName} from './directives/reactive_directives/form_group_name';
export {NgSelectOption, SelectControlValueAccessor} from './directives/select_control_value_accessor';
export {SelectMultipleControlValueAccessor} from './directives/select_multiple_control_value_accessor';
export {AsyncValidatorFn, MaxLengthValidator, MinLengthValidator, PatternValidator, RequiredValidator, Validator, ValidatorFn} from './directives/validators';
export {FormBuilder} from './form_builder';
export {AbstractControl, FormArray, FormControl, FormGroup} from './model';
export {NG_ASYNC_VALIDATORS, NG_VALIDATORS, Validators} from './validators';

export * from './form_providers';
