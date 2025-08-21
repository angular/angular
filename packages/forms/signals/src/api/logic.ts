/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FieldPathNode} from '../schema/path_node';
import {assertPathIsCurrent} from '../schema/schema';
import {AggregateProperty, createProperty, Property} from './property';
import type {
  FieldContext,
  FieldPath,
  FieldValidator,
  LogicFn,
  PathKind,
  TreeValidator,
} from './types';
import {addDefaultField} from './validation_errors';

/**
 * Adds logic to a field to conditionally disable it. A disabled field does not contribute to the
 * validation, touched/dirty, or other state of its parent field.
 *
 * @param path The target path to add the disabled logic to.
 * @param logic A reactive function that returns `true` (or a string reason) when the field is disabled,
 *   and `false` when it is not disabled.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function disabled<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic?: string | NoInfer<LogicFn<TValue, boolean | string, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addDisabledReasonRule((ctx) => {
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
 * Adds logic to a field to determine if the field has validation errors.
 *
 * @param path The target path to add the validation logic to.
 * @param logic A `Validator` that returns the current validation errors.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function validate<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<FieldValidator<TValue, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addSyncErrorRule((ctx) =>
    addDefaultField(logic(ctx as FieldContext<TValue, TPathKind>), ctx.field),
  );
}

/**
 * Adds logic to a field to determine if the field or any of its child fields has validation errors.
 *
 * @param path The target path to add the validation logic to.
 * @param logic A `TreeValidator` that returns the current validation errors.
 *   Errors returned by the validator may specify a target field to indicate an error on a child field.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 */
export function validateTree<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<TValue, TPathKind>,
  logic: NoInfer<TreeValidator<TValue, TPathKind>>,
): void {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addSyncTreeErrorRule((ctx) =>
    addDefaultField(logic(ctx as FieldContext<TValue, TPathKind>), ctx.field),
  );
}

/**
 * Adds a value to an `AggregateProperty` of a field.
 *
 * @param path The target path to set the aggregate property on.
 * @param prop The aggregate property
 * @param logic A function that receives the `FieldContext` and returns a value to add to the aggregate property.
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
 *   This function is **not** reactive. It is run once when the field is created.
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
 *   This function is **not** reactive. It is run once when the field is created.
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
  key ??= createProperty();

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.logic.addPropertyFactory(key, factory as (ctx: FieldContext<unknown>) => unknown);
  return key;
}
