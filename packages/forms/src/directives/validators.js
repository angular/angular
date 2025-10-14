/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {booleanAttribute, Directive, forwardRef, Input} from '@angular/core';
import {
  emailValidator,
  maxLengthValidator,
  maxValidator,
  minLengthValidator,
  minValidator,
  NG_VALIDATORS,
  nullValidator,
  patternValidator,
  requiredTrueValidator,
  requiredValidator,
} from '../validators';
/**
 * Method that updates string to integer if not already a number
 *
 * @param value The value to convert to integer.
 * @returns value of parameter converted to number or integer.
 */
function toInteger(value) {
  return typeof value === 'number' ? value : parseInt(value, 10);
}
/**
 * Method that ensures that provided value is a float (and converts it to float if needed).
 *
 * @param value The value to convert to float.
 * @returns value of parameter converted to number or float.
 */
function toFloat(value) {
  return typeof value === 'number' ? value : parseFloat(value);
}
/**
 * A base class for Validator-based Directives. The class contains common logic shared across such
 * Directives.
 *
 * For internal use only, this class is not intended for use outside of the Forms package.
 */
let AbstractValidatorDirective = class AbstractValidatorDirective {
  constructor() {
    this._validator = nullValidator;
  }
  /** @docs-private */
  ngOnChanges(changes) {
    if (this.inputName in changes) {
      const input = this.normalizeInput(changes[this.inputName].currentValue);
      this._enabled = this.enabled(input);
      this._validator = this._enabled ? this.createValidator(input) : nullValidator;
      if (this._onChange) {
        this._onChange();
      }
    }
  }
  /** @docs-private */
  validate(control) {
    return this._validator(control);
  }
  /** @docs-private */
  registerOnValidatorChange(fn) {
    this._onChange = fn;
  }
  /**
   * @description
   * Determines whether this validator should be active or not based on an input.
   * Base class implementation checks whether an input is defined (if the value is different from
   * `null` and `undefined`). Validator classes that extend this base class can override this
   * function with the logic specific to a particular validator directive.
   */
  enabled(input) {
    return input != null /* both `null` and `undefined` */;
  }
};
AbstractValidatorDirective = __decorate([Directive()], AbstractValidatorDirective);
/**
 * @description
 * Provider which adds `MaxValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxValidator),
  multi: true,
};
/**
 * A directive which installs the {@link MaxValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `max` attribute.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a max validator
 *
 * The following example shows how to add a max validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="number" ngModel max="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let MaxValidator = class MaxValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    /** @internal */
    this.inputName = 'max';
    /** @internal */
    this.normalizeInput = (input) => toFloat(input);
    /** @internal */
    this.createValidator = (max) => maxValidator(max);
  }
};
__decorate([Input()], MaxValidator.prototype, 'max', void 0);
MaxValidator = __decorate(
  [
    Directive({
      selector:
        'input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]',
      providers: [MAX_VALIDATOR],
      host: {'[attr.max]': '_enabled ? max : null'},
      standalone: false,
    }),
  ],
  MaxValidator,
);
export {MaxValidator};
/**
 * @description
 * Provider which adds `MinValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinValidator),
  multi: true,
};
/**
 * A directive which installs the {@link MinValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a min validator
 *
 * The following example shows how to add a min validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="number" ngModel min="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let MinValidator = class MinValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    /** @internal */
    this.inputName = 'min';
    /** @internal */
    this.normalizeInput = (input) => toFloat(input);
    /** @internal */
    this.createValidator = (min) => minValidator(min);
  }
};
__decorate([Input()], MinValidator.prototype, 'min', void 0);
MinValidator = __decorate(
  [
    Directive({
      selector:
        'input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]',
      providers: [MIN_VALIDATOR],
      host: {'[attr.min]': '_enabled ? min : null'},
      standalone: false,
    }),
  ],
  MinValidator,
);
export {MinValidator};
/**
 * @description
 * Provider which adds `RequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const REQUIRED_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => RequiredValidator),
  multi: true,
};
/**
 * @description
 * Provider which adds `CheckboxRequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const CHECKBOX_REQUIRED_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => CheckboxRequiredValidator),
  multi: true,
};
/**
 * @description
 * A directive that adds the `required` validator to any controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a required validator using template-driven forms
 *
 * ```html
 * <input name="fullName" ngModel required>
 * ```
 *
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
let RequiredValidator = class RequiredValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    /** @internal */
    this.inputName = 'required';
    /** @internal */
    this.normalizeInput = booleanAttribute;
    /** @internal */
    this.createValidator = (input) => requiredValidator;
  }
  /** @docs-private */
  enabled(input) {
    return input;
  }
};
__decorate([Input()], RequiredValidator.prototype, 'required', void 0);
RequiredValidator = __decorate(
  [
    Directive({
      selector:
        ':not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]',
      providers: [REQUIRED_VALIDATOR],
      host: {'[attr.required]': '_enabled ? "" : null'},
      standalone: false,
    }),
  ],
  RequiredValidator,
);
export {RequiredValidator};
/**
 * A Directive that adds the `required` validator to checkbox controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a required checkbox validator using template-driven forms
 *
 * The following example shows how to add a checkbox required validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="checkbox" name="active" ngModel required>
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
let CheckboxRequiredValidator = class CheckboxRequiredValidator extends RequiredValidator {
  constructor() {
    super(...arguments);
    /** @internal */
    this.createValidator = (input) => requiredTrueValidator;
  }
};
CheckboxRequiredValidator = __decorate(
  [
    Directive({
      selector:
        'input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]',
      providers: [CHECKBOX_REQUIRED_VALIDATOR],
      host: {'[attr.required]': '_enabled ? "" : null'},
      standalone: false,
    }),
  ],
  CheckboxRequiredValidator,
);
export {CheckboxRequiredValidator};
/**
 * @description
 * Provider which adds `EmailValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const EMAIL_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => EmailValidator),
  multi: true,
};
/**
 * A directive that adds the `email` validator to controls marked with the
 * `email` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * The email validation is based on the WHATWG HTML specification with some enhancements to
 * incorporate more RFC rules. More information can be found on the [Validators.email
 * page](api/forms/Validators#email).
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding an email validator
 *
 * The following example shows how to add an email validator to an input attached to an ngModel
 * binding.
 *
 * ```html
 * <input type="email" name="email" ngModel email>
 * <input type="email" name="email" ngModel email="true">
 * <input type="email" name="email" ngModel [email]="true">
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
let EmailValidator = class EmailValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    /** @internal */
    this.inputName = 'email';
    /** @internal */
    this.normalizeInput = booleanAttribute;
    /** @internal */
    this.createValidator = (input) => emailValidator;
  }
  /** @docs-private */
  enabled(input) {
    return input;
  }
};
__decorate([Input()], EmailValidator.prototype, 'email', void 0);
EmailValidator = __decorate(
  [
    Directive({
      selector: '[email][formControlName],[email][formControl],[email][ngModel]',
      providers: [EMAIL_VALIDATOR],
      standalone: false,
    }),
  ],
  EmailValidator,
);
export {EmailValidator};
/**
 * @description
 * Provider which adds `MinLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_LENGTH_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinLengthValidator),
  multi: true,
};
/**
 * A directive that adds minimum length validation to controls marked with the
 * `minlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a minimum length validator
 *
 * The following example shows how to add a minimum length validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel minlength="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let MinLengthValidator = class MinLengthValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    /** @internal */
    this.inputName = 'minlength';
    /** @internal */
    this.normalizeInput = (input) => toInteger(input);
    /** @internal */
    this.createValidator = (minlength) => minLengthValidator(minlength);
  }
};
__decorate([Input()], MinLengthValidator.prototype, 'minlength', void 0);
MinLengthValidator = __decorate(
  [
    Directive({
      selector: '[minlength][formControlName],[minlength][formControl],[minlength][ngModel]',
      providers: [MIN_LENGTH_VALIDATOR],
      host: {'[attr.minlength]': '_enabled ? minlength : null'},
      standalone: false,
    }),
  ],
  MinLengthValidator,
);
export {MinLengthValidator};
/**
 * @description
 * Provider which adds `MaxLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_LENGTH_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxLengthValidator),
  multi: true,
};
/**
 * A directive that adds maximum length validation to controls marked with the
 * `maxlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a maximum length validator
 *
 * The following example shows how to add a maximum length validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel maxlength="25">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let MaxLengthValidator = class MaxLengthValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    /** @internal */
    this.inputName = 'maxlength';
    /** @internal */
    this.normalizeInput = (input) => toInteger(input);
    /** @internal */
    this.createValidator = (maxlength) => maxLengthValidator(maxlength);
  }
};
__decorate([Input()], MaxLengthValidator.prototype, 'maxlength', void 0);
MaxLengthValidator = __decorate(
  [
    Directive({
      selector: '[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]',
      providers: [MAX_LENGTH_VALIDATOR],
      host: {'[attr.maxlength]': '_enabled ? maxlength : null'},
      standalone: false,
    }),
  ],
  MaxLengthValidator,
);
export {MaxLengthValidator};
/**
 * @description
 * Provider which adds `PatternValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const PATTERN_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => PatternValidator),
  multi: true,
};
/**
 * @description
 * A directive that adds regex pattern validation to controls marked with the
 * `pattern` attribute. The regex must match the entire control value.
 * The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a pattern validator
 *
 * The following example shows how to add a pattern validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel pattern="[a-zA-Z ]*">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let PatternValidator = class PatternValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    /** @internal */
    this.inputName = 'pattern';
    /** @internal */
    this.normalizeInput = (input) => input;
    /** @internal */
    this.createValidator = (input) => patternValidator(input);
  }
};
__decorate([Input()], PatternValidator.prototype, 'pattern', void 0);
PatternValidator = __decorate(
  [
    Directive({
      selector: '[pattern][formControlName],[pattern][formControl],[pattern][ngModel]',
      providers: [PATTERN_VALIDATOR],
      host: {'[attr.pattern]': '_enabled ? pattern : null'},
      standalone: false,
    }),
  ],
  PatternValidator,
);
export {PatternValidator};
//# sourceMappingURL=validators.js.map
