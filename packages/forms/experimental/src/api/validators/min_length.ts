/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {metadata, validate} from '../logic';
import {MIN_LENGTH} from '../metadata';
import {FieldPath, LogicFn} from '../types';
import {BaseValidatorConfig, ValueWithLength} from './types';

/**
 * Validator requiring a field value's length to be greater than or equal to a minimum length.
 *
 * @param path Path to the target field (currently string or array).
 * @param minLength The minimum length, or a LogicFn returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function minLength(
  path: FieldPath<ValueWithLength>,
  minLength: number | LogicFn<ValueWithLength, number | undefined>,
  config?: BaseValidatorConfig<ValueWithLength>,
) {
  const reactiveMinLengthValue = typeof minLength === 'number' ? () => minLength : minLength;
  metadata(path, MIN_LENGTH, reactiveMinLengthValue);

  validate(path, (ctx) => {
    // TODO(kirjs): Should this support set? undefined?
    const value = reactiveMinLengthValue(ctx);
    if (value === undefined) {
      return undefined;
    }

    if (ctx.value().length < value) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'minLength'};
      }
    }

    return undefined;
  });
}
