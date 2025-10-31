/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractControl, FormArray, FormGroup, ValidationErrors} from '@angular/forms';
import {ValidationError} from '../../src/api/validation_errors';
import {FieldTree} from '../../src/api/types';

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

/**
 * An error used for compat errors.
 */
export class CompatValidationError<T = unknown> implements ValidationError {
  readonly kind: string = 'compat';
  readonly control: AbstractControl;
  readonly field!: FieldTree<unknown>;
  context: T;

  constructor({context, kind, control}: {context: T; kind: string; control: AbstractControl}) {
    this.context = context;
    this.kind = kind;
    this.control = control;
  }

  message?: string | undefined;
}
