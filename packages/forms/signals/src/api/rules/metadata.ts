/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Signal} from '@angular/core';
import {
  createMetadataKey,
  IS_ASYNC_VALIDATION_RESOURCE,
  type LimitKey,
  type LimitSelectionKey,
  MetadataKey,
  MetadataReducer,
  type MetadataSetterType,
} from '../../schema/metadata';
import {EQUALITY} from '../../schema/logic_node';
import {FieldPathNode} from '../../schema/path_node';
import {assertPathIsCurrent} from '../../schema/schema';
import type {FieldState, LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../types';

export {
  createMetadataKey,
  EQUALITY,
  IS_ASYNC_VALIDATION_RESOURCE,
  type LimitKey,
  type LimitSelectionKey,
  MetadataKey,
  MetadataReducer,
  type MetadataSetterType,
};

/**
 * Sets a value for the {@link MetadataKey} for this field.
 *
 * This value is combined via a reduce operation defined by the particular key,
 * since multiple rules in the schema might set values for it.
 *
 * @param path The target path to set the metadata for.
 * @param key The metadata key
 * @param logic A function that receives the `FieldContext` and returns a value for the metadata.
 * @template TValue The type of value stored in the field the logic is bound to.
 * @template TKey The type of metadata key.
 * @template TPathKind The kind of path the logic is bound to (a root path, child path, or item of an array)
 *
 * @see [Field metadata](guide/forms/signals/field-metadata)
 * @see [Setting values from a schema](guide/forms/signals/field-metadata#setting-values-from-a-schema)
 *
 * @category logic
 * @publicApi 22.0
 */
export function metadata<
  TValue,
  TKey extends MetadataKey<any, any, any>,
  TPathKind extends PathKind = PathKind.Root,
>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  key: TKey,
  logic: NoInfer<
    LogicFn<
      TValue,
      TKey extends LimitSelectionKey ? LimitKey<TValue> : MetadataSetterType<TKey>,
      TPathKind
    >
  >,
): TKey {
  assertPathIsCurrent(path);

  const pathNode = FieldPathNode.unwrapFieldPath(path);
  pathNode.builder.addMetadataRule(key, logic);
  return key;
}

/**
 * Creates a metadata key that exposes a managed value based on the accumulated result of the values
 * written to the key. The accumulated value takes the last value set on a given field tree node,
 * overriding any previously set values.
 *
 * @param create A function that receives a signal of the accumulated value and returns the managed
 *   value based on it. This function runs during the construction of the `FieldTree` node,
 *   and runs in the injection context of that node.
 * @template TRead The type read from the `FieldState` for this key
 * @template TWrite The type written to this key using the `metadata()` rule
 *
 * @see [Attaching lifecycle-aware objects with managed metadata](guide/forms/signals/field-metadata#attaching-lifecycle-aware-objects-with-managed-metadata)
 *
 * @publicApi 22.0
 */
export function createManagedMetadataKey<TRead, TWrite>(
  create: (state: FieldState<unknown>, data: Signal<TWrite | undefined>) => TRead,
): MetadataKey<TRead, TWrite, TWrite | undefined>;
/**
 * Creates a metadata key that exposes a managed value based on the accumulated result of the values
 * written to the key.
 *
 * @param create A function that receives a signal of the accumulated value and returns the managed
 *   value based on it. This function runs during the construction of the `FieldTree` node,
 *   and runs in the injection context of that node.
 * @param reducer The reducer used to combine individual value written to the key,
 *   this will determine the accumulated value that the create function receives.
 * @template TRead The type read from the `FieldState` for this key
 * @template TWrite The type written to this key using the `metadata()` rule
 * @template TAcc The type of the reducer's accumulated value.
 *
 * @see [Attaching lifecycle-aware objects with managed metadata](guide/forms/signals/field-metadata#attaching-lifecycle-aware-objects-with-managed-metadata)
 *
 * @publicApi 22.0
 */
export function createManagedMetadataKey<TRead, TWrite, TAcc>(
  create: (state: FieldState<unknown>, data: Signal<TAcc>) => TRead,
  reducer: MetadataReducer<TAcc, TWrite>,
): MetadataKey<TRead, TWrite, TAcc>;
export function createManagedMetadataKey<TRead, TWrite, TAcc>(
  create: (state: FieldState<unknown>, data: Signal<TAcc>) => TRead,
  reducer?: MetadataReducer<TAcc, TWrite>,
): MetadataKey<TRead, TWrite, TAcc> {
  return new (
    MetadataKey as new (
      reducer: MetadataReducer<TAcc, TWrite>,
      create: (state: FieldState<unknown>, data: Signal<TAcc>) => TRead,
    ) => MetadataKey<TRead, TWrite, TAcc>
  )(reducer ?? MetadataReducer.override<any>(), create);
}

/**
 * Creates a {@link LimitSelectionKey}.
 *
 * @see [Validation constraints](guide/forms/signals/custom-controls#validation-constraints)
 *
 * @publicApi 22.0
 */
export function createLimitSelectionKey(): LimitSelectionKey {
  return createMetadataKey() as LimitSelectionKey;
}

/**
 * A {@link MetadataKey} representing whether the field is required.
 *
 * @see [Required validation](guide/forms/signals/validation#required)
 *
 * @category validation
 * @publicApi 22.0
 */
export const REQUIRED: MetadataKey<Signal<boolean>, boolean, boolean> = createMetadataKey(
  MetadataReducer.or(),
);

/**
 * A {@link MetadataKey} that points to another key determining the minimum value of the field.
 *
 * This indirection allows different keys to be used for different types of values with their
 * own reducers, such as {@link MIN_DATE} and {@link MIN_NUMBER}.
 *
 * @see [Minimum and maximum validation](guide/forms/signals/validation#min-and-max)
 *
 * @category validation
 * @publicApi 22.0
 */
export const MIN: LimitSelectionKey = createLimitSelectionKey();

/**
 * A {@link MetadataKey} representing the minimum valid value of a date field.
 *
 * @see [Minimum and maximum validation](guide/forms/signals/validation#min-and-max)
 *
 * @category validation
 * @publicApi 22.0
 */
export const MIN_DATE: LimitKey<Date> = createMetadataKey(MetadataReducer.max());

/**
 * A {@link MetadataKey} representing the minimum valid value of a number field.
 *
 * @see [Minimum and maximum validation](guide/forms/signals/validation#min-and-max)
 *
 * @category validation
 * @publicApi 22.0
 */
export const MIN_NUMBER: LimitKey<number> = createMetadataKey(MetadataReducer.max());

/**
 * A {@link MetadataKey} that points to another key determining the maximum value of the field.
 *
 * This indirection allows different keys to be used for different types of values with their
 * own reducers, such as {@link MAX_DATE} and {@link MAX_NUMBER}.
 *
 * @see [Minimum and maximum validation](guide/forms/signals/validation#min-and-max)
 *
 * @category validation
 * @publicApi 22.0
 */
export const MAX: LimitSelectionKey = createLimitSelectionKey();

/**
 * A {@link MetadataKey} representing the maximum valid value of a date field.
 *
 * @see [Minimum and maximum validation](guide/forms/signals/validation#min-and-max)
 *
 * @category validation
 * @publicApi 22.0
 */
export const MAX_DATE: LimitKey<Date> = createMetadataKey(MetadataReducer.min());

/**
 * A {@link MetadataKey} representing the maximum valid value of a number field.
 *
 * @see [Minimum and maximum validation](guide/forms/signals/validation#min-and-max)
 *
 * @category validation
 * @publicApi 22.0
 */
export const MAX_NUMBER: LimitKey<number> = createMetadataKey(MetadataReducer.min());

/**
 * A {@link MetadataKey} representing the min length of the field.
 *
 * @see [Minimum and maximum length validation](guide/forms/signals/validation#minlength-and-maxlength)
 *
 * @category validation
 * @publicApi 22.0
 */
export const MIN_LENGTH: LimitKey<number> = createMetadataKey(MetadataReducer.max());

/**
 * A {@link MetadataKey} representing the max length of the field.
 *
 * @see [Minimum and maximum length validation](guide/forms/signals/validation#minlength-and-maxlength)
 *
 * @category validation
 * @publicApi 22.0
 */
export const MAX_LENGTH: LimitKey<number> = createMetadataKey(MetadataReducer.min());

/**
 * A {@link MetadataKey} representing the patterns the field must match.
 *
 * @see [Pattern validation](guide/forms/signals/validation#pattern)
 *
 * @category validation
 * @publicApi 22.0
 */
export const PATTERN: MetadataKey<
  Signal<RegExp[]>,
  RegExp | undefined,
  RegExp[]
> = createMetadataKey(MetadataReducer.list<RegExp>());
