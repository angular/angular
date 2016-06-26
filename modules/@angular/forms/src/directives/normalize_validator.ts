/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbstractControl} from '../model';

import {AsyncValidatorFn, Validator, ValidatorFn} from './validators';

export function normalizeValidator(validator: ValidatorFn | Validator): ValidatorFn {
  if ((<Validator>validator).validate !== undefined) {
    return (c: AbstractControl) => (<Validator>validator).validate(c);
  } else {
    return <ValidatorFn>validator;
  }
}

export function normalizeAsyncValidator(validator: AsyncValidatorFn | Validator): AsyncValidatorFn {
  if ((<Validator>validator).validate !== undefined) {
    return (c: AbstractControl) => (<Validator>validator).validate(c);
  } else {
    return <AsyncValidatorFn>validator;
  }
}
