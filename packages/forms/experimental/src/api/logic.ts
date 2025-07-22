/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPathNode} from '../path_node';
import {assertPathIsCurrent} from '../schema';
import {AggregateProperty, Property} from './property';
import type {FieldContext, FieldPath, LogicFn, PathKind, TreeValidator, Validator} from './types';
import {addDefaultField, ValidationError, WithField} from './validation_errors';

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
  const wrappedLogic = (ctx: FieldContext<TValue, TPathKind>) =>
    addDefaultField(logic(ctx), ctx.field);

  pathNode.logic.addSyncTreeErrorRule(
    wrappedLogic as LogicFn<TValue, WithField<ValidationError>[]>,
  );
}

/**
 * Adds a value to an `AggregateProperty` of a field.
 *
 * @param path The target path to set the aggregate property on.
 * @param prop The aggregate property
 * @param logic A `LogicFn<TValue, TPropItem>` that returns a value to add to the aggregate property.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPropItem The type of value the property aggregates over.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function aggregateProperty<TValue, TPropItem, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  prop: AggregateProperty<any, TPropItem>,
  logic: NoInfer<LogicFn<TValue, TPropItem, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addAggregatePropertyRule(prop, logic);
}

/**
 * Defines the value of a `Property` for a given field.
 *
 * @param path The path to define the property for.
 * @param prop  The property to define.
 * @param factory A factory function that creates the value for the property.
 * @returns The given property
 */
export function property<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  factory: (ctx: FieldContext<TValue, TPathKind>) => TData,
): Property<TData>;

/**
 * Creates a new `Property` and defines the value of the new property for the given field.
 *
 * @param path The path to define the property for.
 * @param factory A factory function that creates the value for the property.
 * @returns The newly created property
 */
export function property<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  prop: Property<TData>,
  factory: (ctx: FieldContext<TValue, TPathKind>) => TData,
): Property<TData>;

export function property<TValue, TData, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  ...rest:
    | [(ctx: FieldContext<TValue, TPathKind>) => TData]
    | [Property<TData>, (ctx: FieldContext<TValue, TPathKind>) => TData]
): Property<TData> {
  assertPathIsCurrent(path);

  let key: Property<TData>;
  let factory: (ctx: FieldContext<TValue, TPathKind>) => TData;
  if (rest.length === 2) {
    [key, factory] = rest;
  } else {
    [factory] = rest;
  }
  key ??= Property.create();

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addPropertyFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
  return key;
}
