/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {metadata, validate} from '../logic';
import {MAX_LENGTH} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';
import {BaseValidatorConfig, ValueWithLength} from './types';

/**
 * Binds a validator to the given path that requires the length of the value to be less than or
 * equal to the given `maxLength`.
 * This function can only be called on string or array paths.
 * In addition to binding a validator, this function adds `MAX_LENGTH` metadata to the field.
 *
 * @param path Path of the field to validate
 * @param maxLength The maximum length, or a LogicFn that returns the maximum length.
 * @param config Optional, allows providing any of the following options:
 *  - `error`: Custom validation error(s) to be used instead of the default `ValidationError.maxLength(maxLength)`
 *    or a function that receives the `FieldContext` and returns custom validation error(s).
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function maxLength<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<ValueWithLength, TPathKind>,
  maxLength: number | LogicFn<ValueWithLength, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<ValueWithLength, TPathKind>,
) {
  // TODO: should we memoize this in a computed? (applies to other metadata validators as well)
  const reactiveMaxLengthValue = typeof maxLength === 'number' ? () => maxLength : maxLength;
  metadata(path, MAX_LENGTH, reactiveMaxLengthValue);

  validate(path, (ctx) => {
    const value = reactiveMaxLengthValue(ctx);
    if (value === undefined) {
      return undefined;
    }

    if (ctx.value().length > value) {
      if (config?.error) {
        return typeof config.error === 'function' ? config.error(ctx) : config.error;
      } else {
        return ValidationError.maxLength(value);
      }
    }

    return undefined;
  });
}
