/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createMetadataKey, MAX, metadata} from '../metadata';
import {BaseValidatorConfig, getOption, isEmpty} from './util';
import {validate} from './validate';
import {maxError} from './validation_errors';

/**
 * Binds a validator to the given path that requires the value to be less than or equal to the
 * given `maxValue`.
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
 * @experimental 21.0.0
 */
export function max<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<number, SchemaPathRules.Supported, TPathKind>,
  maxValue: number | LogicFn<number, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<number, TPathKind>,
): void;

/**
 * Binds a validator to the given path that requires the value to be less than or equal to the
 * given `maxValue`.
 * This function can only be called on string paths (e.g., date, time, datetime-local inputs).
 * Uses lexicographic comparison for string values.
 * In addition to binding a validator, this function adds `MAX` property to the field.
 *
 * @param path Path of the field to validate
 * @param maxValue The maximum value (ISO format string), or a LogicFn that returns the maximum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.max(maxValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category validation
 * @experimental 21.0.0
 */
export function max<TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  maxValue: string | LogicFn<string, string | undefined, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind>,
): void;

/**
 * Binds a validator to the given path that requires the value to be less than or equal to the
 * given `maxValue`.
 * This overload handles mixed paths containing number, string, or null values.
 * In addition to binding a validator, this function adds `MAX` property to the field.
 *
 * @param path Path of the field to validate
 * @param maxValue The maximum value, or a LogicFn that returns the maximum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.max(maxValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category validation
 * @experimental 21.0.0
 */
export function max<
  TValue extends number | string | null,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  maxValue: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
): void;

export function max<
  TValue extends number | string | null,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  maxValue: unknown,
  config?: BaseValidatorConfig<TValue, TPathKind>,
): void {
  const resolveMaxValue = (ctx: {state: unknown}): number | string | undefined => {
    if (typeof maxValue === 'number' || typeof maxValue === 'string') {
      return maxValue;
    }
    return (maxValue as (ctx: unknown) => number | string | undefined)(ctx);
  };

  const MAX_MEMO = metadata(
    path,
    createMetadataKey<number | string | undefined>(),
    resolveMaxValue as LogicFn<TValue, number | string | undefined, TPathKind>,
  );
  metadata(path, MAX, ({state}) => {
    const val = state.metadata(MAX_MEMO)!();
    // MAX metadata is typed as number | undefined; for string max values,
    // we return undefined as the numeric metadata key cannot represent string constraints.
    return typeof val === 'number' ? val : undefined;
  });
  validate(path, (ctx) => {
    if (isEmpty(ctx.value())) {
      return undefined;
    }
    const max = ctx.state.metadata(MAX_MEMO)!();
    if (max === undefined) {
      return undefined;
    }
    if (typeof max === 'string') {
      // String comparison (for date, time, datetime-local, etc.)
      const value = ctx.value();
      if (typeof value === 'string' && value > max) {
        if (config?.error) {
          return getOption(config.error, ctx);
        } else {
          return maxError(max as unknown as number, {message: getOption(config?.message, ctx)});
        }
      }
    } else {
      // Numeric comparison
      if (Number.isNaN(max)) {
        return undefined;
      }
      const value = ctx.value();
      const numValue = !value && value !== 0 ? NaN : Number(value); // Treat `''` and `null` as `NaN`
      if (numValue > max) {
        if (config?.error) {
          return getOption(config.error, ctx);
        } else {
          return maxError(max, {message: getOption(config?.message, ctx)});
        }
      }
    }
    return undefined;
  });
}
