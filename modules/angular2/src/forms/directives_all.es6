import {ControlGroupDirective, ControlDirective, CheckboxControlValueAccessor, DefaultValueAccessor} from './directives';


/**
 *
 * A list of all the form directives used as part of a `@View` annotation.
 *
 *  This is a shorthand for importing them each individually.
 *
 * @exportedAs angular2/forms
 */
// todo(misko): rename to lover case as it is not a Type but a var.

export const FormDirectives = [
  ControlGroupDirective, ControlDirective, CheckboxControlValueAccessor, DefaultValueAccessor
];
