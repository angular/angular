/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {addDefaultField} from '../field/validation';
import {FieldPathNode} from '../schema/path_node';
import {assertPathIsCurrent} from '../schema/schema';
import {AggregateMetadataKey, createMetadataKey, MetadataKey} from './metadata';
import type {
  FieldContext,
  SchemaPath,
  FieldValidator,
  LogicFn,
  PathKind,
  TreeValidator,
  SchemaPathRules,
} from './types';
import {ensureCustomValidationResult} from './validators/util';

/**
 * Adds logic to a field to conditionally disable it. A disabled field does not contribute to the
 * validation, touched/dirty, or other state of its parent field.
 *
 * @param path The target path to add the disabled logic to.
 * @param logic A reactive function that returns `true` (or a string reason) when the field is disabled,
 *   and `false` when it is not disabled.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @experimental 21.0.0
 */
export function disabled<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic?: string | NoInfer<LogicFn<TValue, boolean | string, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addDisabledReasonRule((ctx) => {
    let result: boolean | string = true;
    if (typeof logic === 'string') {
      result = logic;
    } else if (logic) {
      result = logic(ctx as FieldContext<TValue, TPathKind>);
    }
    if (typeof result === 'string') {
      return {field: ctx.field, message: result};
    }
    return result ? {field: ctx.field} : undefined;
  });
}

/**
 * Adds logic to a field to conditionally make it readonly. A readonly field does not contribute to
 * the validation, touched/dirty, or other state of its parent field.
 *
 * @param path The target path to make readonly.
 * @param logic A reactive function that returns `true` when the field is readonly.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @experimental 21.0.0
 */
export function readonly<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: NoInfer<LogicFn<TValue, boolean, TPathKind>> = () => true,
) {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addReadonlyRule(logic);
}

/**
 * Adds logic to a field to conditionally hide it. A hidden field does not contribute to the
 * validation, touched/dirty, or other state of its parent field.
 *
 * If a field may be hidden it is recommended to guard it with an `@if` in the template:
 * ```
 * @if (!email().hidden()) {
 *   <label for="email">Email</label>
 *   <input id="email" type="email" [control]="email" />
 * }
 * ```
 *
 * @param path The target path to add the hidden logic to.
 * @param logic A reactive function that returns `true` when the field is hidden.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @experimental 21.0.0
 */
export function hidden<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: NoInfer<LogicFn<TValue, boolean, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addHiddenRule(logic);
}

/**
 * Adds logic to a field to determine if the field has validation errors.
 *
 * @param path The target path to add the validation logic to.
 * @param logic A `Validator` that returns the current validation errors.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @experimental 21.0.0
 */
export function validate<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: NoInfer<FieldValidator<TValue, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addSyncErrorRule((ctx) => {
    return ensureCustomValidationResult(
      addDefaultField(logic(ctx as FieldContext<TValue, TPathKind>), ctx.field),
    );
  });
}

/**
 * Adds logic to a field to determine if the field or any of its child fields has validation errors.
 *
 * @param path The target path to add the validation logic to.
 * @param logic A `TreeValidator` that returns the current validation errors.
 *   Errors returned by the validator may specify a target field to indicate an error on a child field.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @experimental 21.0.0
 */
export function validateTree<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  logic: NoInfer<TreeValidator<TValue, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addSyncTreeErrorRule((ctx) =>
    addDefaultField(logic(ctx as FieldContext<TValue, TPathKind>), ctx.field),
  );
}

/**
 * Adds a value to an {@link AggregateMetadataKey} of a field.
 *
 * @param path The target path to set the aggregate metadata on.
 * @param key The aggregate metadata key
 * @param logic A function that receives the `FieldContext` and returns a value to add to the aggregate metadata.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TMetadataItem The type of value the metadata aggregates over.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @category logic
 * @experimental 21.0.0
 */
export function aggregateMetadata<
  TValue,
  TMetadataItem,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  key: AggregateMetadataKey<any, TMetadataItem>,
  logic: NoInfer<LogicFn<TValue, TMetadataItem, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addAggregateMetadataRule(key, logic);
}

/**
 * Creates a new {@link MetadataKey} and defines the value of the new metadata key for the given field.
 *
 * @param path The path to define the metadata for.
 * @param factory A factory function that creates the value for the metadata.
 *   This function is **not** reactive. It is run once when the field is created.
 * @returns The newly created metadata key
 *
 * @category logic
 * @experimental 21.0.0
 */
export function metadata<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  factory: (ctx: FieldContext<TValue, TPathKind>) => TData,
): MetadataKey<TData>;

/**
 * Defines the value of a {@link MetadataKey} for a given field.
 *
 * @param path The path to define the metadata for.
 * @param key  The metadata key to define.
 * @param factory A factory function that creates the value for the metadata.
 *   This function is **not** reactive. It is run once when the field is created.
 * @returns The given metadata key
 *
 * @category logic
 * @experimental 21.0.0
 */
export function metadata<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  key: MetadataKey<TData>,
  factory: (ctx: FieldContext<TValue, TPathKind>) => TData,
): MetadataKey<TData>;

export function metadata<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  ...rest:
    | [(ctx: FieldContext<TValue, TPathKind>) => TData]
    | [MetadataKey<TData>, (ctx: FieldContext<TValue, TPathKind>) => TData]
): MetadataKey<TData> {
  assertPathIsCurrent(path);

  let key: MetadataKey<TData>;
  let factory: (ctx: FieldContext<TValue, TPathKind>) => TData;
  if (rest.length === 2) {
    [key, factory] = rest;
  } else {
    [factory] = rest;
  }
  key ??= createMetadataKey();

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addMetadataFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
  return key;
}
