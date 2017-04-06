/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, OnChanges, Provider, SimpleChanges, forwardRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AbstractControl} from '../model';
import {NG_VALIDATORS, Validators} from '../validators';

/** @experimental */
export type ValidationErrors = {
  [key: string]: any
};

/**
 * An interface that can be implemented by classes that can act as validators.
 *
 * ## Usage
 *
 * ```typescript
 * @Directive({
 *   selector: '[custom-validator]',
 *   providers: [{provide: NG_VALIDATORS, useExisting: CustomValidatorDirective, multi: true}]
 * })
 * class CustomValidatorDirective implements Validator {
 *   validate(c: Control): {[key: string]: any} {
 *     return {"custom": true};
 *   }
 * }
 * ```
 *
 * @stable
 */
export interface Validator {
  validate(c: AbstractControl): ValidationErrors|null;
  registerOnValidatorChange?(fn: () => void): void;
}

/** @experimental */
export interface AsyncValidator extends Validator {
  validate(c: AbstractControl): Promise<ValidationErrors|null>|Observable<ValidationErrors|null>;
}

export const REQUIRED_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => RequiredValidator),
  multi: true
};

export const CHECKBOX_REQUIRED_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => CheckboxRequiredValidator),
  multi: true
};


/**
 * A Directive that adds the `required` validator to any controls marked with the
 * `required` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input name="fullName" ngModel required>
 * ```
 *
 * @stable
 */
@Directive({
  selector:
      ':not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]',
  providers: [REQUIRED_VALIDATOR],
  host: {'[attr.required]': 'required ? "" : null'}
})
export class RequiredValidator implements Validator {
  private _required: boolean;
  private _onChange: () => void;

  @Input()
  get required(): boolean|string { return this._required; }

  set required(value: boolean|string) {
    this._required = value != null && value !== false && `${value}` !== 'false';
    if (this._onChange) this._onChange();
  }

  validate(c: AbstractControl): ValidationErrors|null {
    return this.required ? Validators.required(c) : null;
  }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
}

export const MIN_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinValidator),
  multi: true
};

/**
 * A directive which installs the {@link MinValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @experimental
 */
@Directive({
  selector: '[min][formControlName],[min][formControl],[min][ngModel]',
  providers: [MIN_VALIDATOR],
  host: {'[attr.min]': 'min ? min : null'}
})
export class MinValidator implements Validator,
    OnChanges {
  private _validator: ValidatorFn;
  private _onChange: () => void;

  @Input() min: string;

  ngOnChanges(changes: SimpleChanges): void {
    if ('min' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(c: AbstractControl): ValidationErrors|null { return this._validator(c); }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

  private _createValidator(): void { this._validator = Validators.min(parseInt(this.min, 10)); }
}


export const MAX_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxValidator),
  multi: true
};

/**
 * A directive which installs the {@link MaxValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @experimental
 */
@Directive({
  selector: '[max][formControlName],[max][formControl],[max][ngModel]',
  providers: [MAX_VALIDATOR],
  host: {'[attr.max]': 'max ? max : null'}
})
export class MaxValidator implements Validator,
    OnChanges {
  private _validator: ValidatorFn;
  private _onChange: () => void;

  @Input() max: string;

  ngOnChanges(changes: SimpleChanges): void {
    if ('max' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(c: AbstractControl): ValidationErrors|null { return this._validator(c); }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

  private _createValidator(): void { this._validator = Validators.max(parseInt(this.max, 10)); }
}


/**
 * A Directive that adds the `required` validator to checkbox controls marked with the
 * `required` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input type="checkbox" name="active" ngModel required>
 * ```
 *
 * @experimental
 */
@Directive({
  selector:
      'input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]',
  providers: [CHECKBOX_REQUIRED_VALIDATOR],
  host: {'[attr.required]': 'required ? "" : null'}
})
export class CheckboxRequiredValidator extends RequiredValidator {
  validate(c: AbstractControl): ValidationErrors|null {
    return this.required ? Validators.requiredTrue(c) : null;
  }
}

/**
 * Provider which adds {@link EmailValidator} to {@link NG_VALIDATORS}.
 */
export const EMAIL_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => EmailValidator),
  multi: true
};

/**
 * A Directive that adds the `email` validator to controls marked with the
 * `email` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input type="email" name="email" ngModel email>
 * <input type="email" name="email" ngModel email="true">
 * <input type="email" name="email" ngModel [email]="true">
 * ```
 *
 * @experimental
 */
@Directive({
  selector: '[email][formControlName],[email][formControl],[email][ngModel]',
  providers: [EMAIL_VALIDATOR]
})
export class EmailValidator implements Validator {
  private _enabled: boolean;
  private _onChange: () => void;

  @Input()
  set email(value: boolean|string) {
    this._enabled = value === '' || value === true || value === 'true';
    if (this._onChange) this._onChange();
  }

  validate(c: AbstractControl): ValidationErrors|null {
    return this._enabled ? Validators.email(c) : null;
  }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
}

/**
 * @stable
 */
export interface ValidatorFn { (c: AbstractControl): ValidationErrors|null; }

/**
 * @stable
 */
export interface AsyncValidatorFn {
  (c: AbstractControl): Promise<ValidationErrors|null>|Observable<ValidationErrors|null>;
}

/**
 * Provider which adds {@link MinLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='min'}
 */
export const MIN_LENGTH_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinLengthValidator),
  multi: true
};

/**
 * A directive which installs the {@link MinLengthValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `minlength` attribute.
 *
 * @stable
 */
@Directive({
  selector: '[minlength][formControlName],[minlength][formControl],[minlength][ngModel]',
  providers: [MIN_LENGTH_VALIDATOR],
  host: {'[attr.minlength]': 'minlength ? minlength : null'}
})
export class MinLengthValidator implements Validator,
    OnChanges {
  private _validator: ValidatorFn;
  private _onChange: () => void;

  @Input() minlength: string;

  ngOnChanges(changes: SimpleChanges): void {
    if ('minlength' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(c: AbstractControl): ValidationErrors|null {
    return this.minlength == null ? null : this._validator(c);
  }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

  private _createValidator(): void {
    this._validator = Validators.minLength(parseInt(this.minlength, 10));
  }
}

/**
 * Provider which adds {@link MaxLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
export const MAX_LENGTH_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxLengthValidator),
  multi: true
};

/**
 * A directive which installs the {@link MaxLengthValidator} for any `formControlName,
 * `formControl`,
 * or control with `ngModel` that also has a `maxlength` attribute.
 *
 * @stable
 */
@Directive({
  selector: '[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]',
  providers: [MAX_LENGTH_VALIDATOR],
  host: {'[attr.maxlength]': 'maxlength ? maxlength : null'}
})
export class MaxLengthValidator implements Validator,
    OnChanges {
  private _validator: ValidatorFn;
  private _onChange: () => void;

  @Input() maxlength: string;

  ngOnChanges(changes: SimpleChanges): void {
    if ('maxlength' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(c: AbstractControl): ValidationErrors|null {
    return this.maxlength != null ? this._validator(c) : null;
  }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

  private _createValidator(): void {
    this._validator = Validators.maxLength(parseInt(this.maxlength, 10));
  }
}


export const PATTERN_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => PatternValidator),
  multi: true
};


/**
 * A Directive that adds the `pattern` validator to any controls marked with the
 * `pattern` attribute, via the {@link NG_VALIDATORS} binding. Uses attribute value
 * as the regex to validate Control value against.  Follows pattern attribute
 * semantics; i.e. regex must match entire Control value.
 *
 * ### Example
 *
 * ```
 * <input [name]="fullName" pattern="[a-zA-Z ]*" ngModel>
 * ```
 * @stable
 */
@Directive({
  selector: '[pattern][formControlName],[pattern][formControl],[pattern][ngModel]',
  providers: [PATTERN_VALIDATOR],
  host: {'[attr.pattern]': 'pattern ? pattern : null'}
})
export class PatternValidator implements Validator,
    OnChanges {
  private _validator: ValidatorFn;
  private _onChange: () => void;

  @Input() pattern: string|RegExp;

  ngOnChanges(changes: SimpleChanges): void {
    if ('pattern' in changes) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(c: AbstractControl): ValidationErrors|null { return this._validator(c); }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }

  private _createValidator(): void { this._validator = Validators.pattern(this.pattern); }
}
