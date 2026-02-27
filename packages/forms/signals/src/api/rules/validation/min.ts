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
 * @experimental 21.0.0
 */
export function min<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<number, SchemaPathRules.Supported, TPathKind>,
  minValue: number | LogicFn<number, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<number, TPathKind>,
): void;

/**
 * Binds a validator to the given path that requires the value to be greater than or equal to
 * the given `minValue`.
 * This function can only be called on string paths (e.g., date, time, datetime-local inputs).
 * Uses lexicographic comparison for string values.
 * In addition to binding a validator, this function adds `MIN` property to the field.
 *
 * @param path Path of the field to validate
 * @param minValue The minimum value (ISO format string), or a LogicFn that returns the minimum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.min(minValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category validation
 * @experimental 21.0.0
 */
export function min<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  minValue: string | LogicFn<string, string | undefined, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
): void;

/**
 * Binds a validator to the given path that requires the value to be greater than or equal to
 * the given `minValue`.
 * This overload handles mixed paths containing number, string, or null values.
 * In addition to binding a validator, this function adds `MIN` property to the field.
 *
 * @param path Path of the field to validate
 * @param minValue The minimum value, or a LogicFn that returns the minimum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.min(minValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category validation
 * @experimental 21.0.0
 */
export function min<
  TValue extends number | string | null,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  minValue: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
): void;

export function min<
  TValue extends number | string | null,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  minValue: unknown,
  config?: BaseValidatorConfig<TValue, TPathKind>,
): void {
  const resolveMinValue = (ctx: {state: unknown}): number | string | undefined => {
    if (typeof minValue === 'number' || typeof minValue === 'string') {
      return minValue;
    }
    return (minValue as (ctx: unknown) => number | string | undefined)(ctx);
  };

  const MIN_MEMO = metadata(
    path,
    createMetadataKey<number | string | undefined>(),
    resolveMinValue as LogicFn<TValue, number | string | undefined, TPathKind>,
  );
  metadata(path, MIN, ({state}) => {
    const val = state.metadata(MIN_MEMO)!();
    // MIN metadata is typed as number | undefined; for string min values,
    // we return undefined as the numeric metadata key cannot represent string constraints.
    return typeof val === 'number' ? val : undefined;
  });
  validate(path, (ctx) => {
    if (isEmpty(ctx.value())) {
      return undefined;
    }
    const min = ctx.state.metadata(MIN_MEMO)!();
    if (min === undefined) {
      return undefined;
    }
    if (typeof min === 'string') {
      // String comparison (for date, time, datetime-local, etc.)
      const value = ctx.value();
      if (typeof value === 'string' && value < min) {
        if (config?.error) {
          return getOption(config.error, ctx);
        } else {
          return minError(min as unknown as number, {message: getOption(config?.message, ctx)});
        }
      }
    } else {
      // Numeric comparison
      if (Number.isNaN(min)) {
        return undefined;
      }
      const value = ctx.value();
      const numValue = !value && value !== 0 ? NaN : Number(value); // Treat `''` and `null` as `NaN`
      if (numValue < min) {
        if (config?.error) {
          return getOption(config.error, ctx);
        } else {
          return minError(min, {message: getOption(config?.message, ctx)});
        }
      }
    }
    return undefined;
  });
}
