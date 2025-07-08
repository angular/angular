/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {metadata, validate} from '../logic';
import {REQUIRED} from '../metadata';
import {FieldPath, LogicFn, PathKind} from '../types';
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
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function required<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  config?: BaseValidatorConfig<TValue, TPathKind> & {
    emptyPredicate?: (value: TValue) => boolean;
    when?: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
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
