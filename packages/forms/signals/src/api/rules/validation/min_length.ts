/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../../types';
import {createMetadataKey, metadata, MIN_LENGTH} from '../metadata';
import {
  BaseValidatorConfig,
  getLengthOrSize,
  getOption,
  isEmpty,
  ValueWithLengthOrSize,
} from './util';
import {validate} from './validate';
import {minLengthError} from './validation_errors';

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
 *
 * @see [Signal Form Min Length Validation](guide/forms/signals/validation#minlength-and-maxlength)
 * @category validation
 * @experimental 21.0.0
 */
export function minLength<
  TValue extends ValueWithLengthOrSize,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  minLength: number | LogicFn<TValue, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind>,
) {
  const MIN_LENGTH_MEMO = metadata(path, createMetadataKey<number | undefined>(), (ctx) =>
    typeof minLength === 'number' ? minLength : minLength(ctx),
  );
  metadata(path, MIN_LENGTH, ({state}) => state.metadata(MIN_LENGTH_MEMO)!());
  validate(path, (ctx) => {
    if (isEmpty(ctx.value())) {
      return undefined;
    }
    const minLength = ctx.state.metadata(MIN_LENGTH_MEMO)!();
    if (minLength === undefined) {
      return undefined;
    }
    if (getLengthOrSize(ctx.value()) < minLength) {
      if (config?.error) {
        return getOption(config.error, ctx);
      } else {
        return minLengthError(minLength, {message: getOption(config?.message, ctx)});
      }
    }
    return undefined;
  });
}
