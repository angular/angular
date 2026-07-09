/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createMetadataKey, MAX, MAX_NUMBER, metadata, LimitKey} from '../metadata';
import {BaseValidatorConfig, getOption} from './util';
import {validate} from './validate';
import {maxError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be less than or equal to the
 * given `maxValue`.
 * This function can only be called on number paths.
 * This function can only be called on number paths.
 * In addition to binding a validator, this function adds `MAX` property to the field.
 *
 * @param path Path of the field to validate
 * @param maxValue The maximum value, or a LogicFn that returns the maximum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.max(maxValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Signal Form Max Validation](guide/forms/signals/validation#min-and-max)
 * @category validation
 * @publicApi 22.0
 */
export function max<TValue extends number | null, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  maxValue: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
): void {
  const MAX_MEMO = createMetadataKey<number | undefined>();

  // Memoize the maximum valid value.
  metadata(path, MAX_MEMO, (ctx) => {
    if (config?.when && !config.when(ctx)) {
      return undefined;
    }
    return typeof maxValue === 'function' ? maxValue(ctx) : maxValue;
  });

  // Publish the memoized maximum value for aggregation.
  metadata(path, MAX_NUMBER, ({state}) => state.metadata(MAX_MEMO)!());

  // Use `MAX_NUMBER` to define the `max` property of the field.
  metadata(path, MAX, () => MAX_NUMBER as LimitKey<TValue>);
  validate(path, (ctx) => {
    const value = ctx.value();
    if (value === null || Number.isNaN(value)) {
      return undefined;
    }
    const max = ctx.state.metadata(MAX_MEMO)!();
    if (max === undefined || Number.isNaN(max)) {
      return undefined;
    }
    if (value > max) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return maxError(max, {message: getOption(config?.message, ctx)});
      }
    }
    return undefined;
  });
}
