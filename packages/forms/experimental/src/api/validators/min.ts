/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {defineComputed} from '../data';
import {metadata, validate} from '../logic';
import {MIN} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig} from './util';

/**
 * Binds a validator to the given path that requires the value to be greater than or equal to
 * the given `minValue`.
 * This function can only be called on number paths.
 * In addition to binding a validator, this function adds `MIN` metadata to the field.
 *
 * @param path Path of the field to validate
 * @param minValue The minimum value, or a LogicFn that returns the minimum value.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.min(minValue)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function min<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<number, TPathKind>,
  minValue: number | LogicFn<number, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<number, TPathKind>,
) {
  const reactiveMinValue = defineComputed(path, (ctx) =>
    typeof minValue === 'number' ? minValue : minValue(ctx),
  );

  metadata(path, MIN, ({state}) => state.metadata(reactiveMinValue)!());
  validate(path, (ctx) => {
    const min = ctx.state.metadata(reactiveMinValue)!();

    if (min === undefined || Number.isNaN(min)) {
      return undefined;
    }
    if (ctx.value() < min) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.min(min);
      }
    }

    return undefined;
  });
}
