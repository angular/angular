/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createMetadataKey, metadata, MIN} from '../metadata';
import {BaseValidatorConfig, getOption, isEmpty} from './util';
import {validate} from './validate';
import {minError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be greater than or equal to
 * the given `minValue`.
 * This function can only be called on string paths (e.g., date, time, datetime-local inputs).
 * Uses lexicographic comparison for string values, which correctly handles ISO date/time formats
 * where alphabetical order matches chronological order.
 * In addition to binding a validator, this function adds `MIN` property to the field.
 *
 * @param path Path of the field to validate
 * @param minValue The minimum value (ISO format string), or a LogicFn that returns the minimum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.min(minValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Signal Form Min Validation](guide/forms/signals/validation#min-and-max)
 * @category validation
 * @experimental 21.0.0
 */
export function minDate<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  minValue: string | LogicFn<string, string | undefined, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
): void {
  const MIN_MEMO = metadata(path, createMetadataKey<string | undefined>(), (ctx) =>
    typeof minValue === 'string' ? minValue : minValue(ctx),
  );
  metadata(path, MIN, ({state}) => {
    return state.metadata(MIN_MEMO)!();
  });
  validate(path, (ctx) => {
    if (isEmpty(ctx.value())) {
      return undefined;
    }
    const min = ctx.state.metadata(MIN_MEMO)!();
    if (min === undefined) {
      return undefined;
    }
    const value = ctx.value();
    if (value < min) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return minError(min as unknown as number, {message: getOption(config?.message, ctx)});
      }
    }
    return undefined;
  });
}
