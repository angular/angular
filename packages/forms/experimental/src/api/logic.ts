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
import type {FieldContext, FieldPath, LogicFn, PathKind, TreeValidator, Validator} from './types';

/**
 * Adds logic to a field to conditionally disable it.
 *
 * @param path The target path to add the disabled logic to.
 * @param logic A `LogicFn<T, boolean | string>` that returns `true` when the field is disabled.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function disabled<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<LogicFn<TValue, boolean | string, TPathKind>> = () => true,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDisabledReasonRule((ctx) => {
    const result = logic(ctx as FieldContext<TValue, TPathKind>);
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
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function readonly<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<LogicFn<TValue, boolean, TPathKind>> = () => true,
) {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addReadonlyRule(logic);
}

/**
 * Adds logic to a field to conditionally hide it. A hidden field does not contribute to the
 * validation, touched/dirty, or other state of its parent field.
 *
 * @param path The target path to add the hidden logic to.
 * @param logic A `LogicFn<T, boolean>` that returns `true` when the field is hidden.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function hidden<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<LogicFn<TValue, boolean, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addHiddenRule(logic);
}

/**
 * Adds logic to a field to conditionally add validation errors to it.
 *
 * @param path The target path to add the validation logic to.
 * @param logic A `Validator<T>` that returns the current validation errors.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function validate<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<Validator<TValue, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addSyncErrorRule(logic as Validator<TValue>);
}

export function validateTree<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<TreeValidator<TValue, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addSyncTreeErrorRule(logic as TreeValidator<TValue>);
}

/**
 * Adds metadata to a field.
 *
 * @param path The target path to add metadata to.
 * @param key The metadata key
 * @param logic A `LogicFn<T, M>` that returns the metadata value for the given key.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TMetadata The type of metadata.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function metadata<TValue, TMetadata, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  key: MetadataKey<TMetadata>,
  logic: NoInfer<LogicFn<TValue, TMetadata, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addMetadataRule(key, logic);
}

/**
 * Adds logic to a field to conditionally add a validation error to it.
 * The added FormError will be of `kind: 'custom'`
 *
 * @param path The target path to add the error logic to.
 * @param logic A `LogicFn<T, boolean>` that returns `true` when the error should be added.
 * @param message An optional user-facing message to add to the error, or a `LogicFn<T, string>`
 *   that returns the user-facing message
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function error<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<LogicFn<TValue, boolean, TPathKind>>,
  message?: string | NoInfer<LogicFn<TValue, string, TPathKind>>,
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
