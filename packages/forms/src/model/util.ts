/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncValidatorFn, ValidatorFn} from '../directives/validators';
import {addValidators, composeAsyncValidators, composeValidators, hasValidator, removeValidators, toObservable} from '../validators';

import {AbstractControl, AbstractControlOptions} from './api';

/**
 * Creates validator function by combining provided validators.
 */
export function coerceToValidator(validator: ValidatorFn|ValidatorFn[]|null): ValidatorFn|null {
  return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}

/**
 * Creates async validator function by combining provided async validators.
 */
export function coerceToAsyncValidator(asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|
                                       null): AsyncValidatorFn|null {
  return Array.isArray(asyncValidator) ? composeAsyncValidators(asyncValidator) :
                                         asyncValidator || null;
}

export function _find(
    control: AbstractControl, path: Array<string|number>|string, delimiter: string) {
  if (path == null) return null;

  if (!Array.isArray(path)) {
    path = path.split(delimiter);
  }
  if (Array.isArray(path) && path.length === 0) return null;

  // Not using Array.reduce here due to a Chrome 80 bug
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
  let controlToFind: AbstractControl|null = control;
  for (const name of path) {
    controlToFind = controlToFind && controlToFind._find(name);
    //   if (isFormGroup(controlToFind)) {
    //     controlToFind = controlToFind.controls.hasOwnProperty(name as string) ?
    //         controlToFind.controls[name] :
    //         null;
    //   } else if (isFormArray(controlToFind)) {
    //     controlToFind = controlToFind.at(<number>name) || null;
    //   } else {
    //     controlToFind = null;
    //   }
  }
  return controlToFind;
}

export function isOptionsObj(validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|
                             null): validatorOrOpts is AbstractControlOptions {
  return validatorOrOpts != null && !Array.isArray(validatorOrOpts) &&
      typeof validatorOrOpts === 'object';
}


/**
 * Gets validators from either an options object or given validators.
 */
export function pickValidators(validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|
                               null): ValidatorFn|ValidatorFn[]|null {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.validators : validatorOrOpts) || null;
}

/**
 * Gets async validators from either an options object or given validators.
 */
export function pickAsyncValidators(
    asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null,
    validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null): AsyncValidatorFn|
    AsyncValidatorFn[]|null {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.asyncValidators : asyncValidator) || null;
}
