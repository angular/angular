/**
 * @module
 * @description
 * This module is used for handling user input, by defining and building a [ControlGroup] that
 * consists of
 * [Control] objects, and mapping them onto the DOM. [Control] objects can then be used
 * to read information
 * from the form DOM elements.
 *
 * This module is not included in the `angular2` module; you must import the forms module
 * explicitly.
 *
 */
library angular2.src.common.forms;

export "forms/model.dart"
    show AbstractControl, Control, ControlGroup, ControlArray;
export "forms/directives/abstract_control_directive.dart"
    show AbstractControlDirective;
export "forms/directives/form_interface.dart" show Form;
export "forms/directives/control_container.dart" show ControlContainer;
export "forms/directives/ng_control_name.dart" show NgControlName;
export "forms/directives/ng_form_control.dart" show NgFormControl;
export "forms/directives/ng_model.dart" show NgModel;
export "forms/directives/ng_control.dart" show NgControl;
export "forms/directives/ng_control_group.dart" show NgControlGroup;
export "forms/directives/ng_form_model.dart" show NgFormModel;
export "forms/directives/ng_form.dart" show NgForm;
export "forms/directives/control_value_accessor.dart"
    show ControlValueAccessor, NG_VALUE_ACCESSOR;
export "forms/directives/default_value_accessor.dart" show DefaultValueAccessor;
export "forms/directives/ng_control_status.dart" show NgControlStatus;
export "forms/directives/checkbox_value_accessor.dart"
    show CheckboxControlValueAccessor;
export "forms/directives/select_control_value_accessor.dart"
    show NgSelectOption, SelectControlValueAccessor;
export "forms/directives.dart" show FORM_DIRECTIVES;
export "forms/validators.dart"
    show NG_VALIDATORS, NG_ASYNC_VALIDATORS, Validators;
export "forms/directives/validators.dart"
    show RequiredValidator, MinLengthValidator, MaxLengthValidator, Validator;
export "forms/form_builder.dart"
    show FormBuilder, FORM_PROVIDERS, FORM_BINDINGS;
