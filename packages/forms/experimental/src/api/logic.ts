/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DISABLED_REASON, MetadataKey, REQUIRED} from '../logic_node';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import type {FieldPath, FormError, LogicFn} from './types';
import {ValidationResult} from './types';

/**
 * Adds logic to a field to conditionally disable it.
 *
 * @param path The target path to add the disabled logic to.
 * @param logic A `LogicFn<T, boolean>` that returns `true` when the field is disabled.
 * @param reason A user-facing message describing why the field is disabled.
 * @template T The data type of the field the logic is being added to.
 */
export function disabled<T>(
  path: FieldPath<T>,
  logic: NoInfer<LogicFn<T, boolean>>,
  reason?: string,
): void {
  assertPathIsCurrent(path);

  const pathImpl = FieldPathNode.extractFromPath(path);
  const reasonFn: LogicFn<T, string> = (ctx) => (logic(ctx) ? (reason ?? '') : '');
  pathImpl.logic.disabled.push(pathImpl.maybeWrapWithPredicate(logic, false));
  pathImpl.logic.getMetadata(DISABLED_REASON).push(pathImpl.maybeWrapWithPredicate(reasonFn, ''));
}

/**
 * Adds logic to a field to conditionally hide it. A hidden field does not contribute to the
 * validation, touched/dirty, or other state of its parent field.
 *
 * @param path The target path to add the hidden logic to.
 * @param logic A `LogicFn<T, boolean>` that returns `true` when the field is hidden.
 * @template T The data type of the field the logic is being added to.
 */
export function hidden<T>(path: FieldPath<T>, logic: NoInfer<LogicFn<T, boolean>>): void {
  assertPathIsCurrent(path);

  const pathImpl = FieldPathNode.extractFromPath(path);
  pathImpl.logic.hidden.push(pathImpl.maybeWrapWithPredicate(logic, false));
}

/**
 * Adds logic to a field to conditionally add validation errors to it.
 *
 * @param path The target path to add the validation logic to.
 * @param logic A `LogicFn<T, ValidationResult>` that returns the current validation errors.
 * @template T The data type of the field the logic is being added to.
 */
export function validate<T>(
  path: FieldPath<T>,
  logic: NoInfer<LogicFn<T, ValidationResult>>,
): void {
  assertPathIsCurrent(path);

  const pathImpl = FieldPathNode.extractFromPath(path);
  pathImpl.logic.errors.push(pathImpl.maybeWrapWithPredicate(logic, /* default value */ undefined));
}

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
      const result = {kind: 'required'} as FormError;
      if (message) {
        result.message = message;
      }
      return result;
    }
    return undefined;
  });
}

/**
 * Adds metadata to a field.
 *
 * @param path The target path to add metadata to.
 * @param key The metadata key
 * @param logic A `LogicFn<T, M>` that returns the metadata value for the given key.
 * @template T The data type of the field the logic is being added to.
 * @template M The type of metadata.
 */
export function metadata<T, M>(
  path: FieldPath<T>,
  key: MetadataKey<M>,
  logic: NoInfer<LogicFn<T, M>>,
): void {
  assertPathIsCurrent(path);

  const pathImpl = FieldPathNode.extractFromPath(path);
  pathImpl.logic.getMetadata(key).push(pathImpl.maybeWrapWithPredicate(logic, key.defaultValue));
}

/**
 * Adds logic to a field to conditionally add a validation error to it.
 * The added FormError will be of `kind: 'custom'`
 *
 * @param path The target path to add the error logic to.
 * @param logic A `LogicFn<T, boolean>` that returns `true` when the error should be added.
 * @param message An optional user-facing message to add to the error, or a `LogicFn<T, string>`
 *   that returns the user-facing message
 */
export function error<T>(
  path: FieldPath<T>,
  logic: NoInfer<LogicFn<T, boolean>>,
  message?: string | NoInfer<LogicFn<T, string>>,
): void {
  assertPathIsCurrent(path);

  if (typeof message === 'function') {
    validate(path, (arg) => {
      return logic(arg)
        ? {
            kind: 'custom',
            message: message(arg),
          }
        : undefined;
    });
  } else {
    const err =
      message === undefined
        ? {kind: 'custom'}
        : {
            kind: 'custom',
            message,
          };
    validate(path, (arg) => {
      return logic(arg) ? err : undefined;
    });
  }
}
