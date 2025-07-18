/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Base class for all metadata keys.
 */
export class AbstractMetadataKey<TValue> {
  private unusedType!: TValue;

  protected constructor() {}
}

/**
 * Represents metadata that may be set on a field when it is created using `setMetadata` in the
 * schema. A particular `MetadataKey` can only be set on a particular field **once**.
 */
export class MetadataKey<TValue> extends AbstractMetadataKey<TValue> {
  /**
   * Creates a MetadataKey.
   */
  static create<TValue>() {
    return new MetadataKey<TValue>();
  }
}

/**
 * Represents metadata that is aggregated from multiple parts according to the key's reducer
 * function. A value can be contributed to the aggregated value for a field using `addToMetadata` in
 * the schema. There may be multiple rules in a schema that contribute values to the same
 * `AggregateMetadataKey`.
 */
export class AggregateMetadataKey<TValue> extends AbstractMetadataKey<TValue> {
  protected constructor(
    readonly reduce: (acc: TValue, item: TValue) => TValue,
    readonly getDefault: () => TValue,
  ) {
    super();
  }

  /**
   * Creates an aggregate metadata key that reduces its individual values into an accumulated value
   * using the given `reduce` and `getDefault` functions.
   * @param reduce The reducer function
   * @param getDefault A function that gets the default value for the reduce operation.
   */
  static reduce<TValue>(reduce: (acc: TValue, item: TValue) => TValue, getDefault: () => TValue) {
    return new AggregateMetadataKey(reduce, getDefault);
  }

  /**
   * Creates an aggregate metadata key that reduces its individual values into a list.
   */
  static list<TValue>() {
    return new AggregateMetadataKey<TValue[]>(
      (prev, next) => [...prev, ...next],
      () => [],
    );
  }

  /**
   * Creates an aggregate metadata key that reduces its individual values by taking their min.
   */
  static min() {
    return new AggregateMetadataKey<number | undefined>(
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
   * Creates an aggregate metadata key that reduces its individual values by taking their max.
   */
  static max() {
    return new AggregateMetadataKey<number | undefined>(
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

  // TODO: are `any` and `all` better names?
  /**
   * Creates an aggregate metadata key that reduces its individual values by logically or-ing them.
   */
  static or() {
    return new AggregateMetadataKey<boolean>(
      (prev, next) => prev || next,
      () => false,
    );
  }

  /**
   * Creates an aggregate metadata key that reduces its individual values by logically and-ing them.
   */
  static and() {
    return new AggregateMetadataKey<boolean>(
      (prev, next) => prev && next,
      () => true,
    );
  }
}

/**
 * Metadata representing whether the field is required.
 */
export const REQUIRED = AggregateMetadataKey.or();

/**
 * Metadata representing the min value of the field.
 */
export const MIN = AggregateMetadataKey.max();

/**
 * Metadata representing the max value of the field.
 */
export const MAX = AggregateMetadataKey.min();

/**
 * Metadata representing the min length of the field.
 */
export const MIN_LENGTH = AggregateMetadataKey.max();

/**
 * Metadata representing the max length of the field.
 */
export const MAX_LENGTH = AggregateMetadataKey.min();

/**
 * Metadata representing the patterns the field must match.
 */
export const PATTERN = AggregateMetadataKey.list<string>();
