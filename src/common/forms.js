'use strict';/**
 * @module
 * @description
 * This module is used for handling user input, by defining and building a {@link ControlGroup} that
 * consists of
 * {@link Control} objects, and mapping them onto the DOM. {@link Control} objects can then be used
 * to read information
 * from the form DOM elements.
 *
 * This module is not included in the `angular2` module; you must import the forms module
 * explicitly.
 *
 */
var model_1 = require('./forms/model');
exports.AbstractControl = model_1.AbstractControl;
exports.Control = model_1.Control;
exports.ControlGroup = model_1.ControlGroup;
exports.ControlArray = model_1.ControlArray;
var abstract_control_directive_1 = require('./forms/directives/abstract_control_directive');
exports.AbstractControlDirective = abstract_control_directive_1.AbstractControlDirective;
var control_container_1 = require('./forms/directives/control_container');
exports.ControlContainer = control_container_1.ControlContainer;
var ng_control_name_1 = require('./forms/directives/ng_control_name');
exports.NgControlName = ng_control_name_1.NgControlName;
var ng_form_control_1 = require('./forms/directives/ng_form_control');
exports.NgFormControl = ng_form_control_1.NgFormControl;
var ng_model_1 = require('./forms/directives/ng_model');
exports.NgModel = ng_model_1.NgModel;
var ng_control_1 = require('./forms/directives/ng_control');
exports.NgControl = ng_control_1.NgControl;
var ng_control_group_1 = require('./forms/directives/ng_control_group');
exports.NgControlGroup = ng_control_group_1.NgControlGroup;
var ng_form_model_1 = require('./forms/directives/ng_form_model');
exports.NgFormModel = ng_form_model_1.NgFormModel;
var ng_form_1 = require('./forms/directives/ng_form');
exports.NgForm = ng_form_1.NgForm;
var control_value_accessor_1 = require('./forms/directives/control_value_accessor');
exports.NG_VALUE_ACCESSOR = control_value_accessor_1.NG_VALUE_ACCESSOR;
var default_value_accessor_1 = require('./forms/directives/default_value_accessor');
exports.DefaultValueAccessor = default_value_accessor_1.DefaultValueAccessor;
var ng_control_status_1 = require('./forms/directives/ng_control_status');
exports.NgControlStatus = ng_control_status_1.NgControlStatus;
var checkbox_value_accessor_1 = require('./forms/directives/checkbox_value_accessor');
exports.CheckboxControlValueAccessor = checkbox_value_accessor_1.CheckboxControlValueAccessor;
var select_control_value_accessor_1 = require('./forms/directives/select_control_value_accessor');
exports.NgSelectOption = select_control_value_accessor_1.NgSelectOption;
exports.SelectControlValueAccessor = select_control_value_accessor_1.SelectControlValueAccessor;
var directives_1 = require('./forms/directives');
exports.FORM_DIRECTIVES = directives_1.FORM_DIRECTIVES;
var validators_1 = require('./forms/validators');
exports.NG_VALIDATORS = validators_1.NG_VALIDATORS;
exports.NG_ASYNC_VALIDATORS = validators_1.NG_ASYNC_VALIDATORS;
exports.Validators = validators_1.Validators;
var validators_2 = require('./forms/directives/validators');
exports.RequiredValidator = validators_2.RequiredValidator;
exports.MinLengthValidator = validators_2.MinLengthValidator;
exports.MaxLengthValidator = validators_2.MaxLengthValidator;
var form_builder_1 = require('./forms/form_builder');
exports.FormBuilder = form_builder_1.FormBuilder;
exports.FORM_PROVIDERS = form_builder_1.FORM_PROVIDERS;
exports.FORM_BINDINGS = form_builder_1.FORM_BINDINGS;
//# sourceMappingURL=forms.js.map