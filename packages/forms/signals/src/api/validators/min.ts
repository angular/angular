/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createMetadataKey, metadata, LimitKey, MIN, MIN_NUMBER} from '../metadata';
import {BaseValidatorConfig, getOption} from './util';
import {validate} from './validate';
import {minError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be greater than or equal to
 * the given `minValue`.
 * This function can only be called on number paths.
 * This function can only be called on number paths.
 * In addition to binding a validator, this function adds `MIN` property to the field.
 *
 * @param path Path of the field to validate
 * @param minValue The minimum value, or a LogicFn that returns the minimum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.min(minValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Signal Form Min Validation](guide/forms/signals/validation#min-and-max)
 * @category validation
 * @publicApi 22.0
 */
export function min<TValue extends number | null, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  minValue: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
): void {
  const MIN_MEMO = createMetadataKey<number | undefined>();

  // Memomize the minimum valid.
  metadata(path, MIN_MEMO, (ctx) => {
    if (config?.when && !config.when(ctx)) {
      return undefined;
    }
    return typeof minValue === 'function' ? minValue(ctx) : minValue;
  });

  // Publish the memoized mininum value for aggregation.
  metadata(path, MIN_NUMBER, ({state}) => state.metadata(MIN_MEMO)!());

  // Use `MIN_NUMBER` to define the `min` property of the field.
  metadata(path, MIN, () => MIN_NUMBER as LimitKey<TValue>);
  validate(path, (ctx) => {
    const value = ctx.value();
    if (value === null || Number.isNaN(value)) {
      return undefined;
    }
    const min = ctx.state.metadata(MIN_MEMO)!();
    if (min === undefined || Number.isNaN(min)) {
      return undefined;
    }
    if (value < min) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return minError(min, {message: getOption(config?.message, ctx)});
      }
    }
    return undefined;
  });
}
