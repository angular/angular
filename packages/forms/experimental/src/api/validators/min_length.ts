/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {metadata, validate} from '../logic';
import {MIN_LENGTH} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig, ValueWithLength} from './types';

/**
 * Binds a validator to the given path that requires the length of the value to be greater than or
 * equal to the given `minLength`.
 * This function can only be called on string or array paths.
 * In addition to binding a validator, this function adds `MIN_LENGTH` metadata to the field.
 *
 * @param path Path of the field to validate
 * @param minLength The minimum length, or a LogicFn that returns the minimum length.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.minLength(minLength)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function minLength<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<ValueWithLength, TPathKind>,
  minLength: number | LogicFn<ValueWithLength, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<ValueWithLength, TPathKind>,
) {
  const reactiveMinLengthValue = typeof minLength === 'number' ? () => minLength : minLength;
  metadata(path, MIN_LENGTH, reactiveMinLengthValue);

  validate(path, (ctx) => {
    // TODO: resolve TODO below
    // TODO(kirjs): Should this support set? undefined?
    const value = reactiveMinLengthValue(ctx);
    if (value === undefined) {
      return undefined;
    }

    if (ctx.value().length < value) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.minLength(value);
      }
    }

    return undefined;
  });
}
