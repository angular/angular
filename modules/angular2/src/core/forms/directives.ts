import {Type, CONST_EXPR} from 'angular2/src/core/facade/lang';
import {NgControlName} from './directives/ng_control_name';
import {NgFormControl} from './directives/ng_form_control';
import {NgModel} from './directives/ng_model';
import {NgControlGroup} from './directives/ng_control_group';
import {NgFormModel} from './directives/ng_form_model';
import {NgForm} from './directives/ng_form';
import {DefaultValueAccessor} from './directives/default_value_accessor';
import {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor';
import {NgControlStatus} from './directives/ng_control_status';
import {
  SelectControlValueAccessor,
  NgSelectOption
} from './directives/select_control_value_accessor';
import {RequiredValidator, MinLengthValidator, MaxLengthValidator} from './directives/validators';

export {NgControlName} from './directives/ng_control_name';
export {NgFormControl} from './directives/ng_form_control';
export {NgModel} from './directives/ng_model';
export {NgControl} from './directives/ng_control';
export {NgControlGroup} from './directives/ng_control_group';
export {NgFormModel} from './directives/ng_form_model';
export {NgForm} from './directives/ng_form';
export {ControlValueAccessor} from './directives/control_value_accessor';
export {DefaultValueAccessor} from './directives/default_value_accessor';
export {CheckboxControlValueAccessor} from './directives/checkbox_value_accessor';
export {
  SelectControlValueAccessor,
  NgSelectOption
} from './directives/select_control_value_accessor';
export {RequiredValidator, MinLengthValidator, MaxLengthValidator} from './directives/validators';
export {NgControlStatus} from './directives/ng_control_status';

/**
 *
 * A list of all the form directives used as part of a `@View` annotation.
 *
 *  This is a shorthand for importing them each individually.
 *
 * ### Example:
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   directives: [FORM_DIRECTIVES]
 * })
 * class MyApp {}
 * ```
 */
export const FORM_DIRECTIVES: Type[] = CONST_EXPR([
  NgControlName,
  NgControlGroup,

  NgFormControl,
  NgModel,
  NgFormModel,
  NgForm,

  NgSelectOption,
  DefaultValueAccessor,
  CheckboxControlValueAccessor,
  SelectControlValueAccessor,
  NgControlStatus,

  RequiredValidator,
  MinLengthValidator,
  MaxLengthValidator
]);
