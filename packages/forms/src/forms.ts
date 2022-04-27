/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * This module is used for handling user input, by defining and building a `FormGroup` that
 * consists of `FormControl` objects, and mapping them onto the DOM. `FormControl`
 * objects can then be used to read information from the form DOM elements.
 *
 * Forms providers are not included in default providers; you must import these providers
 * explicitly.
 */

export {ɵInternalFormsSharedModule} from './directives.js';
export {AbstractControlDirective} from './directives/abstract_control_directive.js';
export {AbstractFormGroupDirective} from './directives/abstract_form_group_directive.js';
export {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor.js';
export {ControlContainer} from './directives/control_container.js';
export {ControlValueAccessor, NG_VALUE_ACCESSOR} from './directives/control_value_accessor.js';
export {COMPOSITION_BUFFER_MODE, DefaultValueAccessor} from './directives/default_value_accessor.js';
export {Form} from './directives/form_interface.js';
export {NgControl} from './directives/ng_control.js';
export {NgControlStatus, NgControlStatusGroup} from './directives/ng_control_status.js';
export {NgForm} from './directives/ng_form.js';
export {NgModel} from './directives/ng_model.js';
export {NgModelGroup} from './directives/ng_model_group.js';
export {ɵNgNoValidate} from './directives/ng_no_validate_directive.js';
export {NumberValueAccessor} from './directives/number_value_accessor.js';
export {RadioControlValueAccessor} from './directives/radio_control_value_accessor.js';
export {RangeValueAccessor} from './directives/range_value_accessor.js';
export {FormControlDirective} from './directives/reactive_directives/form_control_directive.js';
export {FormControlName} from './directives/reactive_directives/form_control_name.js';
export {FormGroupDirective} from './directives/reactive_directives/form_group_directive.js';
export {FormArrayName, FormGroupName} from './directives/reactive_directives/form_group_name.js';
export {NgSelectOption, SelectControlValueAccessor} from './directives/select_control_value_accessor.js';
export {SelectMultipleControlValueAccessor, ɵNgSelectMultipleOption} from './directives/select_multiple_control_value_accessor.js';
export {AsyncValidator, AsyncValidatorFn, CheckboxRequiredValidator, EmailValidator, MaxLengthValidator, MaxValidator, MinLengthValidator, MinValidator, PatternValidator, RequiredValidator, ValidationErrors, Validator, ValidatorFn} from './directives/validators.js';
export {FormBuilder, UntypedFormBuilder, ɵElement} from './form_builder.js';
export {AbstractControl, AbstractControlOptions, FormControlStatus, ɵCoerceStrArrToNumArr, ɵGetProperty, ɵNavigate, ɵRawValue, ɵTokenize, ɵTypedOrUntyped, ɵValue, ɵWriteable} from './model/abstract_model.js';
export {FormArray, UntypedFormArray, ɵFormArrayRawValue, ɵFormArrayValue} from './model/form_array.js';
export {FormControl, FormControlOptions, FormControlState, UntypedFormControl, ɵFormControlCtor} from './model/form_control.js';
export {FormGroup, FormRecord, UntypedFormGroup, ɵFormGroupRawValue, ɵFormGroupValue, ɵOptionalKeys} from './model/form_group.js';
export {NG_ASYNC_VALIDATORS, NG_VALIDATORS, Validators} from './validators.js';
export {VERSION} from './version.js';

export * from './form_providers.js';
