/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ValidationErrors} from '@angular/forms';
import {ValidationError} from '../../api/validation_errors';
import {Field, FieldState} from '../../api/types';

export function reactiveErrorsToSignalErrors(errors: ValidationErrors | null) {
  if (errors === null) {
    return [];
  }

  return Object.entries(errors).map(([kind, context]) => {
    return new ReactiveValidationError({context, kind});
  });
}

/**
 * An error used to indicate that a value is not a valid email.
 */
export class ReactiveValidationError implements ValidationError {
  readonly kind: string = 'reactive';
  readonly field!: Field<unknown>;
  context: any;

  constructor({context, kind}: {context: any; kind: string}) {
    this.context = context;
    this.kind = kind;
  }

  message?: string | undefined;
}
