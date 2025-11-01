/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {aggregateMetadata, metadata, validate} from '../logic';
import {MIN} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {minError} from '../validation_errors';
import {BaseValidatorConfig, getOption} from './util';

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
 * @category validation
 * @experimental 21.0.0
 */
export function min<TValue extends number | null, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  minValue: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
) {
  const MIN_MEMO = metadata(path, (ctx) =>
    computed(() => (typeof minValue === 'number' ? minValue : minValue(ctx))),
  );
  aggregateMetadata(path, MIN, ({state}) => state.metadata(MIN_MEMO)!());
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
