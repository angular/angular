/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ValidationErrors} from '@angular/forms';
import {ValidationError} from '../../src/api/validation_errors';
import {Field} from '../../src/api/types';

/**
 * Converts reactive form validation error to signal forms CompatValidationError.
 * @param errors
 * @return list of errors.
 */
export function reactiveErrorsToSignalErrors(
  errors: ValidationErrors | null,
): CompatValidationError[] {
  if (errors === null) {
    return [];
  }

  return Object.entries(errors).map(([kind, context]) => {
    return new CompatValidationError({context, kind});
  });
}

/**
 * An error used for compat errors.
 */
export class CompatValidationError implements ValidationError {
  readonly kind: string = 'reactive';
  readonly field!: Field<unknown>;
  context: any;

  constructor({context, kind}: {context: any; kind: string}) {
    this.context = context;
    this.kind = kind;
  }

  message?: string | undefined;
}
