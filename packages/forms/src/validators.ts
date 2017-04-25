/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, ɵisObservable as isObservable, ɵisPromise as isPromise} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {map} from 'rxjs/operator/map';
import {AsyncValidatorFn, ValidationErrors, Validator, ValidatorFn} from './directives/validators';
import {AbstractControl, FormControl} from './model';

function isEmptyInputValue(value: any): boolean {
  // we don't check for string here so it also works with arrays
  return value == null || value.length === 0;
}

/**
 * Providers for validators to be used for {@link FormControl}s in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * @stable
 */
export const NG_VALIDATORS = new InjectionToken<Array<Validator|Function>>('NgValidators');

/**
 * Providers for asynchronous validators to be used for {@link FormControl}s
 * in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * See {@link NG_VALIDATORS} for more details.
 *
 * @stable
 */
export const NG_ASYNC_VALIDATORS =
    new InjectionToken<Array<Validator|Function>>('NgAsyncValidators');

const EMAIL_REGEXP =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

/**
 * Provides a set of validators used by form controls.
 *
 * A validator is a function that processes a {@link FormControl} or collection of
 * controls and returns a map of errors. A null map means that validation has passed.
 *
 * ### Example
 *
 * ```typescript
 * var loginControl = new FormControl("", Validators.required)
 * ```
 *
 * @stable
 */
export class Validators {
  /**
   * Validator that requires controls to have a value greater than a number.
   */
  static min(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (isEmptyInputValue(control.value)) {
        return null;  // don't validate empty values to allow optional controls
      }
      const value = parseFloat(control.value);
      return isNaN(value) || value < min ? {'min': {'min': min, 'actual': control.value}} : null;
    };
  }

  /**
   * Validator that requires controls to have a value less than a number.
   */
  static max(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (isEmptyInputValue(control.value)) {
        return null;  // don't validate empty values to allow optional controls
      }
      const value = parseFloat(control.value);
      return isNaN(value) || value > max ? {'max': {'max': max, 'actual': control.value}} : null;
    };
  }

  /**
   * Validator that requires controls to have a non-empty value.
   */
  static required(control: AbstractControl): ValidationErrors|null {
    return isEmptyInputValue(control.value) ? {'required': true} : null;
  }

  /**
   * Validator that requires control value to be true.
   */
  static requiredTrue(control: AbstractControl): ValidationErrors|null {
    return control.value === true ? null : {'required': true};
  }

  /**
   * Validator that performs email validation.
   */
  static email(control: AbstractControl): ValidationErrors|null {
    return EMAIL_REGEXP.test(control.value) ? null : {'email': true};
  }

  /**
   * Validator that requires controls to have a value of a minimum length.
   */
  static minLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (isEmptyInputValue(control.value)) {
        return null;  // don't validate empty values to allow optional controls
      }
      const length: number = control.value ? control.value.length : 0;
      return length < minLength ?
          {'minlength': {'requiredLength': minLength, 'actualLength': length}} :
          null;
    };
  }

  /**
   * Validator that requires controls to have a value of a maximum length.
   */
  static maxLength(maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const length: number = control.value ? control.value.length : 0;
      return length > maxLength ?
          {'maxlength': {'requiredLength': maxLength, 'actualLength': length}} :
          null;
    };
  }

  /**
   * Validator that requires a control to match a regex to its value.
   */
  static pattern(pattern: string|RegExp): ValidatorFn {
    if (!pattern) return Validators.nullValidator;
    let regex: RegExp;
    let regexStr: string;
    if (typeof pattern === 'string') {
      regexStr = `^${pattern}$`;
      regex = new RegExp(regexStr);
    } else {
      regexStr = pattern.toString();
      regex = pattern;
    }
    return (control: AbstractControl): ValidationErrors | null => {
      if (isEmptyInputValue(control.value)) {
        return null;  // don't validate empty values to allow optional controls
      }
      const value: string = control.value;
      return regex.test(value) ? null :
                                 {'pattern': {'requiredPattern': regexStr, 'actualValue': value}};
    };
  }

  /**
   * No-op validator.
   */
  static nullValidator(c: AbstractControl): ValidationErrors|null { return null; }

  /**
   * Compose multiple validators into a single function that returns the union
   * of the individual error maps.
   */
  static compose(validators: null): null;
  static compose(validators: (ValidatorFn|null|undefined)[]): ValidatorFn|null;
  static compose(validators: (ValidatorFn|null|undefined)[]|null): ValidatorFn|null {
    if (!validators) return null;
    const presentValidators: ValidatorFn[] = validators.filter(isPresent) as any;
    if (presentValidators.length == 0) return null;

    return function(control: AbstractControl) {
      return _mergeErrors(_executeValidators(control, presentValidators));
    };
  }

  static composeAsync(validators: (AsyncValidatorFn|null)[]): AsyncValidatorFn|null {
    if (!validators) return null;
    const presentValidators: AsyncValidatorFn[] = validators.filter(isPresent) as any;
    if (presentValidators.length == 0) return null;

    return function(control: AbstractControl) {
      const observables = _executeAsyncValidators(control, presentValidators).map(toObservable);
      return map.call(forkJoin(observables), _mergeErrors);
    };
  }
}

function isPresent(o: any): boolean {
  return o != null;
}

export function toObservable(r: any): Observable<any> {
  const obs = isPromise(r) ? fromPromise(r) : r;
  if (!(isObservable(obs))) {
    throw new Error(`Expected validator to return Promise or Observable.`);
  }
  return obs;
}

function _executeValidators(control: AbstractControl, validators: ValidatorFn[]): any[] {
  return validators.map(v => v(control));
}

function _executeAsyncValidators(control: AbstractControl, validators: AsyncValidatorFn[]): any[] {
  return validators.map(v => v(control));
}

function _mergeErrors(arrayOfErrors: ValidationErrors[]): ValidationErrors|null {
  const res: {[key: string]: any} =
      arrayOfErrors.reduce((res: ValidationErrors | null, errors: ValidationErrors | null) => {
        return errors != null ? {...res !, ...errors} : res !;
      }, {});
  return Object.keys(res).length === 0 ? null : res;
}
