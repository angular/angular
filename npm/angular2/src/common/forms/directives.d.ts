import { Type } from 'angular2/src/facade/lang';
export { NgControlName } from './directives/ng_control_name';
export { NgFormControl } from './directives/ng_form_control';
export { NgModel } from './directives/ng_model';
export { NgControlGroup } from './directives/ng_control_group';
export { NgFormModel } from './directives/ng_form_model';
export { NgForm } from './directives/ng_form';
export { DefaultValueAccessor } from './directives/default_value_accessor';
export { CheckboxControlValueAccessor } from './directives/checkbox_value_accessor';
export { RadioControlValueAccessor, RadioButtonState } from './directives/radio_control_value_accessor';
export { NumberValueAccessor } from './directives/number_value_accessor';
export { NgControlStatus } from './directives/ng_control_status';
export { SelectControlValueAccessor, NgSelectOption } from './directives/select_control_value_accessor';
export { RequiredValidator, MinLengthValidator, MaxLengthValidator, PatternValidator } from './directives/validators';
export { NgControl } from './directives/ng_control';
export { ControlValueAccessor } from './directives/control_value_accessor';
/**
 *
 * A list of all the form directives used as part of a `@Component` annotation.
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
export declare const FORM_DIRECTIVES: Type[];
