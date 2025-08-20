/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  InjectionToken,
  ɵisPromise as isPromise,
  ɵisSubscribable as isSubscribable,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';
import {forkJoin, from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import type {
  AsyncValidator,
  AsyncValidatorFn,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from './directives/validators';
import {RuntimeErrorCode} from './errors';
import type {AbstractControl} from './model/abstract_model';

function isEmptyInputValue(value: unknown): boolean {
  return value == null || lengthOrSize(value) === 0;
}

/**
 * Extract the length property in case it's an array or a string.
 * Extract the size property in case it's a set.
 * Return null else.
 * @param value Either an array, set or undefined.
 */
function lengthOrSize(value: unknown): number | null {
  // non-strict comparison is intentional, to check for both `null` and `undefined` values
  if (value == null) {
    return null;
  } else if (Array.isArray(value) || typeof value === 'string') {
    return value.length;
  } else if (value instanceof Set) {
    return value.size;
  }

  return null;
}

/**
 * @description
 * An `InjectionToken` for registering additional synchronous validators used with
 * `AbstractControl`s.
 *
 * @see {@link NG_ASYNC_VALIDATORS}
 *
 * @usageNotes
 *
 * ### Providing a custom validator
 *
 * The following example registers a custom validator directive. Adding the validator to the
 * existing collection of validators requires the `multi: true` option.
 *
 * ```ts
 * @Directive({
 *   selector: '[customValidator]',
 *   providers: [{provide: NG_VALIDATORS, useExisting: forwardRef(() => CustomValidatorDirective), multi: true}]
 * })
 * class CustomValidatorDirective implements Validator {
 *   validate(control: AbstractControl): ValidationErrors | null {
 *     return { 'custom': true };
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export const NG_VALIDATORS = new InjectionToken<ReadonlyArray<Validator | Function>>(
  ngDevMode ? 'NgValidators' : '',
);

/**
 * @description
 * An `InjectionToken` for registering additional asynchronous validators used with
 * `AbstractControl`s.
 *
 * @see {@link NG_VALIDATORS}
 *
 * @usageNotes
 *
 * ### Provide a custom async validator directive
 *
 * The following example implements the `AsyncValidator` interface to create an
 * async validator directive with a custom error key.
 *
 * ```ts
 * @Directive({
 *   selector: '[customAsyncValidator]',
 *   providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: CustomAsyncValidatorDirective, multi:
 * true}]
 * })
 * class CustomAsyncValidatorDirective implements AsyncValidator {
 *   validate(control: AbstractControl): Promise<ValidationErrors|null> {
 *     return Promise.resolve({'custom': true});
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export const NG_ASYNC_VALIDATORS = new InjectionToken<ReadonlyArray<Validator | Function>>(
  ngDevMode ? 'NgAsyncValidators' : '',
);

/**
 * A regular expression that matches valid e-mail addresses.
 *
 * At a high level, this regexp matches e-mail addresses of the format `local-part@tld`, where:
 * - `local-part` consists of one or more of the allowed characters (alphanumeric and some
 *   punctuation symbols).
 * - `local-part` cannot begin or end with a period (`.`).
 * - `local-part` cannot be longer than 64 characters.
 * - `tld` consists of one or more `labels` separated by periods (`.`). For example `localhost` or
 *   `foo.com`.
 * - A `label` consists of one or more of the allowed characters (alphanumeric, dashes (`-`) and
 *   periods (`.`)).
 * - A `label` cannot begin or end with a dash (`-`) or a period (`.`).
 * - A `label` cannot be longer than 63 characters.
 * - The whole address cannot be longer than 254 characters.
 *
 * ## Implementation background
 *
 * This regexp was ported over from AngularJS (see there for git history):
 * https://github.com/angular/angular.js/blob/c133ef836/src/ng/directive/input.js#L27
 * It is based on the
 * [WHATWG version](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) with
 * some enhancements to incorporate more RFC rules (such as rules related to domain names and the
 * lengths of different parts of the address). The main differences from the WHATWG version are:
 *   - Disallow `local-part` to begin or end with a period (`.`).
 *   - Disallow `local-part` length to exceed 64 characters.
 *   - Disallow total address length to exceed 254 characters.
 *
 * See [this commit](https://github.com/angular/angular.js/commit/f3f5cf72e) for more details.
 */
const EMAIL_REGEXP =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * @description
 * Provides a set of built-in validators that can be used by form controls.
 *
 * A validator is a function that processes a `FormControl` or collection of
 * controls and returns an error map or null. A null map means that validation has passed.
 *
 * @see [Form Validation](guide/forms/form-validation)
 *
 * @publicApi
 */
export class Validators {
  /**
   * @description
   * Validator that requires the control's value to be greater than or equal to the provided number.
   *
   * @usageNotes
   *
   * ### Validate against a minimum of 3
   *
   * ```ts
   * const control = new FormControl(2, Validators.min(3));
   *
   * console.log(control.errors); // {min: {min: 3, actual: 2}}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `min` property if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static min(min: number): ValidatorFn {
    return minValidator(min);
  }

  /**
   * @description
   * Validator that requires the control's value to be less than or equal to the provided number.
   *
   * @usageNotes
   *
   * ### Validate against a maximum of 15
   *
   * ```ts
   * const control = new FormControl(16, Validators.max(15));
   *
   * console.log(control.errors); // {max: {max: 15, actual: 16}}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `max` property if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static max(max: number): ValidatorFn {
    return maxValidator(max);
  }

  /**
   * @description
   * Validator that requires the control have a non-empty value.
   *
   * @usageNotes
   *
   * ### Validate that the field is non-empty
   *
   * ```ts
   * const control = new FormControl('', Validators.required);
   *
   * console.log(control.errors); // {required: true}
   * ```
   *
   * @returns An error map with the `required` property
   * if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static required(control: AbstractControl): ValidationErrors | null {
    return requiredValidator(control);
  }

  /**
   * @description
   * Validator that requires the control's value be true. This validator is commonly
   * used for required checkboxes.
   *
   * @usageNotes
   *
   * ### Validate that the field value is true
   *
   * ```ts
   * const control = new FormControl('some value', Validators.requiredTrue);
   *
   * console.log(control.errors); // {required: true}
   * ```
   *
   * @returns An error map that contains the `required` property
   * set to `true` if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static requiredTrue(control: AbstractControl): ValidationErrors | null {
    return requiredTrueValidator(control);
  }

  /**
   * @description
   * Validator that requires the control's value pass an email validation test.
   *
   * Tests the value using a [regular
   * expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
   * pattern suitable for common use cases. The pattern is based on the definition of a valid email
   * address in the [WHATWG HTML
   * specification](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) with
   * some enhancements to incorporate more RFC rules (such as rules related to domain names and the
   * lengths of different parts of the address).
   *
   * The differences from the WHATWG version include:
   * - Disallow `local-part` (the part before the `@` symbol) to begin or end with a period (`.`).
   * - Disallow `local-part` to be longer than 64 characters.
   * - Disallow the whole address to be longer than 254 characters.
   *
   * If this pattern does not satisfy your business needs, you can use `Validators.pattern()` to
   * validate the value against a different pattern.
   *
   * @usageNotes
   *
   * ### Validate that the field matches a valid email pattern
   *
   * ```ts
   * const control = new FormControl('bad@', Validators.email);
   *
   * console.log(control.errors); // {email: true}
   * ```
   *
   * @returns An error map with the `email` property
   * if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static email(control: AbstractControl): ValidationErrors | null {
    return emailValidator(control);
  }

  /**
   * @description
   * Validator that requires the number of items in the control's value to be greater than or equal
   * to the provided minimum length. This validator is also provided by default if you use
   * the HTML5 `minlength` attribute. Note that the `minLength` validator is intended to be used
   * only for types that have a numeric `length` or `size` property, such as strings, arrays or
   * sets. The `minLength` validator logic is also not invoked for values when their `length` or
   * `size` property is 0 (for example in case of an empty string or an empty array), to support
   * optional controls. You can use the standard `required` validator if empty values should not be
   * considered valid.
   *
   * @usageNotes
   *
   * ### Validate that the field has a minimum of 3 characters
   *
   * ```ts
   * const control = new FormControl('ng', Validators.minLength(3));
   *
   * console.log(control.errors); // {minlength: {requiredLength: 3, actualLength: 2}}
   * ```
   *
   * ```html
   * <input minlength="5">
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `minlength` property if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static minLength(minLength: number): ValidatorFn {
    return minLengthValidator(minLength);
  }

  /**
   * @description
   * Validator that requires the number of items in the control's value to be less than or equal
   * to the provided maximum length. This validator is also provided by default if you use
   * the HTML5 `maxlength` attribute. Note that the `maxLength` validator is intended to be used
   * only for types that have a numeric `length` or `size` property, such as strings, arrays or
   * sets.
   *
   * @usageNotes
   *
   * ### Validate that the field has maximum of 5 characters
   *
   * ```ts
   * const control = new FormControl('Angular', Validators.maxLength(5));
   *
   * console.log(control.errors); // {maxlength: {requiredLength: 5, actualLength: 7}}
   * ```
   *
   * ```html
   * <input maxlength="5">
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `maxlength` property if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static maxLength(maxLength: number): ValidatorFn {
    return maxLengthValidator(maxLength);
  }

  /**
   * @description
   * Validator that requires the control's value to match a regex pattern. This validator is also
   * provided by default if you use the HTML5 `pattern` attribute.
   *
   * @usageNotes
   *
   * ### Validate that the field only contains letters or spaces
   *
   * ```ts
   * const control = new FormControl('1', Validators.pattern('[a-zA-Z ]*'));
   *
   * console.log(control.errors); // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
   * ```
   *
   * ```html
   * <input pattern="[a-zA-Z ]*">
   * ```
   *
   * ### Pattern matching with the global or sticky flag
   *
   * `RegExp` objects created with the `g` or `y` flags that are passed into `Validators.pattern`
   * can produce different results on the same input when validations are run consecutively. This is
   * due to how the behavior of `RegExp.prototype.test` is
   * specified in [ECMA-262](https://tc39.es/ecma262/#sec-regexpbuiltinexec)
   * (`RegExp` preserves the index of the last match when the global or sticky flag is used).
   * Due to this behavior, it is recommended that when using
   * `Validators.pattern` you **do not** pass in a `RegExp` object with either the global or sticky
   * flag enabled.
   *
   * ```ts
   * // Not recommended (since the `g` flag is used)
   * const controlOne = new FormControl('1', Validators.pattern(/foo/g));
   *
   * // Good
   * const controlTwo = new FormControl('1', Validators.pattern(/foo/));
   * ```
   *
   * @param pattern A regular expression to be used as is to test the values, or a string.
   * If a string is passed, the `^` character is prepended and the `$` character is
   * appended to the provided string (if not already present), and the resulting regular
   * expression is used to test the values.
   *
   * @returns A validator function that returns an error map with the
   * `pattern` property if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static pattern(pattern: string | RegExp): ValidatorFn {
    return patternValidator(pattern);
  }

  /**
   * @description
   * Validator that performs no operation.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static nullValidator(control: AbstractControl): ValidationErrors | null {
    return nullValidator(control);
  }

  /**
   * @description
   * Compose multiple validators into a single function that returns the union
   * of the individual error maps for the provided control.
   *
   * @returns A validator function that returns an error map with the
   * merged error maps of the validators if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static compose(validators: null): null;
  static compose(validators: (ValidatorFn | null | undefined)[]): ValidatorFn | null;
  static compose(validators: (ValidatorFn | null | undefined)[] | null): ValidatorFn | null {
    return compose(validators);
  }

  /**
   * @description
   * Compose multiple async validators into a single function that returns the union
   * of the individual error objects for the provided control.
   *
   * @returns A validator function that returns an error map with the
   * merged error objects of the async validators if the validation check fails, otherwise `null`.
   *
   * @see {@link /api/forms/AbstractControl#updateValueAndValidity updateValueAndValidity}
   *
   */
  static composeAsync(validators: (AsyncValidatorFn | null)[]): AsyncValidatorFn | null {
    return composeAsync(validators);
  }
}

/**
 * Validator that requires the control's value to be greater than or equal to the provided number.
 * See `Validators.min` for additional information.
 */
export function minValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || min == null) {
      return null; // don't validate empty values to allow optional controls
    }
    const value = parseFloat(control.value);
    // Controls with NaN values after parsing should be treated as not having a
    // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
    return !isNaN(value) && value < min ? {'min': {'min': min, 'actual': control.value}} : null;
  };
}

/**
 * Validator that requires the control's value to be less than or equal to the provided number.
 * See `Validators.max` for additional information.
 */
export function maxValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || max == null) {
      return null; // don't validate empty values to allow optional controls
    }
    const value = parseFloat(control.value);
    // Controls with NaN values after parsing should be treated as not having a
    // maximum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-max
    return !isNaN(value) && value > max ? {'max': {'max': max, 'actual': control.value}} : null;
  };
}

/**
 * Validator that requires the control have a non-empty value.
 * See `Validators.required` for additional information.
 */
export function requiredValidator(control: AbstractControl): ValidationErrors | null {
  return isEmptyInputValue(control.value) ? {'required': true} : null;
}

/**
 * Validator that requires the control's value be true. This validator is commonly
 * used for required checkboxes.
 * See `Validators.requiredTrue` for additional information.
 */
export function requiredTrueValidator(control: AbstractControl): ValidationErrors | null {
  return control.value === true ? null : {'required': true};
}

/**
 * Validator that requires the control's value pass an email validation test.
 * See `Validators.email` for additional information.
 */
export function emailValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmptyInputValue(control.value)) {
    return null; // don't validate empty values to allow optional controls
  }
  return EMAIL_REGEXP.test(control.value) ? null : {'email': true};
}

/**
 * Validator that requires the number of items in the control's value to be greater than or equal
 * to the provided minimum length. See `Validators.minLength` for additional information.
 *
 * The minLengthValidator respects every length property in an object, regardless of whether it's an array.
 * For example, the object {id: 1, length: 0, width: 0} should be validated.
 */
export function minLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = control.value?.length ?? lengthOrSize(control.value);
    if (length === null || length === 0) {
      // don't validate empty values to allow optional controls
      // don't validate values without `length` or `size` property
      return null;
    }

    return length < minLength
      ? {'minlength': {'requiredLength': minLength, 'actualLength': length}}
      : null;
  };
}

/**
 * Validator that requires the number of items in the control's value to be less than or equal
 * to the provided maximum length. See `Validators.maxLength` for additional information.
 *
 * The maxLengthValidator respects every length property in an object, regardless of whether it's an array.
 * For example, the object {id: 1, length: 0, width: 0} should be validated.
 */
export function maxLengthValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = control.value?.length ?? lengthOrSize(control.value);
    if (length !== null && length > maxLength) {
      return {'maxlength': {'requiredLength': maxLength, 'actualLength': length}};
    }
    return null;
  };
}

/**
 * Validator that requires the control's value to match a regex pattern.
 * See `Validators.pattern` for additional information.
 */
export function patternValidator(pattern: string | RegExp): ValidatorFn {
  if (!pattern) return nullValidator;
  let regex: RegExp;
  let regexStr: string;
  if (typeof pattern === 'string') {
    regexStr = '';

    if (pattern.charAt(0) !== '^') regexStr += '^';

    regexStr += pattern;

    if (pattern.charAt(pattern.length - 1) !== '$') regexStr += '$';

    regex = new RegExp(regexStr);
  } else {
    regexStr = pattern.toString();
    regex = pattern;
  }
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyInputValue(control.value)) {
      return null; // don't validate empty values to allow optional controls
    }
    const value: string = control.value;
    return regex.test(value)
      ? null
      : {'pattern': {'requiredPattern': regexStr, 'actualValue': value}};
  };
}

/**
 * Function that has `ValidatorFn` shape, but performs no operation.
 */
export function nullValidator(control: AbstractControl): ValidationErrors | null {
  return null;
}

function isPresent(o: any): boolean {
  return o != null;
}

export function toObservable(value: any): Observable<any> {
  const obs = isPromise(value) ? from(value) : value;
  if ((typeof ngDevMode === 'undefined' || ngDevMode) && !isSubscribable(obs)) {
    let errorMessage = `Expected async validator to return Promise or Observable.`;
    // A synchronous validator will return object or null.
    if (typeof value === 'object') {
      errorMessage +=
        ' Are you using a synchronous validator where an async validator is expected?';
    }
    throw new RuntimeError(RuntimeErrorCode.WRONG_VALIDATOR_RETURN_TYPE, errorMessage);
  }
  return obs;
}

function mergeErrors(arrayOfErrors: (ValidationErrors | null)[]): ValidationErrors | null {
  let res: {[key: string]: any} = {};
  arrayOfErrors.forEach((errors: ValidationErrors | null) => {
    res = errors != null ? {...res!, ...errors} : res!;
  });

  return Object.keys(res).length === 0 ? null : res;
}

type GenericValidatorFn = (control: AbstractControl) => any;

function executeValidators<V extends GenericValidatorFn>(
  control: AbstractControl,
  validators: V[],
): ReturnType<V>[] {
  return validators.map((validator) => validator(control));
}

function isValidatorFn<V>(validator: V | Validator | AsyncValidator): validator is V {
  return !(validator as Validator).validate;
}

/**
 * Given the list of validators that may contain both functions as well as classes, return the list
 * of validator functions (convert validator classes into validator functions). This is needed to
 * have consistent structure in validators list before composing them.
 *
 * @param validators The set of validators that may contain validators both in plain function form
 *     as well as represented as a validator class.
 */
export function normalizeValidators<V>(validators: (V | Validator | AsyncValidator)[]): V[] {
  return validators.map((validator) => {
    return isValidatorFn<V>(validator)
      ? validator
      : (((c: AbstractControl) => validator.validate(c)) as unknown as V);
  });
}

/**
 * Merges synchronous validators into a single validator function.
 * See `Validators.compose` for additional information.
 */
function compose(validators: (ValidatorFn | null | undefined)[] | null): ValidatorFn | null {
  if (!validators) return null;
  const presentValidators: ValidatorFn[] = validators.filter(isPresent) as any;
  if (presentValidators.length == 0) return null;

  return function (control: AbstractControl) {
    return mergeErrors(executeValidators<ValidatorFn>(control, presentValidators));
  };
}

/**
 * Accepts a list of validators of different possible shapes (`Validator` and `ValidatorFn`),
 * normalizes the list (converts everything to `ValidatorFn`) and merges them into a single
 * validator function.
 */
export function composeValidators(validators: Array<Validator | ValidatorFn>): ValidatorFn | null {
  return validators != null ? compose(normalizeValidators<ValidatorFn>(validators)) : null;
}

/**
 * Merges asynchronous validators into a single validator function.
 * See `Validators.composeAsync` for additional information.
 */
function composeAsync(validators: (AsyncValidatorFn | null)[]): AsyncValidatorFn | null {
  if (!validators) return null;
  const presentValidators: AsyncValidatorFn[] = validators.filter(isPresent) as any;
  if (presentValidators.length == 0) return null;

  return function (control: AbstractControl) {
    const observables = executeValidators<AsyncValidatorFn>(control, presentValidators).map(
      toObservable,
    );
    return forkJoin(observables).pipe(map(mergeErrors));
  };
}

/**
 * Accepts a list of async validators of different possible shapes (`AsyncValidator` and
 * `AsyncValidatorFn`), normalizes the list (converts everything to `AsyncValidatorFn`) and merges
 * them into a single validator function.
 */
export function composeAsyncValidators(
  validators: Array<AsyncValidator | AsyncValidatorFn>,
): AsyncValidatorFn | null {
  return validators != null
    ? composeAsync(normalizeValidators<AsyncValidatorFn>(validators))
    : null;
}

/**
 * Merges raw control validators with a given directive validator and returns the combined list of
 * validators as an array.
 */
export function mergeValidators<V>(controlValidators: V | V[] | null, dirValidator: V): V[] {
  if (controlValidators === null) return [dirValidator];
  return Array.isArray(controlValidators)
    ? [...controlValidators, dirValidator]
    : [controlValidators, dirValidator];
}

/**
 * Retrieves the list of raw synchronous validators attached to a given control.
 */
export function getControlValidators(control: AbstractControl): ValidatorFn | ValidatorFn[] | null {
  return (control as any)._rawValidators as ValidatorFn | ValidatorFn[] | null;
}

/**
 * Retrieves the list of raw asynchronous validators attached to a given control.
 */
export function getControlAsyncValidators(
  control: AbstractControl,
): AsyncValidatorFn | AsyncValidatorFn[] | null {
  return (control as any)._rawAsyncValidators as AsyncValidatorFn | AsyncValidatorFn[] | null;
}

/**
 * Accepts a singleton validator, an array, or null, and returns an array type with the provided
 * validators.
 *
 * @param validators A validator, validators, or null.
 * @returns A validators array.
 */
export function makeValidatorsArray<T extends ValidatorFn | AsyncValidatorFn>(
  validators: T | T[] | null,
): T[] {
  if (!validators) return [];
  return Array.isArray(validators) ? validators : [validators];
}

/**
 * Determines whether a validator or validators array has a given validator.
 *
 * @param validators The validator or validators to compare against.
 * @param validator The validator to check.
 * @returns Whether the validator is present.
 */
export function hasValidator<T extends ValidatorFn | AsyncValidatorFn>(
  validators: T | T[] | null,
  validator: T,
): boolean {
  return Array.isArray(validators) ? validators.includes(validator) : validators === validator;
}

/**
 * Combines two arrays of validators into one. If duplicates are provided, only one will be added.
 *
 * @param validators The new validators.
 * @param currentValidators The base array of current validators.
 * @returns An array of validators.
 */
export function addValidators<T extends ValidatorFn | AsyncValidatorFn>(
  validators: T | T[],
  currentValidators: T | T[] | null,
): T[] {
  const current = makeValidatorsArray(currentValidators);
  const validatorsToAdd = makeValidatorsArray(validators);
  validatorsToAdd.forEach((v: T) => {
    // Note: if there are duplicate entries in the new validators array,
    // only the first one would be added to the current list of validators.
    // Duplicate ones would be ignored since `hasValidator` would detect
    // the presence of a validator function and we update the current list in place.
    if (!hasValidator(current, v)) {
      current.push(v);
    }
  });
  return current;
}

export function removeValidators<T extends ValidatorFn | AsyncValidatorFn>(
  validators: T | T[],
  currentValidators: T | T[] | null,
): T[] {
  return makeValidatorsArray(currentValidators).filter((v) => !hasValidator(validators, v));
}
