import {isBlank, isPresent, CONST_EXPR} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/promise';
import {ObservableWrapper} from 'angular2/src/facade/async';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
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
export const NG_ASYNC_VALIDATORS: OpaqueToken = CONST_EXPR(new OpaqueToken("NgAsyncValidators"));

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
    if (isBlank(validators)) return null;
    var presentValidators = validators.filter(isPresent);
    if (presentValidators.length == 0) return null;

    return function(control: modelModule.AbstractControl) {
      return _mergeErrors(_executeValidators(control, presentValidators));
    };
  }

  static composeAsync(validators: Function[]): Function {
    if (isBlank(validators)) return null;
    var presentValidators = validators.filter(isPresent);
    if (presentValidators.length == 0) return null;

    return function(control: modelModule.AbstractControl) {
      let promises = _executeValidators(control, presentValidators).map(_convertToPromise);
      return PromiseWrapper.all(promises).then(_mergeErrors);
    };
  }
}

function _convertToPromise(obj: any): any {
  return PromiseWrapper.isPromise(obj) ? obj : ObservableWrapper.toPromise(obj);
}

function _executeValidators(control: modelModule.AbstractControl, validators: Function[]): any[] {
  return validators.map(v => v(control));
}

function _mergeErrors(arrayOfErrors: any[]): {[key: string]: any} {
  var res = arrayOfErrors.reduce((res, errors) => {
    return isPresent(errors) ? StringMapWrapper.merge(<any>res, <any>errors) : res;
  }, {});
  return StringMapWrapper.isEmpty(res) ? null : res;
}
