/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {metadata, validate} from '../logic';
import {REQUIRED} from '../metadata';
import {FieldPath, LogicFn} from '../types';
import {BaseValidatorConfig} from './types';

/**
 * Adds logic to a field to conditionally make it required. A required field has metadata to
 * indicate that it is required, and has a validation error if its value is empty.
 *
 * @param path The target path to add the required logic to.
 * @param config Additional configuration
 *                - errors Optional - A function that takes FieldContext and returns one or more custom errors.
 *                - emptyPredicate Optional - A function that takes the value, and returns true if it's empty, false otherwise
 *                - condition Optional - A function that takes FieldContext and returns true if the field is required.
 * @template T The data type of the field the logic is being added to.
 */
export function required<T>(
  path: FieldPath<T>,
  config?: BaseValidatorConfig<T> & {
    emptyPredicate?: (value: T) => boolean;
    when?: NoInfer<LogicFn<T, boolean>>;
  },
): void {
  const emptyPredicate = config?.emptyPredicate || ((value) => value == null || value === '');
  const condition = config?.when ?? (() => true);

  metadata(path, REQUIRED, condition);
  validate(path, (ctx) => {
    if (condition(ctx) && emptyPredicate(ctx.value())) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'required'};
      }
    }
    return undefined;
  });
}
