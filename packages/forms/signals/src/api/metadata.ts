/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type ResourceRef, type Signal} from '@angular/core';

export interface MetadataReducer<TAcc, TItem> {
  reduce: (acc: TAcc, item: TItem) => TAcc;
  getInitial: NoInfer<() => TAcc>;
}

export function listMetadataReducer<TItem>(): MetadataReducer<TItem[], TItem | undefined> {
  return {
    reduce: (acc, item) => (item === undefined ? acc : [...acc, item]),
    getInitial: () => [],
  };
}

export function minMetadataReducer(): MetadataReducer<number | undefined, number | undefined> {
  return {
    reduce: (acc, item) => {
      if (acc === undefined) {
        return item;
      }
      if (item === undefined) {
        return acc;
      }
      return Math.min(acc, item);
    },
    getInitial: () => undefined,
  };
}

export function maxMetadataReducer(): MetadataReducer<number | undefined, number | undefined> {
  return {
    reduce: (prev, next) => {
      if (prev === undefined) {
        return next;
      }
      if (next === undefined) {
        return prev;
      }
      return Math.max(prev, next);
    },
    getInitial: () => undefined,
  };
}

export function orMetadataReducer(): MetadataReducer<boolean, boolean> {
  return {
    reduce: (prev, next) => prev || next,
    getInitial: () => false,
  };
}

export function andMetadataReducer(): MetadataReducer<boolean, boolean> {
  return {
    reduce: (prev, next) => prev && next,
    getInitial: () => false,
  };
}

export function overrideMetadataReducer<T>(): MetadataReducer<T | undefined, T>;
export function overrideMetadataReducer<T>(getInitial: () => T): MetadataReducer<T, T>;
export function overrideMetadataReducer<T>(
  getInitial?: () => T,
): MetadataReducer<T | undefined, T> {
  return {
    reduce: (_, item) => item,
    getInitial: () => getInitial?.(),
  };
}

/**
 * Represents metadata that is aggregated from multiple parts according to the key's reducer
 * function. A value can be contributed to the aggregated value for a field using an
 * `metadata` rule in the schema. There may be multiple rules in a schema that contribute
 * values to the same `MetadataKey` of the same field.
 *
 * @experimental 21.0.0
 */
export class MetadataKey<TGet, TSet, TAcc> {
  private brand!: [TGet, TSet, TAcc];

  /** Use {@link reducedMetadataKey}. */
  protected constructor(
    readonly reducer: MetadataReducer<TAcc, TSet>,
    readonly wrap?: (s: Signal<TAcc>) => TGet,
  ) {}
}

export type MetadataSetterType<TKey> =
  TKey extends MetadataKey<any, infer TSet, any> ? TSet : never;

export type ComputedMetadataKey<TValue, TSet = TValue> = MetadataKey<Signal<TValue>, TSet, TValue>;

export type ResourceMetadataKey<TResult, TParams> = MetadataKey<
  ResourceRef<TResult>,
  TParams,
  TParams | undefined
>;

export function createMetadataKey<TValue>(): ComputedMetadataKey<TValue | undefined>;
export function createMetadataKey<TValue, TSet>(opts: {
  reducer: MetadataReducer<TValue, TSet>;
}): ComputedMetadataKey<TValue, TSet>;
export function createMetadataKey<TGet, TSet>(opts: {
  wrap: (s: Signal<TSet | undefined>) => TGet;
}): MetadataKey<TGet, TSet | undefined, TSet | undefined>;
export function createMetadataKey<TGet, TSet, TAcc>(opts: {
  reducer: MetadataReducer<TAcc, TSet>;
  wrap: (s: Signal<TAcc>) => TGet;
}): MetadataKey<TGet, TSet, TAcc>;
export function createMetadataKey<TGet, TSet, TAcc>(opts?: {
  reducer?: MetadataReducer<TAcc, TSet>;
  wrap?: (s: Signal<TAcc>) => TGet;
}): MetadataKey<TGet, TSet, TAcc> {
  return new (MetadataKey as new (
    reducer: MetadataReducer<TAcc, TSet>,
    wrap?: (s: Signal<TAcc>) => TGet,
  ) => MetadataKey<TGet, TSet, TAcc>)(opts?.reducer ?? overrideMetadataReducer<any>(), opts?.wrap);
}

/**
 * A {@link MetadataKey} representing whether the field is required.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const REQUIRED: ComputedMetadataKey<boolean> = createMetadataKey({
  reducer: orMetadataReducer(),
});

/**
 * A {@link MetadataKey} representing the min value of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MIN: ComputedMetadataKey<number | undefined> = createMetadataKey({
  reducer: maxMetadataReducer(),
});

/**
 * A {@link MetadataKey} representing the max value of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MAX: ComputedMetadataKey<number | undefined> = createMetadataKey({
  reducer: minMetadataReducer(),
});

/**
 * A {@link MetadataKey} representing the min length of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MIN_LENGTH: ComputedMetadataKey<number | undefined> = createMetadataKey({
  reducer: maxMetadataReducer(),
});

/**
 * A {@link MetadataKey} representing the max length of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MAX_LENGTH: ComputedMetadataKey<number | undefined> = createMetadataKey({
  reducer: minMetadataReducer(),
});

/**
 * A {@link MetadataKey} representing the patterns the field must match.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const PATTERN: ComputedMetadataKey<RegExp[], RegExp | undefined> = createMetadataKey({
  reducer: listMetadataReducer(),
});
