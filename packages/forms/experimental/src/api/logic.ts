/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MetadataKey} from '../api/metadata';
import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import type {FieldPath, LogicFn, TreeValidator, Validator} from './types';

/**
 * Adds logic to a field to conditionally disable it.
 *
 * @param path The target path to add the disabled logic to.
 * @param logic A `LogicFn<T, boolean | string>` that returns `true` when the field is disabled.
 * @template T The data type of the field the logic is being added to.
 */
export function disabled<T>(
  path: FieldPath<T>,
  logic: NoInfer<LogicFn<T, boolean | string>> = () => true,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.disabledReasons.push((ctx) => {
    const result = logic(ctx);
    if (!result) {
      return undefined;
    }
    if (typeof result === 'string') {
      return {
        field: ctx.field,
        reason: result,
      };
    }
    return {field: ctx.field};
  });
}

/**
 * Adds logic to a field to conditionally make it readonly.
 *
 * @param path The target path to make readonly.
 * @param logic A `LogicFn<T, boolean>` that returns `true` when the field is readonly.
 * @template T The data type of the field the logic is being added to.
 */
export function readonly<T>(path: FieldPath<T>, logic: NoInfer<LogicFn<T, boolean>> = () => true) {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.readonly.push(logic);
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

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.hidden.push(logic);
}

/**
 * Adds logic to a field to conditionally add validation errors to it.
 *
 * @param path The target path to add the validation logic to.
 * @param logic A `Validator<T>` that returns the current validation errors.
 * @template T The data type of the field the logic is being added to.
 */
export function validate<T>(path: FieldPath<T>, logic: NoInfer<Validator<T>>): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.syncErrors.push(logic);
}

export function validateTree<T>(path: FieldPath<T>, logic: NoInfer<TreeValidator<T>>): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.syncTreeErrors.push(logic);
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

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.getMetadata(key).push(logic);
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
