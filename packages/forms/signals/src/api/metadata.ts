/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type ResourceRef, type Signal} from '@angular/core';

/**
 * Represents metadata that is aggregated from multiple parts according to the key's reducer
 * function. A value can be contributed to the aggregated value for a field using an
 * `metadata` rule in the schema. There may be multiple rules in a schema that contribute
 * values to the same `MetadataKey` of the same field.
 *
 * @experimental 21.0.0
 */
export class MetadataKey<TAcc, TSet, TGet = Signal<TAcc>> {
  private brand!: [TAcc, TSet, TGet];

  /** Use {@link reducedMetadataKey}. */
  private constructor(
    readonly reduce: (acc: TAcc, item: TSet) => TAcc,
    readonly getInitial: NoInfer<() => TAcc>,
    readonly wrap?: (s: Signal<TAcc>) => TGet,
  ) {}
}

export type MetadataSetType<TMeta> = TMeta extends MetadataKey<any, infer TSet, any> ? TSet : never;

/**
 * Creates an {@link MetadataKey} that reduces its individual values into an accumulated
 * value using the given `reduce` and `getInitial` functions.
 * @param reduce The reducer function.
 * @param getInitial A function that gets the initial value for the reduce operation.
 *
 * @experimental 21.0.0
 */
export function reducedMetadataKey<TAcc, TSet, TGet = Signal<TAcc>>(
  reduce: (acc: TAcc, item: TSet) => TAcc,
  getInitial: NoInfer<() => TAcc>,
  wrap?: (s: Signal<TAcc>) => TGet,
) {
  return new (MetadataKey as new (
    reduce: (acc: TAcc, item: TSet) => TAcc,
    getInitial: NoInfer<() => TAcc>,
    wrap?: (s: Signal<TAcc>) => TGet,
  ) => MetadataKey<TAcc, TSet, TGet>)(reduce, getInitial, wrap);
}

/**
 * Creates an {@link MetadataKey} that reduces its individual values into a list.
 *
 * @experimental 21.0.0
 */
export function listMetadataKey<TItem>(): MetadataKey<TItem[], TItem | undefined> {
  return reducedMetadataKey(
    (acc, item) => (item === undefined ? acc : [...acc, item]),
    () => [],
  );
}

/**
 * Creates {@link MetadataKey} that reduces its individual values by taking their min.
 *
 * @experimental 21.0.0
 */
export function minMetadataKey(): MetadataKey<number | undefined, number | undefined> {
  return reducedMetadataKey(
    (prev, next) => {
      if (prev === undefined) {
        return next;
      }
      if (next === undefined) {
        return prev;
      }
      return Math.min(prev, next);
    },
    () => undefined,
  );
}

/**
 * Creates {@link MetadataKey} that reduces its individual values by taking their max.
 *
 * @experimental 21.0.0
 */
export function maxMetadataKey(): MetadataKey<number | undefined, number | undefined> {
  return reducedMetadataKey(
    (prev, next) => {
      if (prev === undefined) {
        return next;
      }
      if (next === undefined) {
        return prev;
      }
      return Math.max(prev, next);
    },
    () => undefined,
  );
}

/**
 * Creates an {@link MetadataKey} that reduces its individual values by logically or-ing
 * them.
 *
 * @experimental 21.0.0
 */
export function orMetadataKey(): MetadataKey<boolean, boolean> {
  return reducedMetadataKey(
    (prev, next) => prev || next,
    () => false,
  );
}

/**
 * Creates an {@link MetadataKey} that reduces its individual values by logically and-ing
 * them.
 *
 * @experimental 21.0.0
 */
export function andMetadataKey(): MetadataKey<boolean, boolean> {
  return reducedMetadataKey(
    (prev, next) => prev && next,
    () => true,
  );
}

export function overridableMetadataKey<T>(): MetadataKey<T | undefined, T>;
export function overridableMetadataKey<T>(getInitial: () => T): MetadataKey<T, T>;
export function overridableMetadataKey<T>(getInitial?: () => T): MetadataKey<T | undefined, T> {
  return reducedMetadataKey(
    (_, item) => item,
    () => getInitial?.(),
  );
}

export function resourceMetadataKey<TParams, TResult>(
  factory: (params: Signal<TParams | undefined>) => ResourceRef<TResult>,
): MetadataKey<TParams | undefined, TParams | undefined, ResourceRef<TResult>> {
  return reducedMetadataKey(
    (_, item) => item,
    () => undefined,
    factory,
  );
}

/**
 * An {@link MetadataKey} representing whether the field is required.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const REQUIRED: MetadataKey<boolean, boolean> = orMetadataKey();

/**
 * An {@link MetadataKey} representing the min value of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MIN: MetadataKey<number | undefined, number | undefined> = maxMetadataKey();

/**
 * An {@link MetadataKey} representing the max value of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MAX: MetadataKey<number | undefined, number | undefined> = minMetadataKey();

/**
 * An {@link MetadataKey} representing the min length of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MIN_LENGTH: MetadataKey<number | undefined, number | undefined> = maxMetadataKey();

/**
 * An {@link MetadataKey} representing the max length of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MAX_LENGTH: MetadataKey<number | undefined, number | undefined> = minMetadataKey();

/**
 * An {@link MetadataKey} representing the patterns the field must match.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const PATTERN: MetadataKey<RegExp[], RegExp | undefined> = listMetadataKey();
