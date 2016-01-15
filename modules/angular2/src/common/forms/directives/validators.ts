import {forwardRef, Provider, OpaqueToken, Attribute, Directive} from 'angular2/core';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {Validators, NG_VALIDATORS} from '../validators';
import {Control} from '../model';
import * as modelModule from '../model';
import {NumberWrapper} from "angular2/src/facade/lang";


/**
 * An interface that can be implemented by classes that can act as validators.
 *
 * ## Usage
 *
 * ```typescript
 * @Directive({
 *   selector: '[custom-validator]',
 *   providers: [provide(NG_VALIDATORS, {useExisting: CustomValidatorDirective, multi: true})]
 * })
 * class CustomValidatorDirective implements Validator {
 *   validate(c: Control): {[key: string]: any} {
 *     return {"custom": true};
 *   }
 * }
 * ```
 */
export interface Validator { validate(c: modelModule.Control): {[key: string]: any}; }

const REQUIRED_VALIDATOR =
    CONST_EXPR(new Provider(NG_VALIDATORS, {useValue: Validators.required, multi: true}));

/**
 * A Directive that adds the `required` validator to any controls marked with the
 * `required` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input ngControl="fullName" required>
 * ```
 */
@Directive({
  selector: '[required][ngControl],[required][ngFormControl],[required][ngModel]',
  providers: [REQUIRED_VALIDATOR]
})
export class RequiredValidator {
}

/**
 * Provivder which adds {@link MinLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='min'}
 */
const MIN_LENGTH_VALIDATOR = CONST_EXPR(
    new Provider(NG_VALIDATORS, {useExisting: forwardRef(() => MinLengthValidator), multi: true}));

/**
 * A directive which installs the {@link MinLengthValidator} for any `ngControl`,
 * `ngFormControl`, or control with `ngModel` that also has a `minlength` attribute.
 */
@Directive({
  selector: '[minlength][ngControl],[minlength][ngFormControl],[minlength][ngModel]',
  providers: [MIN_LENGTH_VALIDATOR]
})
export class MinLengthValidator implements Validator {
  private _validator: Function;

  constructor(@Attribute("minlength") minLength: string) {
    this._validator = Validators.minLength(NumberWrapper.parseInt(minLength, 10));
  }

  validate(c: Control): {[key: string]: any} { return this._validator(c); }
}

/**
 * Provider which adds {@link MaxLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
const MAX_LENGTH_VALIDATOR = CONST_EXPR(
    new Provider(NG_VALIDATORS, {useExisting: forwardRef(() => MaxLengthValidator), multi: true}));

/**
 * A directive which installs the {@link MaxLengthValidator} for any `ngControl, `ngFormControl`,
 * or control with `ngModel` that also has a `maxlength` attribute.
 */
@Directive({
  selector: '[maxlength][ngControl],[maxlength][ngFormControl],[maxlength][ngModel]',
  providers: [MAX_LENGTH_VALIDATOR]
})
export class MaxLengthValidator implements Validator {
  private _validator: Function;

  constructor(@Attribute("maxlength") maxLength: string) {
    this._validator = Validators.maxLength(NumberWrapper.parseInt(maxLength, 10));
  }

  validate(c: Control): {[key: string]: any} { return this._validator(c); }
}
