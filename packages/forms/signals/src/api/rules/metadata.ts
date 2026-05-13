/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Signal} from '@angular/core';
import {FieldPathNode} from '../../schema/path_node';
import {assertPathIsCurrent} from '../../schema/schema';
import type {FieldState, LogicFn, PathKind, SchemaPath, SchemaPathRules} from '../types';

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
 * A reducer that determines the accumulated value for a metadata key by reducing the individual
 * values contributed from `metadata()` rules.
 *
 * @template TAcc The accumulated type of the reduce operation.
 * @template TItem The type of the individual items that are reduced over.
 * @publicApi 22.0
 */
export interface MetadataReducer<TAcc, TItem> {
  /** The reduce function. */
  reduce: (acc: TAcc, item: TItem) => TAcc;
  /** Gets the initial accumulated value. */
  getInitial: () => TAcc;
}
export const MetadataReducer = {
  /** Creates a reducer that accumulates a list of its individual item values. */
  list<TItem>(): MetadataReducer<TItem[], TItem | undefined> {
    return {
      reduce: (acc, item) => (item === undefined ? acc : [...acc, item]),
      getInitial: () => [],
    };
  },

  /** Creates a reducer that accumulates the min of its individual item values. */
  min<T extends Date | number>(): MetadataReducer<T | undefined, T | undefined> {
    return {
      reduce: (acc, item) => {
        if (acc === undefined || item === undefined) {
          return acc ?? item;
        }
        return item < acc ? item : acc;
      },
      getInitial: () => undefined,
    };
  },

  /** Creates a reducer that accumulates a the max of its individual item values. */
  max<T extends Date | number>(): MetadataReducer<T | undefined, T | undefined> {
    return {
      reduce: (acc, item) => {
        if (acc === undefined || item === undefined) {
          return acc ?? item;
        }
        return item > acc ? item : acc;
      },
      getInitial: () => undefined,
    };
  },

  /** Creates a reducer that logically or's its accumulated value with each individual item value. */
  or(): MetadataReducer<boolean, boolean> {
    return {
      reduce: (prev, next) => prev || next,
      getInitial: () => false,
    };
  },

  /** Creates a reducer that logically and's its accumulated value with each individual item value. */
  and(): MetadataReducer<boolean, boolean> {
    return {
      reduce: (prev, next) => prev && next,
      getInitial: () => true,
    };
  },

  /** Creates a reducer that always takes the next individual item value as the accumulated value. */
  override,
} as const;

function override<T>(): MetadataReducer<T | undefined, T>;
function override<T>(getInitial: () => T): MetadataReducer<T, T>;
function override<T>(getInitial?: () => T): MetadataReducer<T | undefined, T> {
  return {
    reduce: (_, item) => item,
    getInitial: () => getInitial?.(),
  };
}

/**
 * A symbol used to tag a `MetadataKey` as representing an asynchronous validation resource.
 *
 * @category validation
 * @publicApi 22.0
 */
export const IS_ASYNC_VALIDATION_RESOURCE: unique symbol = Symbol('IS_ASYNC_VALIDATION_RESOURCE');

/**
 * Represents metadata that is aggregated from multiple parts according to the key's reducer
 * function. A value can be contributed to the aggregated value for a field using an
 * `metadata` rule in the schema. There may be multiple rules in a schema that contribute
 * values to the same `MetadataKey` of the same field.
 *
 * @template TRead The type read from the `FieldState` for this key
 * @template TWrite The type written to this key using the `metadata()` rule
 * @template TAcc The type of the reducer's accumulated value.
 *
 * @publicApi 22.0
 */
export class MetadataKey<TRead, TWrite, TAcc> {
  private brand!: (write: TWrite) => [TRead, TAcc];

  /** @internal */
  [IS_ASYNC_VALIDATION_RESOURCE]?: true;

  /** Use {@link createMetadataKey}. */
  protected constructor(
    readonly reducer: MetadataReducer<TAcc, TWrite>,
    readonly create: ((state: FieldState<unknown>, data: Signal<TAcc>) => TRead) | undefined,
  ) {}
}

/**
 * Represents metadata that is used to define a valid limit for a field.
 *
 * @template TLimit The type the limit value.
 * @experimental 22.0.0
 */
export type LimitKey<TLimit> = MetadataKey<
  Signal<NonNullable<TLimit> | undefined>,
  NonNullable<TLimit> | undefined,
  NonNullable<TLimit> | undefined
>;

/**
 * A symbol used to tag a `MetadataKey` as representing a limit selection key.
 */
declare const LIMIT_SELECTION_KEY: unique symbol;

/**
 * Used to select a {@link LimitKey}.
 *
 * This indirection allows rules to bind a {@link LimitKey} of a specific limit type (e.g. `number`
 * or `Date`) matching the field's type to a generic {@link MetadataKey}.
 *
 * @experimental 22.0.0
 */
export type LimitSelectionKey = MetadataKey<
  Signal<LimitKey<unknown> | undefined>,
  LimitKey<unknown>,
  LimitKey<unknown> | undefined
> & {
  [LIMIT_SELECTION_KEY]: true;
};

/**
 * Extracts the the type that can be set into the given metadata key type using the `metadata()` rule.
 *
 * @template TKey The `MetadataKey` type
 *
 * @publicApi 22.0
 */
export type MetadataSetterType<TKey> =
  TKey extends MetadataKey<any, infer TWrite, any> ? TWrite : never;

/**
 * Creates a metadata key used to contain a computed value.
 * The last value set on a given field tree node overrides any previously set values.
 *
 * @template TWrite The type written to this key using the `metadata()` rule
 *
 * @publicApi 22.0
 */
export function createMetadataKey<TWrite>(): MetadataKey<
  Signal<TWrite | undefined>,
  TWrite,
  TWrite | undefined
>;
/**
 * Creates a metadata key used to contain a computed value.
 *
 * @param reducer The reducer used to combine individually set values into the final computed value.
 * @template TWrite The type written to this key using the `metadata()` rule
 * @template TAcc The type of the reducer's accumulated value.
 *
 * @publicApi 22.0
 */
export function createMetadataKey<TWrite, TAcc>(
  reducer: MetadataReducer<TAcc, TWrite>,
): MetadataKey<Signal<TAcc>, TWrite, TAcc>;
export function createMetadataKey<TWrite, TAcc>(
  reducer?: MetadataReducer<TAcc, TWrite>,
): MetadataKey<Signal<TAcc>, TWrite, TAcc> {
  return new (MetadataKey as new (
    reducer: MetadataReducer<TAcc, TWrite>,
  ) => MetadataKey<Signal<TAcc>, TWrite, TAcc>)(reducer ?? MetadataReducer.override<any>());
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
  return new (MetadataKey as new (
    reducer: MetadataReducer<TAcc, TWrite>,
    create: (state: FieldState<unknown>, data: Signal<TAcc>) => TRead,
  ) => MetadataKey<TRead, TWrite, TAcc>)(reducer ?? MetadataReducer.override<any>(), create);
}

/**
 * Creates a {@link LimitSelectionKey}.
 *
 * @experimental 22.0.0
 */
export function createLimitSelectionKey(): LimitSelectionKey {
  return createMetadataKey() as LimitSelectionKey;
}

/**
 * A {@link MetadataKey} representing whether the field is required.
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
 * @category validation
 * @publicApi 22.0
 */
export const MIN: LimitSelectionKey = createLimitSelectionKey();

/**
 * A {@link MetadataKey} representing the minimum valid value of a date field.
 *
 * @category validation
 * @experimental 22.0.0
 */
export const MIN_DATE: LimitKey<Date> = createMetadataKey(MetadataReducer.max());

/**
 * A {@link MetadataKey} representing the minimum valid value of a number field.
 *
 * @category validation
 * @experimental 22.0.0
 */
export const MIN_NUMBER: LimitKey<number> = createMetadataKey(MetadataReducer.max());

/**
 * A {@link MetadataKey} that points to another key determining the maximum value of the field.
 *
 * This indirection allows different keys to be used for different types of values with their
 * own reducers, such as {@link MAX_DATE} and {@link MAX_NUMBER}.
 *
 * @category validation
 * @publicApi 22.0
 */
export const MAX: LimitSelectionKey = createLimitSelectionKey();

/**
 * A {@link MetadataKey} representing the maximum valid value of a date field.
 *
 * @category validation
 * @experimental 22.0.0
 */
export const MAX_DATE: LimitKey<Date> = createMetadataKey(MetadataReducer.min());

/**
 * A {@link MetadataKey} representing the maximum valid value of a number field.
 *
 * @category validation
 * @experimental 22.0.0
 */
export const MAX_NUMBER: LimitKey<number> = createMetadataKey(MetadataReducer.min());

/**
 * A {@link MetadataKey} representing the min length of the field.
 *
 * @category validation
 * @publicApi 22.0
 */
export const MIN_LENGTH: LimitKey<number> = createMetadataKey(MetadataReducer.max());

/**
 * A {@link MetadataKey} representing the max length of the field.
 *
 * @category validation
 * @publicApi 22.0
 */
export const MAX_LENGTH: LimitKey<number> = createMetadataKey(MetadataReducer.min());

/**
 * A {@link MetadataKey} representing the patterns the field must match.
 *
 * @category validation
 * @publicApi 22.0
 */
export const PATTERN: MetadataKey<
  Signal<RegExp[]>,
  RegExp | undefined,
  RegExp[]
> = createMetadataKey(MetadataReducer.list<RegExp>());
