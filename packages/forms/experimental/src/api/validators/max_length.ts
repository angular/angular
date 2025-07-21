/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import {aggregateProperty, property, validate} from '../logic';
import {MAX_LENGTH, Property} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig, getLengthOrSize, ValueWithLengthOrSize} from './util';

/**
 * Binds a validator to the given path that requires the length of the value to be less than or
 * equal to the given `maxLength`.
 * This function can only be called on string or array paths.
 * In addition to binding a validator, this function adds `MAX_LENGTH` property to the field.
 *
 * @param path Path of the field to validate
 * @param maxLength The maximum length, or a LogicFn that returns the maximum length.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.maxLength(maxLength)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function maxLength<
  TValue extends ValueWithLengthOrSize,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: FieldPath<TValue, TPathKind>,
  maxLength: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
) {
  const MAX_LENGTH_MEMO = Property.create<Signal<number | undefined>>();

  property(path, MAX_LENGTH_MEMO, (ctx) =>
    computed(() => (typeof maxLength === 'number' ? maxLength : maxLength(ctx))),
  );
  aggregateProperty(path, MAX_LENGTH, ({state}) => state.property(MAX_LENGTH_MEMO)!());
  validate(path, (ctx) => {
    const maxLength = ctx.state.property(MAX_LENGTH_MEMO)!();
    if (maxLength === undefined) {
      return undefined;
    }
    if (getLengthOrSize(ctx.value()) > maxLength) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.maxLength(maxLength);
      }
    }
    return undefined;
  });
}
