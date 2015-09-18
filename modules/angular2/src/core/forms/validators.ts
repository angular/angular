import {isBlank, isPresent, CONST_EXPR} from 'angular2/src/core/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {OpaqueToken} from 'angular2/src/core/di';

import * as modelModule from './model';

/**
 * Providers for validators to be used for {@link Control}s in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * ### Example
 *
 * ```typescript
 * var providers = [
 *   new Provider(NG_VALIDATORS, {useValue: myValidator, multi: true})
 * ];
 * ```
 */
export const NG_VALIDATORS: OpaqueToken = CONST_EXPR(new OpaqueToken("NgValidators"));

/**
 * Provides a set of validators used by form controls.
 *
 * A validator is a function that processes a {@link Control} or collection of
 * controls and returns a {@link StringMap} of errors. A null map means that
 * validation has passed.
 *
 * # Example
 *
 * ```typescript
 * var loginControl = new Control("", Validators.required)
 * ```
 */
export class Validators {
  /**
   * Validator that requires controls to have a non-empty value.
   */
  static required(control: modelModule.Control): {[key: string]: boolean} {
    return isBlank(control.value) || control.value == "" ? {"required": true} : null;
  }

  /**
   * Validator that requires controls to have a value of a minimum length.
   */
  static minLength(minLength: number): Function {
    return (control: modelModule.Control): {[key: string]: any} => {
      if (isPresent(Validators.required(control))) return null;
      var v: string = control.value;
      return v.length < minLength ?
                 {"minlength": {"requiredLength": minLength, "actualLength": v.length}} :
                 null;
    };
  }

  /**
   * Validator that requires controls to have a value of a maximum length.
   */
  static maxLength(maxLength: number): Function {
    return (control: modelModule.Control): {[key: string]: any} => {
      if (isPresent(Validators.required(control))) return null;
      var v: string = control.value;
      return v.length > maxLength ?
                 {"maxlength": {"requiredLength": maxLength, "actualLength": v.length}} :
                 null;
    };
  }

  /**
   * No-op validator.
   */
  static nullValidator(c: any): {[key: string]: boolean} { return null; }

  /**
   * Compose multiple validators into a single function that returns the union
   * of the individual error maps.
   */
  static compose(validators: Function[]): Function {
    if (isBlank(validators)) return Validators.nullValidator;

    return function(control: modelModule.AbstractControl) {
      var res = ListWrapper.reduce(validators, (res, validator) => {
        var errors = isPresent(validator) ? validator(control) : null;
        return isPresent(errors) ? StringMapWrapper.merge(<any>res, <any>errors) : res;
      }, {});
      return StringMapWrapper.isEmpty(res) ? null : res;
    };
  }
}
