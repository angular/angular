import {isBlank, isPresent} from 'angular2/src/core/facade/lang';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {OpaqueToken} from 'angular2/src/core/di';

import * as modelModule from './model';

export const NG_VALIDATORS: OpaqueToken = CONST_EXPR(new OpaqueToken("NgValidators"));

/**
 * Provides a set of validators used by form controls.
 *
 * ### Example
 *
 * ```
 * var loginControl = new Control("", Validators.required)
 * ```
 */
export class Validators {
  static required(control: modelModule.Control): {[key: string]: boolean} {
    return isBlank(control.value) || control.value == "" ? {"required": true} : null;
  }

  static minLength(minLength: number): Function {
    return (control: modelModule.Control): {[key: string]: any} => {
      if (isPresent(Validators.required(control))) return null;
      var v: string = control.value;
      return v.length < minLength ?
                 {"minlength": {"requiredLength": minLength, "actualLength": v.length}} :
                 null;
    };
  }

  static maxLength(maxLength: number): Function {
    return (control: modelModule.Control): {[key: string]: any} => {
      if (isPresent(Validators.required(control))) return null;
      var v: string = control.value;
      return v.length > maxLength ?
                 {"maxlength": {"requiredLength": maxLength, "actualLength": v.length}} :
                 null;
    };
  }

  static nullValidator(c: any): {[key: string]: boolean} { return null; }

  static compose(validators: Function[]): Function {
    if (isBlank(validators)) return Validators.nullValidator;

    return function(control: modelModule.AbstractControl) {
      var res = ListWrapper.reduce(validators, (res, validator) => {
        var errors = validator(control);
        return isPresent(errors) ? StringMapWrapper.merge(<any>res, <any>errors) : res;
      }, {});
      return StringMapWrapper.isEmpty(res) ? null : res;
    };
  }
}
