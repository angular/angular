/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Represents metadata that may be defined on a field when it is created using a `metadata` rule
 * in the schema. A particular `MetadataKey` can only be defined on a particular field **once**.
 *
 * @category logic
 * @experimental 21.0.0
 */
export class MetadataKey<TValue> {
  private brand!: TValue;

  /** Use {@link createMetadataKey}. */
  private constructor() {}
}

/**
 * Creates a {@link MetadataKey}.
 *
 * @experimental 21.0.0
 */
export function createMetadataKey<TValue>(): MetadataKey<TValue> {
  return new (MetadataKey as new () => MetadataKey<TValue>)();
}

/**
 * Represents metadata that is aggregated from multiple parts according to the key's reducer
 * function. A value can be contributed to the aggregated value for a field using an
 * `aggregateMetadata` rule in the schema. There may be multiple rules in a schema that contribute
 * values to the same `AggregateMetadataKey` of the same field.
 *
 * @experimental 21.0.0
 */
export class AggregateMetadataKey<TAcc, TItem> {
  private brand!: [TAcc, TItem];

  /** Use {@link reducedMetadataKey}. */
  private constructor(
    readonly reduce: (acc: TAcc, item: TItem) => TAcc,
    readonly getInitial: () => TAcc,
  ) {}
}

/**
 * Creates an {@link AggregateMetadataKey} that reduces its individual values into an accumulated
 * value using the given `reduce` and `getInitial` functions.
 * @param reduce The reducer function.
 * @param getInitial A function that gets the initial value for the reduce operation.
 *
 * @experimental 21.0.0
 */
export function reducedMetadataKey<TAcc, TItem>(
  reduce: (acc: TAcc, item: TItem) => TAcc,
  getInitial: NoInfer<() => TAcc>,
): AggregateMetadataKey<TAcc, TItem> {
  return new (AggregateMetadataKey as new (
    reduce: (acc: TAcc, item: TItem) => TAcc,
    getInitial: () => TAcc,
  ) => AggregateMetadataKey<TAcc, TItem>)(reduce, getInitial);
}

/**
 * Creates an {@link AggregateMetadataKey} that reduces its individual values into a list.
 *
 * @experimental 21.0.0
 */
export function listMetadataKey<TItem>(): AggregateMetadataKey<TItem[], TItem | undefined> {
  return reducedMetadataKey(
    (acc, item) => (item === undefined ? acc : [...acc, item]),
    () => [],
  );
}

/**
 * Creates {@link AggregateMetadataKey} that reduces its individual values by taking their min.
 *
 * @experimental 21.0.0
 */
export function minMetadataKey(): AggregateMetadataKey<number | undefined, number | undefined> {
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
 * Creates {@link AggregateMetadataKey} that reduces its individual values by taking their max.
 *
 * @experimental 21.0.0
 */
export function maxMetadataKey(): AggregateMetadataKey<number | undefined, number | undefined> {
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
 * Creates an {@link AggregateMetadataKey} that reduces its individual values by logically or-ing
 * them.
 *
 * @experimental 21.0.0
 */
export function orMetadataKey(): AggregateMetadataKey<boolean, boolean> {
  return reducedMetadataKey(
    (prev, next) => prev || next,
    () => false,
  );
}

/**
 * Creates an {@link AggregateMetadataKey} that reduces its individual values by logically and-ing
 * them.
 *
 * @experimental 21.0.0
 */
export function andMetadataKey(): AggregateMetadataKey<boolean, boolean> {
  return reducedMetadataKey(
    (prev, next) => prev && next,
    () => true,
  );
}

/**
 * An {@link AggregateMetadataKey} representing whether the field is required.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const REQUIRED: AggregateMetadataKey<boolean, boolean> = orMetadataKey();

/**
 * An {@link AggregateMetadataKey} representing the min value of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MIN: AggregateMetadataKey<number | undefined, number | undefined> = maxMetadataKey();

/**
 * An {@link AggregateMetadataKey} representing the max value of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MAX: AggregateMetadataKey<number | undefined, number | undefined> = minMetadataKey();

/**
 * An {@link AggregateMetadataKey} representing the min length of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MIN_LENGTH: AggregateMetadataKey<number | undefined, number | undefined> =
  maxMetadataKey();

/**
 * An {@link AggregateMetadataKey} representing the max length of the field.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const MAX_LENGTH: AggregateMetadataKey<number | undefined, number | undefined> =
  minMetadataKey();

/**
 * An {@link AggregateMetadataKey} representing the patterns the field must match.
 *
 * @category validation
 * @experimental 21.0.0
 */
export const PATTERN: AggregateMetadataKey<RegExp[], RegExp | undefined> = listMetadataKey();
