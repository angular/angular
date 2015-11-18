import { CONST_EXPR } from 'angular2/src/facade/lang';
import { NgControlName } from './directives/ng_control_name';
import { NgFormControl } from './directives/ng_form_control';
import { NgModel } from './directives/ng_model';
import { NgControlGroup } from './directives/ng_control_group';
import { NgFormModel } from './directives/ng_form_model';
import { NgForm } from './directives/ng_form';
import { DefaultValueAccessor } from './directives/default_value_accessor';
import { CheckboxControlValueAccessor } from './directives/checkbox_value_accessor';
import { NumberValueAccessor } from './directives/number_value_accessor';
import { NgControlStatus } from './directives/ng_control_status';
import { SelectControlValueAccessor, NgSelectOption } from './directives/select_control_value_accessor';
import { RequiredValidator, MinLengthValidator, MaxLengthValidator } from './directives/validators';
export { NgControlName } from './directives/ng_control_name';
export { NgFormControl } from './directives/ng_form_control';
export { NgModel } from './directives/ng_model';
export { NgControlGroup } from './directives/ng_control_group';
export { NgFormModel } from './directives/ng_form_model';
export { NgForm } from './directives/ng_form';
export { DefaultValueAccessor } from './directives/default_value_accessor';
export { CheckboxControlValueAccessor } from './directives/checkbox_value_accessor';
export { NumberValueAccessor } from './directives/number_value_accessor';
export { NgControlStatus } from './directives/ng_control_status';
export { SelectControlValueAccessor, NgSelectOption } from './directives/select_control_value_accessor';
export { RequiredValidator, MinLengthValidator, MaxLengthValidator } from './directives/validators';
export { NgControl } from './directives/ng_control';
/**
 *
 * A list of all the form directives used as part of a `@View` annotation.
 *
 *  This is a shorthand for importing them each individually.
 *
 * ### Example
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   directives: [FORM_DIRECTIVES]
 * })
 * class MyApp {}
 * ```
 */
export const FORM_DIRECTIVES = CONST_EXPR([
    NgControlName,
    NgControlGroup,
    NgFormControl,
    NgModel,
    NgFormModel,
    NgForm,
    NgSelectOption,
    DefaultValueAccessor,
    NumberValueAccessor,
    CheckboxControlValueAccessor,
    SelectControlValueAccessor,
    NgControlStatus,
    RequiredValidator,
    MinLengthValidator,
    MaxLengthValidator
]);
//# sourceMappingURL=directives.js.map