/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {aggregateMetadata, metadata, validate} from '../logic';
import {MAX} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {maxError} from '../validation_errors';
import {BaseValidatorConfig, getOption} from './util';

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
 * @category validation
 * @experimental 21.0.0
 */
export function max<TValue extends number | null, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  maxValue: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
) {
  const MAX_MEMO = metadata(path, (ctx) =>
    computed(() => (typeof maxValue === 'number' ? maxValue : maxValue(ctx))),
  );
  aggregateMetadata(path, MAX, ({state}) => state.metadata(MAX_MEMO)!());
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
