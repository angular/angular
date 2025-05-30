/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, LogicFn, metadata, MIN, validate} from '@angular/forms/experimental';
import {BaseValidatorConfig} from '@angular/forms/experimental/src/api/validators/types';

/**
 * Validator requiring a field value to be greater than or equal to a minimum value.
 *
 * @param path Path to the target field
 * @param minValue The minimum value, or a LogicFn returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function min(path: FieldPath<number>, minValue: (number | LogicFn<number, number>), config?: BaseValidatorConfig<number>) {
  const reactiveMinValue = (typeof minValue === 'number') ?
    () => minValue : minValue;
  metadata(path, MIN, reactiveMinValue);
  validate(path, (ctx) => {
    // TODO(kirjs): Do we need to handle Null, parseFloat, NaN?
    if (ctx.value() < reactiveMinValue(ctx)) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'min'};
      }
    }

    return undefined;
  });
}
