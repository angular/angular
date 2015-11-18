'use strict';var lang_1 = require('angular2/src/facade/lang');
var ng_control_name_1 = require('./directives/ng_control_name');
var ng_form_control_1 = require('./directives/ng_form_control');
var ng_model_1 = require('./directives/ng_model');
var ng_control_group_1 = require('./directives/ng_control_group');
var ng_form_model_1 = require('./directives/ng_form_model');
var ng_form_1 = require('./directives/ng_form');
var default_value_accessor_1 = require('./directives/default_value_accessor');
var checkbox_value_accessor_1 = require('./directives/checkbox_value_accessor');
var number_value_accessor_1 = require('./directives/number_value_accessor');
var ng_control_status_1 = require('./directives/ng_control_status');
var select_control_value_accessor_1 = require('./directives/select_control_value_accessor');
var validators_1 = require('./directives/validators');
var ng_control_name_2 = require('./directives/ng_control_name');
exports.NgControlName = ng_control_name_2.NgControlName;
var ng_form_control_2 = require('./directives/ng_form_control');
exports.NgFormControl = ng_form_control_2.NgFormControl;
var ng_model_2 = require('./directives/ng_model');
exports.NgModel = ng_model_2.NgModel;
var ng_control_group_2 = require('./directives/ng_control_group');
exports.NgControlGroup = ng_control_group_2.NgControlGroup;
var ng_form_model_2 = require('./directives/ng_form_model');
exports.NgFormModel = ng_form_model_2.NgFormModel;
var ng_form_2 = require('./directives/ng_form');
exports.NgForm = ng_form_2.NgForm;
var default_value_accessor_2 = require('./directives/default_value_accessor');
exports.DefaultValueAccessor = default_value_accessor_2.DefaultValueAccessor;
var checkbox_value_accessor_2 = require('./directives/checkbox_value_accessor');
exports.CheckboxControlValueAccessor = checkbox_value_accessor_2.CheckboxControlValueAccessor;
var number_value_accessor_2 = require('./directives/number_value_accessor');
exports.NumberValueAccessor = number_value_accessor_2.NumberValueAccessor;
var ng_control_status_2 = require('./directives/ng_control_status');
exports.NgControlStatus = ng_control_status_2.NgControlStatus;
var select_control_value_accessor_2 = require('./directives/select_control_value_accessor');
exports.SelectControlValueAccessor = select_control_value_accessor_2.SelectControlValueAccessor;
exports.NgSelectOption = select_control_value_accessor_2.NgSelectOption;
var validators_2 = require('./directives/validators');
exports.RequiredValidator = validators_2.RequiredValidator;
exports.MinLengthValidator = validators_2.MinLengthValidator;
exports.MaxLengthValidator = validators_2.MaxLengthValidator;
var ng_control_1 = require('./directives/ng_control');
exports.NgControl = ng_control_1.NgControl;
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
exports.FORM_DIRECTIVES = lang_1.CONST_EXPR([
    ng_control_name_1.NgControlName,
    ng_control_group_1.NgControlGroup,
    ng_form_control_1.NgFormControl,
    ng_model_1.NgModel,
    ng_form_model_1.NgFormModel,
    ng_form_1.NgForm,
    select_control_value_accessor_1.NgSelectOption,
    default_value_accessor_1.DefaultValueAccessor,
    number_value_accessor_1.NumberValueAccessor,
    checkbox_value_accessor_1.CheckboxControlValueAccessor,
    select_control_value_accessor_1.SelectControlValueAccessor,
    ng_control_status_1.NgControlStatus,
    validators_1.RequiredValidator,
    validators_1.MinLengthValidator,
    validators_1.MaxLengthValidator
]);
//# sourceMappingURL=directives.js.map