/**
 * @module
 * @description
 * This module is used for handling user input, by defining and building a {@link FormGroup} that
 * consists of
 * {@link FormControl} objects, and mapping them onto the DOM. {@link FormControl} objects can then
 * be used
 * to read information
 * from the form DOM elements.
 *
 * Forms providers are not included in default providers; you must import these providers
 * explicitly.
 */
import {Type} from '@angular/core';

import {RadioControlRegistry} from './forms/directives/radio_control_value_accessor';
import {FormBuilder} from './forms/form_builder';

export {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, RadioButtonState} from './forms/directives';
export {AbstractControlDirective} from './forms/directives/abstract_control_directive';
export {CheckboxControlValueAccessor} from './forms/directives/checkbox_value_accessor';
export {ControlContainer} from './forms/directives/control_container';
export {ControlValueAccessor, NG_VALUE_ACCESSOR} from './forms/directives/control_value_accessor';
export {DefaultValueAccessor} from './forms/directives/default_value_accessor';
export {Form} from './forms/directives/form_interface';
export {NgControl} from './forms/directives/ng_control';
export {NgControlGroup} from './forms/directives/ng_control_group';
export {NgControlName} from './forms/directives/ng_control_name';
export {NgControlStatus} from './forms/directives/ng_control_status';
export {NgForm} from './forms/directives/ng_form';
export {NgModel} from './forms/directives/ng_model';
export {FormControlDirective} from './forms/directives/reactive_directives/form_control_directive';
export {FormGroupDirective} from './forms/directives/reactive_directives/form_group_directive';
export {NgSelectOption, SelectControlValueAccessor} from './forms/directives/select_control_value_accessor';
export {MaxLengthValidator, MinLengthValidator, PatternValidator, RequiredValidator, Validator} from './forms/directives/validators';
export {FormBuilder} from './forms/form_builder';
export {AbstractControl, FormArray, FormControl, FormGroup} from './forms/model';
export {NG_ASYNC_VALIDATORS, NG_VALIDATORS, Validators} from './forms/validators';



/**
 * Shorthand set of providers used for building Angular forms.
 *
 * ### Example
 *
 * ```typescript
 * bootstrap(MyApp, [FORM_PROVIDERS]);
 * ```
 *
 * @experimental
 */
export const FORM_PROVIDERS: Type[] = /*@ts2dart_const*/[FormBuilder, RadioControlRegistry];
