import {forwardRef, Provider, OpaqueToken} from 'angular2/src/core/di';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {Attribute, Directive} from 'angular2/src/core/metadata';
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
 * # Example
 *
 * ```
 * <input ng-control="fullName" required>
 * ```
 */
@Directive({
  selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]',
  providers: [REQUIRED_VALIDATOR]
})
export class RequiredValidator {
}

const MIN_LENGTH_VALIDATOR = CONST_EXPR(
    new Provider(NG_VALIDATORS, {useExisting: forwardRef(() => MinLengthValidator), multi: true}));
@Directive({
  selector: '[minlength][ng-control],[minlength][ng-form-control],[minlength][ng-model]',
  providers: [MIN_LENGTH_VALIDATOR]
})
export class MinLengthValidator implements Validator {
  private _validator: Function;

  constructor(@Attribute("minlength") minLength: string) {
    this._validator = Validators.minLength(NumberWrapper.parseInt(minLength, 10));
  }

  validate(c: Control): {[key: string]: any} { return this._validator(c); }
}

const MAX_LENGTH_VALIDATOR = CONST_EXPR(
    new Provider(NG_VALIDATORS, {useExisting: forwardRef(() => MaxLengthValidator), multi: true}));
@Directive({
  selector: '[maxlength][ng-control],[maxlength][ng-form-control],[maxlength][ng-model]',
  providers: [MAX_LENGTH_VALIDATOR]
})
export class MaxLengthValidator implements Validator {
  private _validator: Function;

  constructor(@Attribute("maxlength") minLength: string) {
    this._validator = Validators.maxLength(NumberWrapper.parseInt(minLength, 10));
  }

  validate(c: Control): {[key: string]: any} { return this._validator(c); }
}