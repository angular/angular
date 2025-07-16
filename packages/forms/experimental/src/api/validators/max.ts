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
 * Binds a validator to the given path that requires the the value to be less than or equal to the
 * given `maxValue`.
 * This function can only be called on number paths.
 * In addition to binding a validator, this function adds `MAX` metadata to the field.
 *
 * @param path Path of the field to validate
 * @param maxValue The minimum value, or a LogicFn that returns the minimum value.
 * @param config Optional, allows providing any of the following options:
 *  - `errors`: A function that recevies the `FieldContext` and returns custom validation error(s)
 *    to be used instead of the default `ValidationError.max(maxValue)`
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function max<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<number, TPathKind>,
  maxValue: number | LogicFn<number | undefined, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<number, TPathKind>,
) {
  const reactiveMaxValue = typeof maxValue === 'number' ? () => maxValue : maxValue;

  metadata(path, MAX, reactiveMaxValue);
  validate(path, (ctx) => {
    // TODO: resolve TODO below
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
