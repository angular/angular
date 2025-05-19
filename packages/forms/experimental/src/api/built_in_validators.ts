/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {metadata, validate} from './logic';
import {MAX, MIN, REQUIRED} from './metadata';
import {FieldPath, LogicFn, ValidationResult} from './types';

/**
 * Adds logic to a field to conditionally make it required. A required field has metadata to
 * indicate that it is required, and has a validation error if its value is empty.
 *
 * @param path The target path to add the required logic to.
 * @param logic A `LogicFn<T, boolean>` that returns `true` when the field is required.
 * @param message An optional user-facing message to add to the error, or a `LogicFn<T, string>`
 *   that returns the user-facing message
 * @param emptyPredicate An optional custom predicate to determine if a value is considered empty.
 * @template T The data type of the field the logic is being added to.
 */
export function required<T>(
  path: FieldPath<T>,
  logic: NoInfer<LogicFn<T, boolean>> = () => true,
  message?: string | NoInfer<LogicFn<T, string>>,
  emptyPredicate: (value: T) => boolean = (value) => value == null || value === '',
): void {
  metadata(path, REQUIRED, logic);
  validate(path, (arg) => {
    if (logic(arg) && emptyPredicate(arg.value())) {
      message = typeof message === 'function' ? message(arg) : message;
      return message ? {kind: 'required', message} : {kind: 'required'};
    }
    return undefined;
  });
}

interface BaseValidatorConfig {
  errors: LogicFn<number, ValidationResult>;
}

export function min(path: FieldPath<number>, minValue: number, config?: BaseValidatorConfig) {
  metadata(path, MIN, () => minValue);
  validate(path, (ctx) => {
    if (ctx.value() <= minValue) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'min'};
      }
    }

    return undefined;
  });
}

export function max(path: FieldPath<number>, maxValue: number, config?: BaseValidatorConfig) {
  metadata(path, MAX, () => maxValue);
  validate(path, (ctx) => {
    if (ctx.value() > maxValue) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'max'};
      }
    }

    return undefined;
  });
}
