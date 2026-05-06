/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createMetadataKey, LimitKey, metadata, MIN, MIN_DATE} from '../metadata';
import {BaseValidatorConfig, getOption} from './util';
import {validate} from './validate';
import {minDateError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be greater than or equal to
 * the given `minDate`.
 * This function can only be called on date paths.
 * In addition to binding a validator, this function adds `MIN` property to the field.
 *
 * @param path Path of the field to validate
 * @param minDate The minimum date, or a LogicFn that returns the minimum date.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.min(minDate)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Signal Form Min Validation](guide/forms/signals/validation#min-and-max)
 * @category validation
 * @experimental 22.0.0
 */
export function minDate<TValue extends Date | null, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  minDateValue: Date | LogicFn<TValue, Date | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
): void {
  const MIN_MEMO = createMetadataKey<Date | undefined>();

  // Memoize the minimum valid date.
  metadata(path, MIN_MEMO, (ctx) => {
    if (config?.when && !config.when(ctx)) {
      return undefined;
    }
    return typeof minDateValue === 'function' ? minDateValue(ctx) : minDateValue;
  });

  // Publish the memoized minimum date for aggregation.
  metadata(path, MIN_DATE, ({state}) => state.metadata(MIN_MEMO)!());

  // Use `MIN_DATE` to define the `min` property of the field.
  metadata(path, MIN, () => MIN_DATE as LimitKey<TValue>);

  // Validate that the field value is not less than the minimum date.
  validate(path, (ctx) => {
    const value = ctx.value();
    if (value === null || Number.isNaN(value.getTime())) {
      return undefined;
    }
    const min = ctx.state.metadata(MIN_MEMO)!();
    if (min === undefined || Number.isNaN(min.getTime())) {
      return undefined;
    }
    if (value < min) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return minDateError(min, {message: getOption(config?.message, ctx)});
      }
    }
    return undefined;
  });
}
