/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {metadata, validate} from '../logic';
import {MIN} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
import {BaseValidatorConfig} from './types';

/**
 * Validator requiring a field value to be greater than or equal to a minimum value.
 *
 * @param path Path to the target field
 * @param minValue The minimum value, or a LogicFn returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function min<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<number, TPathKind>,
  minValue: number | LogicFn<number | undefined, number | undefined, TPathKind>,
  config?: BaseValidatorConfig<number, TPathKind>,
) {
  const reactiveMinValue = typeof minValue === 'number' ? () => minValue : minValue;
  metadata(path, MIN, reactiveMinValue);
  validate(path, (ctx) => {
    // TODO(kirjs): Do we need to handle Null, parseFloat, NaN?
    const value = reactiveMinValue(ctx);
    if (value === undefined) {
      return undefined;
    }

    if (ctx.value() < value) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'ng:min', min: value};
      }
    }

    return undefined;
  });
}
