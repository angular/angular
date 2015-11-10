library angular2.src.common.forms.directives;

import "package:angular2/src/facade/lang.dart" show Type;
import "directives/ng_control_name.dart" show NgControlName;
import "directives/ng_form_control.dart" show NgFormControl;
import "directives/ng_model.dart" show NgModel;
import "directives/ng_control_group.dart" show NgControlGroup;
import "directives/ng_form_model.dart" show NgFormModel;
import "directives/ng_form.dart" show NgForm;
import "directives/default_value_accessor.dart" show DefaultValueAccessor;
import "directives/checkbox_value_accessor.dart"
    show CheckboxControlValueAccessor;
import "directives/number_value_accessor.dart" show NumberValueAccessor;
import "directives/ng_control_status.dart" show NgControlStatus;
import "directives/select_control_value_accessor.dart"
    show SelectControlValueAccessor, NgSelectOption;
import "directives/validators.dart"
    show RequiredValidator, MinLengthValidator, MaxLengthValidator;
export "directives/ng_control_name.dart" show NgControlName;
export "directives/ng_form_control.dart" show NgFormControl;
export "directives/ng_model.dart" show NgModel;
export "directives/ng_control_group.dart" show NgControlGroup;
export "directives/ng_form_model.dart" show NgFormModel;
export "directives/ng_form.dart" show NgForm;
export "directives/default_value_accessor.dart" show DefaultValueAccessor;
export "directives/checkbox_value_accessor.dart"
    show CheckboxControlValueAccessor;
export "directives/number_value_accessor.dart" show NumberValueAccessor;
export "directives/ng_control_status.dart" show NgControlStatus;
export "directives/select_control_value_accessor.dart"
    show SelectControlValueAccessor, NgSelectOption;
export "directives/validators.dart"
    show RequiredValidator, MinLengthValidator, MaxLengthValidator;
export "directives/ng_control.dart" show NgControl;
export "directives/control_value_accessor.dart" show ControlValueAccessor;

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
const List<Type> FORM_DIRECTIVES = const [
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
];
