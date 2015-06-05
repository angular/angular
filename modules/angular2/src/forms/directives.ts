import {Type, CONST_EXPR} from 'angular2/src/facade/lang';
import {ControlNameDirective} from './directives/control_name_directive';
import {FormControlDirective} from './directives/form_control_directive';
import {NgModelDirective} from './directives/ng_model_directive';
import {ControlGroupDirective} from './directives/control_group_directive';
import {FormModelDirective} from './directives/form_model_directive';
import {TemplateDrivenFormDirective} from './directives/template_driven_form_directive';
import {DefaultValueAccessor} from './directives/default_value_accessor';
import {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor';
import {SelectControlValueAccessor} from './directives/select_control_value_accessor';
import {RequiredValidatorDirective} from './validator_directives';

export {ControlNameDirective} from './directives/control_name_directive';
export {FormControlDirective} from './directives/form_control_directive';
export {NgModelDirective} from './directives/ng_model_directive';
export {ControlDirective} from './directives/control_directive';
export {ControlGroupDirective} from './directives/control_group_directive';
export {FormModelDirective} from './directives/form_model_directive';
export {TemplateDrivenFormDirective} from './directives/template_driven_form_directive';
export {ControlValueAccessor} from './directives/control_value_accessor';
export {DefaultValueAccessor} from './directives/default_value_accessor';
export {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor';
export {SelectControlValueAccessor} from './directives/select_control_value_accessor';
export {RequiredValidatorDirective} from './validator_directives';

/**
 *
 * A list of all the form directives used as part of a `@View` annotation.
 *
 *  This is a shorthand for importing them each individually.
 *
 * @exportedAs angular2/forms
 */
export const formDirectives: List<Type> = CONST_EXPR([
  ControlNameDirective,
  ControlGroupDirective,

  FormControlDirective,
  NgModelDirective,
  FormModelDirective,
  TemplateDrivenFormDirective,

  DefaultValueAccessor,
  CheckboxControlValueAccessor,
  SelectControlValueAccessor,

  RequiredValidatorDirective
]);