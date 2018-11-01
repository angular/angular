/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, OnChanges, SimpleChanges, StaticProvider, forwardRef} from '@angular/core';
import {Observable} from 'rxjs';

import {AbstractControl} from '../model';
import {NG_VALIDATORS, Validators} from '../validators';


/**
 * @description
 * Defines the map of errors returned from failed validation checks.
 *
 * @publicApi
 */
export type ValidationErrors = {
  [key: string]: any
};

/**
 * @description
 * An interface implemented by classes that perform synchronous validation.
 *
 * @usageNotes
 *
 * ### Provide a custom validator
 *
 * The following example implements the `Validator` interface to create a
 * validator directive with a custom error key.
 *
 * ```typescript
 * @Directive({
 *   selector: '[customValidator]',
 *   providers: [{provide: NG_VALIDATORS, useExisting: CustomValidatorDirective, multi: true}]
 * })
 * class CustomValidatorDirective implements Validator {
 *   validate(control: AbstractControl): ValidationErrors|null {
 *     return {'custom': true};
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export interface Validator {
  /**
   * @description
   * Method that performs synchronous validation against the provided control.
   *
   * @param control The control to validate against.
   *
   * @returns A map of validation errors if validation fails,
   * otherwise null.
   */
  validate(control: AbstractControl): ValidationErrors|null;

  /**
   * @description
   * Registers a callback function to call when the validator inputs change.
   *
   * @param fn The callback function
   */
  registerOnValidatorChange?(fn: () => void): void;
}

/**
 * @description
 * An interface implemented by classes that perform asynchronous validation.
 *
 * @usageNotes
 *
 * ### Provide a custom async validator directive
 *
 * The following example implements the `AsyncValidator` interface to create an
 * async validator directive with a custom error key.
 *
 * ```typescript
 * import { of as observableOf } from 'rxjs';
 *
 * @Directive({
 *   selector: '[customAsyncValidator]',
 *   providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: CustomAsyncValidatorDirective, multi:
 * true}]
 * })
 * class CustomAsyncValidatorDirective implements AsyncValidator {
 *   validate(control: AbstractControl): Observable<ValidationErrors|null> {
 *     return observableOf({'custom': true});
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export interface AsyncValidator extends Validator {
  /**
   * @description
   * Method that performs async validation against the provided control.
   *
   * @param control The control to validate against.
   *
   * @returns A promise or observable that resolves a map of validation errors
   * if validation fails, otherwise null.
   */
  validate(control: AbstractControl):
      Promise<ValidationErrors|null>|Observable<ValidationErrors|null>;
}

/**
 * @description
 * Provider which adds `RequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const REQUIRED_VALIDATOR: StaticProvider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => RequiredValidator),
  multi: true
};

/**
 * @description
 * Provider which adds `CheckboxRequiredValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const CHECKBOX_REQUIRED_VALIDATOR: StaticProvider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => CheckboxRequiredValidator),
  multi: true
};


/**
 * @description
 * A directive that adds the `required` validator to any controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 * 
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 * 
 * ### Adding a required validator using template-driven forms
 *
 * ```
 * <input name="fullName" ngModel required>
 * ```
 *
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
@Directive({
  selector:
      ':not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]',
  providers: [REQUIRED_VALIDATOR],
  host: {'[attr.required]': 'required ? "" : null'}
})
export class RequiredValidator implements Validator {
  // TODO(issue/24571): remove '!'.
  private _required !: boolean;
  // TODO(issue/24571): remove '!'.
  private _onChange !: () => void;

  /**
   * @description
   * Tracks changes to the required attribute bound to this directive.
   */
  @Input()
  get required(): boolean|string { return this._required; }

  set required(value: boolean|string) {
    this._required = value != null && value !== false && `${value}` !== 'false';
    if (this._onChange) this._onChange();
  }

  /**
   * @description
   * Method that validates whether the control is empty.
   * Returns the validation result if enabled, otherwise null.
   */
  validate(control: AbstractControl): ValidationErrors|null {
    return this.required ? Validators.required(control) : null;
  }

  /**
   * @description
   * Registers a callback function to call when the validator inputs change.
   *
   * @param fn The callback function
   */
  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
}


/**
 * A Directive that adds the `required` validator to checkbox controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 * 
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 * 
 * ### Adding a required checkbox validator using template-driven forms
 *
 * The following example shows how to add a checkbox required validator to an input attached to an ngModel binding.
 * 
 * ```
 * <input type="checkbox" name="active" ngModel required>
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
@Directive({
  selector:
      'input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]',
  providers: [CHECKBOX_REQUIRED_VALIDATOR],
  host: {'[attr.required]': 'required ? "" : null'}
})
export class CheckboxRequiredValidator extends RequiredValidator {
  /**
   * @description
   * Method that validates whether or not the checkbox has been checked.
   * Returns the validation result if enabled, otherwise null.
   */
  validate(control: AbstractControl): ValidationErrors|null {
    return this.required ? Validators.requiredTrue(control) : null;
  }
}

/**
 * @description
 * Provider which adds `EmailValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const EMAIL_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => EmailValidator),
  multi: true
};

/**
 * A directive that adds the `email` validator to controls marked with the
 * `email` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 * 
 * ### Adding an email validator
 *
 * The following example shows how to add an email validator to an input attached to an ngModel binding.
 * 
 * ```
 * <input type="email" name="email" ngModel email>
 * <input type="email" name="email" ngModel email="true">
 * <input type="email" name="email" ngModel [email]="true">
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
@Directive({
  selector: '[email][formControlName],[email][formControl],[email][ngModel]',
  providers: [EMAIL_VALIDATOR]
})
export class EmailValidator implements Validator {
  // TODO(issue/24571): remove '!'.
  private _enabled !: boolean;
  // TODO(issue/24571): remove '!'.
  private _onChange !: () => void;

  /**
   * @description
   * Tracks changes to the email attribute bound to this directive.
   */
  @Input()
  set email(value: boolean|string) {
    this._enabled = value === '' || value === true || value === 'true';
    if (this._onChange) this._onChange();
  }

  /**
   * @description
   * Method that validates whether an email address is valid.
   * Returns the validation result if enabled, otherwise null.
   */
  validate(control: AbstractControl): ValidationErrors|null {
    return this._enabled ? Validators.email(control) : null;
  }

  /**
   * @description
   * Registers a callback function to call when the validator inputs change.
   *
   * @param fn The callback function
   */
  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
}

/**
 * @description
 * A function that receives a control and synchronously returns a map of
 * validation errors if present, otherwise null.
 *
 * @publicApi
 */
export interface ValidatorFn { (control: AbstractControl): ValidationErrors|null; }

/**
 * @description
 * A function that receives a control and returns a Promise or observable
 * that emits validation errors if present, otherwise null.
 *
 * @publicApi
 */
export interface AsyncValidatorFn {
  (control: AbstractControl): Promise<ValidationErrors|null>|Observable<ValidationErrors|null>;
}

/**
 * @description
 * Provider which adds `MinLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MIN_LENGTH_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinLengthValidator),
  multi: true
};

/**
 * A directive that adds minimum length validation to controls marked with the
 * `minlength` attribute. The directive is provided with the `NG_VALIDATORS` mult-provider list.
 * 
 * @see [Form Validation](guide/form-validation)
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
@Directive({
  selector: '[minlength][formControlName],[minlength][formControl],[minlength][ngModel]',
  providers: [MIN_LENGTH_VALIDATOR],
  host: {'[attr.minlength]': 'minlength ? minlength : null'}
})
export class MinLengthValidator implements Validator,
    OnChanges {
  // TODO(issue/24571): remove '!'.
  private _validator !: ValidatorFn;
  // TODO(issue/24571): remove '!'.
  private _onChange !: () => void;

  /**
   * @description
   * Tracks changes to the the minimum length bound to this directive.
   */
  // TODO(issue/24571): remove '!'.
  @Input() minlength !: string;

  /**
   * @description
   * A lifecycle method called when the directive's inputs change. For internal use
   * only.
   *
   * @param changes A object of key/value pairs for the set of changed inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if ('minlength' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  /**
   * @description
   * Method that validates whether the value meets a minimum length
   * requirement. Returns the validation result if enabled, otherwise null.
   */
  validate(control: AbstractControl): ValidationErrors|null {
    return this.minlength == null ? null : this._validator(control);
  }

  /**
   * @description
   * Registers a callback function to call when the validator inputs change.
   *
   * @param fn The callback function
   */
  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

  private _createValidator(): void {
    this._validator = Validators.minLength(parseInt(this.minlength, 10));
  }
}

/**
 * @description
 * Provider which adds `MaxLengthValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const MAX_LENGTH_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxLengthValidator),
  multi: true
};

/**
 * A directive that adds max length validation to controls marked with the
 * `maxlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 * 
 * @see [Form Validation](guide/form-validation)
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
@Directive({
  selector: '[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]',
  providers: [MAX_LENGTH_VALIDATOR],
  host: {'[attr.maxlength]': 'maxlength ? maxlength : null'}
})
export class MaxLengthValidator implements Validator,
    OnChanges {
  // TODO(issue/24571): remove '!'.
  private _validator !: ValidatorFn;
  // TODO(issue/24571): remove '!'.
  private _onChange !: () => void;

  /**
   * @description
   * Tracks changes to the the maximum length bound to this directive.
   */
  // TODO(issue/24571): remove '!'.
  @Input() maxlength !: string;

  /**
   * @description
   * A lifecycle method called when the directive's inputs change. For internal use
   * only.
   *
   * @param changes A object of key/value pairs for the set of changed inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if ('maxlength' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  /**
   * @description
   * Method that validates whether the value exceeds
   * the maximum length requirement.
   */
  validate(control: AbstractControl): ValidationErrors|null {
    return this.maxlength != null ? this._validator(control) : null;
  }

  /**
   * @description
   * Registers a callback function to call when the validator inputs change.
   *
   * @param fn The callback function
   */
  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

  private _createValidator(): void {
    this._validator = Validators.maxLength(parseInt(this.maxlength, 10));
  }
}

/**
 * @description
 * Provider which adds `PatternValidator` to the `NG_VALIDATORS` multi-provider list.
 */
export const PATTERN_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => PatternValidator),
  multi: true
};


/**
 * @description
 * A directive that adds regex pattern validation to controls marked with the
 * `pattern` attribute. The regex must match the entire control value.
 * The directive is provided with the `NG_VALIDATORS` multi-provider list.
 * 
 * @see [Form Validation](guide/form-validation)
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
@Directive({
  selector: '[pattern][formControlName],[pattern][formControl],[pattern][ngModel]',
  providers: [PATTERN_VALIDATOR],
  host: {'[attr.pattern]': 'pattern ? pattern : null'}
})
export class PatternValidator implements Validator,
    OnChanges {
  // TODO(issue/24571): remove '!'.
  private _validator !: ValidatorFn;
  // TODO(issue/24571): remove '!'.
  private _onChange !: () => void;

  /**
   * @description
   * Tracks changes to the pattern bound to this directive.
   */
  // TODO(issue/24571): remove '!'.
  @Input() pattern !: string | RegExp;

  /**
   * @description
   * A lifecycle method called when the directive's inputs change. For internal use
   * only.
   *
   * @param changes A object of key/value pairs for the set of changed inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if ('pattern' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  /**
   * @description
   * Method that validates whether the value matches the
   * the pattern requirement.
   */
  validate(control: AbstractControl): ValidationErrors|null { return this._validator(control); }

  /**
   * @description
   * Registers a callback function to call when the validator inputs change.
   *
   * @param fn The callback function
   */
  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

  private _createValidator(): void { this._validator = Validators.pattern(this.pattern); }
}
