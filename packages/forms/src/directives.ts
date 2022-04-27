/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, Type} from '@angular/core';

import {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor.js';
import {DefaultValueAccessor} from './directives/default_value_accessor.js';
import {NgControlStatus, NgControlStatusGroup} from './directives/ng_control_status.js';
import {NgForm} from './directives/ng_form.js';
import {NgModel} from './directives/ng_model.js';
import {NgModelGroup} from './directives/ng_model_group.js';
import {NgNoValidate} from './directives/ng_no_validate_directive.js';
import {NumberValueAccessor} from './directives/number_value_accessor.js';
import {RadioControlRegistryModule, RadioControlValueAccessor} from './directives/radio_control_value_accessor.js';
import {RangeValueAccessor} from './directives/range_value_accessor.js';
import {FormControlDirective} from './directives/reactive_directives/form_control_directive.js';
import {FormControlName} from './directives/reactive_directives/form_control_name.js';
import {FormGroupDirective} from './directives/reactive_directives/form_group_directive.js';
import {FormArrayName, FormGroupName} from './directives/reactive_directives/form_group_name.js';
import {NgSelectOption, SelectControlValueAccessor} from './directives/select_control_value_accessor.js';
import {NgSelectMultipleOption, SelectMultipleControlValueAccessor} from './directives/select_multiple_control_value_accessor.js';
import {CheckboxRequiredValidator, EmailValidator, MaxLengthValidator, MaxValidator, MinLengthValidator, MinValidator, PatternValidator, RequiredValidator} from './directives/validators.js';

export {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor.js';
export {ControlValueAccessor} from './directives/control_value_accessor.js';
export {DefaultValueAccessor} from './directives/default_value_accessor.js';
export {NgControl} from './directives/ng_control.js';
export {NgControlStatus, NgControlStatusGroup} from './directives/ng_control_status.js';
export {NgForm} from './directives/ng_form.js';
export {NgModel} from './directives/ng_model.js';
export {NgModelGroup} from './directives/ng_model_group.js';
export {NumberValueAccessor} from './directives/number_value_accessor.js';
export {RadioControlValueAccessor} from './directives/radio_control_value_accessor.js';
export {RangeValueAccessor} from './directives/range_value_accessor.js';
export {FormControlDirective, NG_MODEL_WITH_FORM_CONTROL_WARNING} from './directives/reactive_directives/form_control_directive.js';
export {FormControlName} from './directives/reactive_directives/form_control_name.js';
export {FormGroupDirective} from './directives/reactive_directives/form_group_directive.js';
export {FormArrayName, FormGroupName} from './directives/reactive_directives/form_group_name.js';
export {NgSelectOption, SelectControlValueAccessor} from './directives/select_control_value_accessor.js';
export {NgSelectMultipleOption, SelectMultipleControlValueAccessor} from './directives/select_multiple_control_value_accessor.js';

export const SHARED_FORM_DIRECTIVES: Type<any>[] = [
  NgNoValidate,
  NgSelectOption,
  NgSelectMultipleOption,
  DefaultValueAccessor,
  NumberValueAccessor,
  RangeValueAccessor,
  CheckboxControlValueAccessor,
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
  RadioControlValueAccessor,
  NgControlStatus,
  NgControlStatusGroup,
  RequiredValidator,
  MinLengthValidator,
  MaxLengthValidator,
  PatternValidator,
  CheckboxRequiredValidator,
  EmailValidator,
  MinValidator,
  MaxValidator,
];

export const TEMPLATE_DRIVEN_DIRECTIVES: Type<any>[] = [NgModel, NgModelGroup, NgForm];

export const REACTIVE_DRIVEN_DIRECTIVES: Type<any>[] =
    [FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName];

/**
 * Internal module used for sharing directives between FormsModule and ReactiveFormsModule
 */
@NgModule({
  declarations: SHARED_FORM_DIRECTIVES,
  imports: [RadioControlRegistryModule],
  exports: SHARED_FORM_DIRECTIVES,
})
export class ɵInternalFormsSharedModule {
}

export {ɵInternalFormsSharedModule as InternalFormsSharedModule};
