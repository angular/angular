/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, OnChanges, SimpleChanges, forwardRef} from '@angular/core';

import {isPresent} from '../facade/lang';
import {AbstractControl} from '../model';
import {NG_VALIDATORS, Validators} from '../validators';



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
  validate(c: AbstractControl): {[key: string]: any};
  registerOnValidatorChange?(fn: () => void): void;
}

export const REQUIRED_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => RequiredValidator),
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
  selector: '[required][formControlName],[required][formControl],[required][ngModel]',
  providers: [REQUIRED_VALIDATOR],
  host: {'[attr.required]': 'required? "" : null'}
})
export class RequiredValidator implements Validator {
  private _required: boolean;
  private _onChange: () => void;

  @Input()
  get required(): boolean { return this._required; }

  set required(value: boolean) {
    this._required = isPresent(value) && `${value}` !== 'false';
    if (this._onChange) this._onChange();
  }

  validate(c: AbstractControl): {[key: string]: any} {
    return this.required ? Validators.required(c) : null;
  }

  registerOnValidatorChange(fn: () => void) { this._onChange = fn; }
}

/**
 * @stable
 */
export interface ValidatorFn { (c: AbstractControl): {[key: string]: any}; }

/**
 * @stable
 */
export interface AsyncValidatorFn {
  (c: AbstractControl): any /*Promise<{[key: string]: any}>|Observable<{[key: string]: any}>*/;
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
  host: {'[attr.minlength]': 'minlength? minlength : null'}
})
export class MinLengthValidator implements Validator,
    OnChanges {
  private _validator: ValidatorFn;
  private _onChange: () => void;

  @Input() minlength: string;

  private _createValidator() {
    this._validator = Validators.minLength(parseInt(this.minlength, 10));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['minlength']) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(c: AbstractControl): {[key: string]: any} {
    return isPresent(this.minlength) ? this._validator(c) : null;
  }

  registerOnValidatorChange(fn: () => void) { this._onChange = fn; }
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
  host: {'[attr.maxlength]': 'maxlength? maxlength : null'}
})
export class MaxLengthValidator implements Validator,
    OnChanges {
  private _validator: ValidatorFn;
  private _onChange: () => void;

  @Input() maxlength: string;

  private _createValidator() {
    this._validator = Validators.maxLength(parseInt(this.maxlength, 10));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['maxlength']) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(c: AbstractControl): {[key: string]: any} {
    return isPresent(this.maxlength) ? this._validator(c) : null;
  }

  registerOnValidatorChange(fn: () => void) { this._onChange = fn; }
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
  host: {'[attr.pattern]': 'pattern? pattern : null'}
})
export class PatternValidator implements Validator,
    OnChanges {
  private _validator: ValidatorFn;
  private _onChange: () => void;

  @Input() pattern: string;

  private _createValidator() { this._validator = Validators.pattern(this.pattern); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pattern']) {
      this._createValidator();
      if (this._onChange) this._onChange();
    }
  }

  validate(c: AbstractControl): {[key: string]: any} {
    return isPresent(this.pattern) ? this._validator(c) : null;
  }

  registerOnValidatorChange(fn: () => void) { this._onChange = fn; }
}
