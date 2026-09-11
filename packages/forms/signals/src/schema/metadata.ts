/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type Signal} from '@angular/core';
import type {FieldState} from '../api/types';

/**
 * A reducer that determines the accumulated value for a metadata key by reducing the individual
 * values contributed from `metadata()` rules.
 *
 * @template TAcc The accumulated type of the reduce operation.
 * @template TItem The type of the individual items that are reduced over.
 *
 * @see [Combining contributions with reducers](guide/forms/signals/field-metadata#combining-contributions-with-reducers)
 *
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
 * @see [Async validation](guide/forms/signals/validation#async-validation)
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
 * @see [Field metadata](guide/forms/signals/field-metadata)
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
 *
 * @see [Validation constraints](guide/forms/signals/custom-controls#validation-constraints)
 *
 * @publicApi 22.0
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
 * @see [Validation constraints](guide/forms/signals/custom-controls#validation-constraints)
 *
 * @publicApi 22.0
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
 * @see [Field metadata](guide/forms/signals/field-metadata)
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
 * @see [Creating a metadata key](guide/forms/signals/field-metadata#creating-a-metadata-key)
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
 * @see [Creating a metadata key](guide/forms/signals/field-metadata#creating-a-metadata-key)
 *
 * @publicApi 22.0
 */
export function createMetadataKey<TWrite, TAcc>(
  reducer: MetadataReducer<TAcc, TWrite>,
): MetadataKey<Signal<TAcc>, TWrite, TAcc>;
export function createMetadataKey<TWrite, TAcc>(
  reducer?: MetadataReducer<TAcc, TWrite>,
): MetadataKey<Signal<TAcc>, TWrite, TAcc> {
  return new (
    MetadataKey as new (
      reducer: MetadataReducer<TAcc, TWrite>,
    ) => MetadataKey<Signal<TAcc>, TWrite, TAcc>
  )(reducer ?? MetadataReducer.override<any>());
}
