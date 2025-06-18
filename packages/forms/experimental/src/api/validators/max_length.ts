/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FieldPath, LogicFn} from '../types';
import {metadata, validate} from '../logic';
import {BaseValidatorConfig, ValueWithLength} from './types';
import {MAX_LENGTH} from '../metadata';

/**
 * Validator requiring a field value's length to be smaller than or equal to a maximum length.
 *
 * @param path Path to the target field (currently string or array).
 * @param maxLength The maximum length, or a LogicFn returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function maxLength(
  path: FieldPath<ValueWithLength>,
  maxLength: number | LogicFn<ValueWithLength, number | undefined>,
  config?: BaseValidatorConfig<ValueWithLength>,
) {
  const reactiveMaxLengthValue = typeof maxLength === 'number' ? () => maxLength : maxLength;
  metadata(path, MAX_LENGTH, reactiveMaxLengthValue);

  validate(path, (ctx) => {
    const value = reactiveMaxLengthValue(ctx);
    if (value === undefined) {
      return undefined;
    }

    if (ctx.value().length > value) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'maxLength'};
      }
    }

    return undefined;
  });
}
