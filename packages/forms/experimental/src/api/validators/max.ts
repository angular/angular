/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {metadata, validate} from '../logic';
import {MAX} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig} from './types';

/**
 * Validator requiring a field value to be smaller than or equal to a maximum value.
 *
 * @param path Path to the target field
 * @param maxValue The minimum value, or a LogicFn returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function max<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<number, TPathKind>,
  maxValue: number | LogicFn<number | undefined, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<number, TPathKind>,
) {
  const reactiveMaxValue = typeof maxValue === 'number' ? () => maxValue : maxValue;

  metadata(path, MAX, reactiveMaxValue);
  validate(path, (ctx) => {
    // TODO(kirjs): Do we need to handle Null, parseFloat, NaN?
    const value = reactiveMaxValue(ctx);

    if (value === undefined) {
      return undefined;
    }
    if (ctx.value() > value) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return ValidationError.max(value);
      }
    }

    return undefined;
  });
}
