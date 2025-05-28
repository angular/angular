/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, LogicFn, MAX_LENGTH, metadata, validate} from '@angular/forms/experimental';
import {BaseValidatorConfig, ValueWithLength} from '@angular/forms/experimental/src/api/validators/types';

/**
 * Validator requiring a field value's length to be smaller than or equal to a maximum length.
 *
 * @param path Path to the target field (currently string or array).
 * @param maxLength The maximum length, or a LogicFn returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function maxLength(path: FieldPath<ValueWithLength>, maxLength: number | LogicFn<ValueWithLength, number>, config?: BaseValidatorConfig<ValueWithLength>) {
  const reactiveMaxLengthValue = typeof maxLength === 'number' ? () => maxLength : maxLength;
  metadata(path, MAX_LENGTH, reactiveMaxLengthValue);

  validate(path, ctx => {
    if (ctx.value().length > reactiveMaxLengthValue(ctx)) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'maxLength'};
      }
    }

    return undefined;
  });
}
