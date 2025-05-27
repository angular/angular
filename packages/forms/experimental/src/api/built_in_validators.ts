/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {metadata, validate} from './logic';
import {MAX, MIN, REQUIRED} from './metadata';
import {FieldContext, FieldPath, LogicFn, ValidationResult} from './types';

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

/**
 * Validator requiring a field value to be greater than or equal to a minimum value.
 *
 * @param path Path to the target field
 * @param minValue The minimum value, or a function returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function min(path: FieldPath<number>, minValue: (number | ((ctx: FieldContext<number>) => number)), config?: BaseValidatorConfig) {
  const reactiveMinValue = (typeof minValue === 'number') ?
      () => minValue : minValue;
  metadata(path, MIN, reactiveMinValue);
  validate(path, (ctx) => {
    // TODO(kirjs): Do we need to handle Null, parseFloat, NaN?
    if (ctx.value() < reactiveMinValue(ctx)) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'min'};
      }
    }

    return undefined;
  });
}

/**
 * Validator requiring a field value to be smaller than or equal to a maximum value.
 *
 * @param path Path to the target field
 * @param maxValue The minimum value, or a function returning it.
 * @param config Optional, currently allows providing custom errors function.
 */
export function max(path: FieldPath<number>, maxValue: (number | ((ctx: FieldContext<number>) => number)), config?: BaseValidatorConfig) {
  const reactiveMaxValue = (typeof maxValue === 'number') ?
      () => maxValue : maxValue;

  metadata(path, MAX, reactiveMaxValue);
  validate(path, (ctx) => {
    // TODO(kirjs): Do we need to handle Null, parseFloat, NaN?
    if (ctx.value() > reactiveMaxValue(ctx)) {
      if (config?.errors) {
        return config.errors(ctx);
      } else {
        return {kind: 'max'};
      }
    }

    return undefined;
  });
}
