/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, Type} from '@angular/core';

import {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor';
import {DefaultValueAccessor} from './directives/default_value_accessor';
import {NgControlStatus, NgControlStatusGroup} from './directives/ng_control_status';
import {NgForm} from './directives/ng_form';
import {NgModel} from './directives/ng_model';
import {NgModelGroup} from './directives/ng_model_group';
import {NumberValueAccessor} from './directives/number_value_accessor';
import {RadioControlValueAccessor} from './directives/radio_control_value_accessor';
import {FormControlDirective} from './directives/reactive_directives/form_control_directive';
import {FormControlName} from './directives/reactive_directives/form_control_name';
import {FormGroupDirective} from './directives/reactive_directives/form_group_directive';
import {FormArrayName, FormGroupName} from './directives/reactive_directives/form_group_name';
import {NgSelectOption, SelectControlValueAccessor} from './directives/select_control_value_accessor';
import {NgSelectMultipleOption, SelectMultipleControlValueAccessor} from './directives/select_multiple_control_value_accessor';
import {MaxLengthValidator, MinLengthValidator, PatternValidator, RequiredValidator} from './directives/validators';

export {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor';
export {ControlValueAccessor} from './directives/control_value_accessor';
export {DefaultValueAccessor} from './directives/default_value_accessor';
export {NgControl} from './directives/ng_control';
export {NgControlStatus, NgControlStatusGroup} from './directives/ng_control_status';
export {NgForm} from './directives/ng_form';
export {NgModel} from './directives/ng_model';
export {NgModelGroup} from './directives/ng_model_group';
export {NumberValueAccessor} from './directives/number_value_accessor';
export {RadioControlValueAccessor} from './directives/radio_control_value_accessor';
export {FormControlDirective} from './directives/reactive_directives/form_control_directive';
export {FormControlName} from './directives/reactive_directives/form_control_name';
export {FormGroupDirective} from './directives/reactive_directives/form_group_directive';
export {FormArrayName, FormGroupName} from './directives/reactive_directives/form_group_name';
export {NgSelectOption, SelectControlValueAccessor} from './directives/select_control_value_accessor';
export {NgSelectMultipleOption, SelectMultipleControlValueAccessor} from './directives/select_multiple_control_value_accessor';
export {MaxLengthValidator, MinLengthValidator, PatternValidator, RequiredValidator} from './directives/validators';

export const SHARED_FORM_DIRECTIVES: Type<any>[] = [
  NgSelectOption, NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor,
  CheckboxControlValueAccessor, SelectControlValueAccessor, SelectMultipleControlValueAccessor,
  RadioControlValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator,
  MinLengthValidator, MaxLengthValidator, PatternValidator
];

export const TEMPLATE_DRIVEN_DIRECTIVES: Type<any>[] = [NgModel, NgModelGroup, NgForm];

export const REACTIVE_DRIVEN_DIRECTIVES: Type<any>[] =
    [FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName];

/**
 * A list of all the form directives.
 *
 * @stable
 */
export const FORM_DIRECTIVES: Type<any>[][] = [TEMPLATE_DRIVEN_DIRECTIVES, SHARED_FORM_DIRECTIVES];

/**
 * @stable
 */
export const REACTIVE_FORM_DIRECTIVES: Type<any>[][] =
    [REACTIVE_DRIVEN_DIRECTIVES, SHARED_FORM_DIRECTIVES];

/**
 * Internal module used for sharing directives between FormsModule and ReactiveFormsModule
 */
@NgModule({declarations: SHARED_FORM_DIRECTIVES, exports: SHARED_FORM_DIRECTIVES})
export class InternalFormsSharedModule {
}
