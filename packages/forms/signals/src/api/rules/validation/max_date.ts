/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createMetadataKey, LimitKey, MAX, MAX_DATE, metadata} from '../metadata';
import {BaseValidatorConfig, getOption} from './util';
import {validate} from './validate';
import {maxDateError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be less than or equal to the
 * given `maxDate`.
 * This function can only be called on date paths.
 * In addition to binding a validator, this function adds `MAX` property to the field.
 *
 * @param path Path of the field to validate
 * @param maxDate The maximum date, or a LogicFn that returns the maximum date.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.max(maxDate)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Signal Form Max Validation](guide/forms/signals/validation#min-and-max)
 * @category validation
 * @experimental 22.0.0
 */
export function maxDate<TValue extends Date | null, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  maxDateValue: Date | LogicFn<TValue, Date | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
): void {
  const MAX_MEMO = createMetadataKey<Date | undefined>();

  // Memoize the maximum valid date.
  metadata(path, MAX_MEMO, (ctx) => {
    if (config?.when && !config.when(ctx)) {
      return undefined;
    }
    return typeof maxDateValue === 'function' ? maxDateValue(ctx) : maxDateValue;
  });

  // Publish the memoized maximum date for aggregation.
  metadata(path, MAX_DATE, ({state}) => state.metadata(MAX_MEMO)!());

  // Use `MAX_DATE` to define the `max` property of the field.
  metadata(path, MAX, () => MAX_DATE as LimitKey<TValue>);

  // Validate that the field value is not greater than the maximum date.
  validate(path, (ctx) => {
    const value = ctx.value();
    if (value === null || Number.isNaN(value.getTime())) {
      return undefined;
    }
    const max = ctx.state.metadata(MAX_MEMO)!();
    if (max === undefined || Number.isNaN(max.getTime())) {
      return undefined;
    }
    if (value > max) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return maxDateError(max, {message: getOption(config?.message, ctx)});
      }
    }
    return undefined;
  });
}
