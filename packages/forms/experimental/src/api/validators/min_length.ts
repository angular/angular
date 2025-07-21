/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {aggregateProperty, property, validate} from '../logic';
import {MIN_LENGTH} from '../property';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig, getLengthOrSize, ValueWithLengthOrSize} from './util';

/**
 * Binds a validator to the given path that requires the length of the value to be greater than or
 * equal to the given `minLength`.
 * This function can only be called on string or array paths.
 * In addition to binding a validator, this function adds `MIN_LENGTH` property to the field.
 *
 * @param path Path of the field to validate
 * @param minLength The minimum length, or a LogicFn that returns the minimum length.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.minLength(minLength)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function minLength<
  TValue extends ValueWithLengthOrSize,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: FieldPath<TValue, TPathKind>,
  minLength: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
) {
  const MIN_LENGTH_MEMO = property(path, (ctx) =>
    computed(() => (typeof minLength === 'number' ? minLength : minLength(ctx))),
  );
  aggregateProperty(path, MIN_LENGTH, ({state}) => state.property(MIN_LENGTH_MEMO)!());
  validate(path, (ctx) => {
    const minLength = ctx.state.property(MIN_LENGTH_MEMO)!();
    if (minLength === undefined) {
      return undefined;
    }
    if (getLengthOrSize(ctx.value()) < minLength) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.minLength(minLength);
      }
    }
    return undefined;
  });
}
