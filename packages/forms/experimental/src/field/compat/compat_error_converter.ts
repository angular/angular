/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ValidationErrors} from '@angular/forms';
import {ValidationError} from '@angular/forms/experimental';

export function reactiveErrorsToSignalErrors(errors: ValidationErrors | null) {
  if (errors === null) {
    return [];
  }

  // TODO: Map to existing built-in error types.
  return Object.entries(errors).map(([kind, context]) => {
    return ValidationError.custom({kind, context});
  });
}
