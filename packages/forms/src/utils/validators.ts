/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from '../directives/validators';
import {AbstractControl} from '../model';
import {Validators} from '../validators';


export function normalizeValidator(validator: ValidatorFn|Validator): ValidatorFn {
  if (!!(<Validator>validator).validate) {
    return (c: AbstractControl) => (<Validator>validator).validate(c);
  } else {
    return <ValidatorFn>validator;
  }
}

export function normalizeAsyncValidator(validator: AsyncValidatorFn|
                                        AsyncValidator): AsyncValidatorFn {
  if (!!(<AsyncValidator>validator).validate) {
    return (c: AbstractControl) => (<AsyncValidator>validator).validate(c);
  } else {
    return <AsyncValidatorFn>validator;
  }
}

/**
 * Merges synchronous validators into a single validator function (combined using
 * `Validators.compose`).
 */
export function composeValidators(validators: Array<Validator|ValidatorFn>): ValidatorFn|null {
  return validators != null ? Validators.compose(validators.map(normalizeValidator)) : null;
}

/**
 * Merges asynchronous validators into a single validator function (combined using
 * `Validators.composeAsync`).
 */
export function composeAsyncValidators(validators: Array<AsyncValidator|AsyncValidatorFn>):
    AsyncValidatorFn|null {
  return validators != null ? Validators.composeAsync(validators.map(normalizeAsyncValidator)) :
                              null;
}