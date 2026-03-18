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
  path: SchemaPath<number | string | null, SchemaPathRules.Supported, TPathKind>,
  maxValue: number | LogicFn<number | string | null, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<number | string | null, TPathKind>,
) {
  const MAX_MEMO = metadata(path, createMetadataKey<number | undefined>(), (ctx) =>
    typeof maxValue === 'number' ? maxValue : maxValue(ctx),
  );
  metadata(path, MAX, ({state}) => state.metadata(MAX_MEMO)!());
  validate(path, (ctx) => {
    if (isEmpty(ctx.value())) {
      return undefined;
    }
    const max = ctx.state.metadata(MAX_MEMO)!();
    if (max === undefined || Number.isNaN(max)) {
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
    return undefined;
  });
}
