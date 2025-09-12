/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {aggregateProperty, property, validate} from '../logic';
import {FLOATING_POINT, PATTERN} from '../property';
import {FieldPath, PathKind, type LogicFn} from '../types';
import {numericError} from '../validation_errors';
import {BaseValidatorConfig, FLOAT_REGEXP, getOption, INTEGER_REGEXP, isEmpty} from './util';

/**
 * Binds a validator to the given path that requires the value to match a standard numeric format.
 * This function can only be called on string paths.
 *
 * In addition to binding a validator, this function adds a `FLOATING_POINT` and `PATTERN`
 * properties to the field.
 *
 * @param path Path of the field to validate
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.email()`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @experimental 21.0.0
 */
export function numeric<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<string, TPathKind>,
  config?: BaseValidatorConfig<string, TPathKind> & {
    float?: boolean | LogicFn<string, boolean, TPathKind>;
    pattern?: RegExp | LogicFn<string, RegExp, TPathKind>;
  },
) {
  const FLOAT_MEMO = property(path, (ctx) =>
    computed(() => getOption(config?.float, ctx) ?? false),
  );
  const PATTERN_MEMO = property(path, (ctx) =>
    computed(
      () =>
        getOption(config?.pattern, ctx) ??
        (ctx.state.property(FLOAT_MEMO)!() ? FLOAT_REGEXP : INTEGER_REGEXP),
    ),
  );
  aggregateProperty(path, FLOATING_POINT, ({state}) => state.property(FLOAT_MEMO)!());
  aggregateProperty(path, PATTERN, ({state}) => state.property(PATTERN_MEMO)!());
  validate(path, (ctx) => {
    if (isEmpty(ctx.value())) {
      return undefined;
    }
    const float = ctx.state.property(FLOAT_MEMO)!();
    const pattern = ctx.state.property(PATTERN_MEMO)!();
    const value = ctx.value();
    if (!pattern.test(value.toString()) || (typeof value === 'number' && isNaN(value))) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return numericError({float, pattern, message: getOption(config?.message, ctx)});
      }
    }

    return undefined;
  });
}
