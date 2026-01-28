/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractControl, FormArray, FormGroup, ValidationErrors} from '@angular/forms';
import {ValidationError} from '../api/rules';
import {FieldTree} from '../api/types';

/**
 * An error used for compat errors.
 *
 * @experimental 21.0.0
 * @category interop
 */
export class CompatValidationError<T = unknown> implements ValidationError {
  readonly kind: string = 'compat';
  readonly control: AbstractControl;
  readonly fieldTree!: FieldTree<unknown>;
  readonly context: T;
  readonly message?: string;

  constructor({context, kind, control}: {context: T; kind: string; control: AbstractControl}) {
    this.context = context;
    this.kind = kind;
    this.control = control;
  }
}

/**
 * Converts signal forms validation errors to reactive forms ValidationErrors.
 *
 * @experimental 21.0.0
 */
export function signalErrorsToValidationErrors(errors: ValidationError[]): ValidationErrors | null {
  if (errors.length === 0) {
    return null;
  }
  const errObj: ValidationErrors = {};
  for (const error of errors) {
    errObj[error.kind] = error instanceof CompatValidationError ? error.context : error;
  }
  return errObj;
}

/**
 * Converts reactive form validation error to signal forms CompatValidationError.
 * @param errors
 * @param control
 * @return list of errors.
 */
export function reactiveErrorsToSignalErrors(
  errors: ValidationErrors | null,
  control: AbstractControl,
): CompatValidationError[] {
  if (errors === null) {
    return [];
  }

  return Object.entries(errors).map(([kind, context]) => {
    return new CompatValidationError({context, kind, control});
  });
}

/**
 * Extracts all reactive errors from a control and its children.
 * @param control
 * @return list of errors.
 */
export function extractNestedReactiveErrors(control: AbstractControl): CompatValidationError[] {
  const errors: CompatValidationError[] = [];

  if (control.errors) {
    errors.push(...reactiveErrorsToSignalErrors(control.errors, control));
  }

  if (control instanceof FormGroup || control instanceof FormArray) {
    for (const c of Object.values(control.controls)) {
      errors.push(...extractNestedReactiveErrors(c));
    }
  }

  return errors;
}
