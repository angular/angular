/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, LogicFn, MAX, metadata, validate} from '@angular/forms/experimental';
import {BaseValidatorConfig} from '@angular/forms/experimental/src/api/validators/types';

/**
 * Validator requiring a field value to be smaller than or equal to a maximum value.
 *
 * @param path Path to the target field
 * @param maxValue The minimum value, or a LogicFn returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function max(path: FieldPath<number>, maxValue: (number | LogicFn<number, number>), config?: BaseValidatorConfig<number>) {
  const reactiveMaxValue = (typeof maxValue === 'number') ?
    () => maxValue : maxValue;

  metadata(path, MAX, reactiveMaxValue);
  validate(path, (ctx) => {
    // TODO(kirjs): Do we need to handle Null, parseFloat, NaN?
    if (ctx.value() > reactiveMaxValue(ctx)) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'max'};
      }
    }

    return undefined;
  });
}
