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
export class MetadataKey<TValue> {
  /** @internal */
  protected __type!: TValue;

  private constructor() {}

  /**
   * Creates a reactive metadata key that reduces its individual values into an accumulated value.
   * @param accumulate The accumulation function
   * @param getDefault A function that returns the default value.
   */
  static reduce<TValue>(
    accumulate: (prev: TValue, next: TValue) => TValue,
    getDefault: () => TValue,
  ) {
    return new ReactiveKeyCtor(accumulate, getDefault);
  }

  /**
   * Creates a reactive metadata key that aggregates its individual values into an array.
   */
  static aggregate<TValue>() {
    return new ReactiveKeyCtor<TValue[]>(
      (prev, next) => [...prev, ...next],
      () => [],
    );
  }

  /**
   * Creates a reactive metadata key that takes the min of its individual values.
   */
  static min() {
    return new ReactiveKeyCtor<number | undefined>(
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
   * Creates a reactive metadata key that takes the max of its individual values.
   */
  static max() {
    return new ReactiveKeyCtor<number | undefined>(
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
   * Creates a reactive metadata key that combines its individual values with logical or.
   */
  static or() {
    return new ReactiveKeyCtor<boolean>(
      (prev, next) => prev || next,
      () => false,
    );
  }

  /**
   * Creates a reactive metadata key that combines its individual values with logical and.
   */
  static and() {
    return new ReactiveKeyCtor<boolean>(
      (prev, next) => prev && next,
      () => true,
    );
  }

  /**
   * Creates a static metadata key.
   */
  static static<TValue>() {
    return new StaticKeyCtor<TValue>();
  }
}

/**
 * Re-cast the MetadataKey constructor to allow ourselves to extend it.
 */
const KeyCtor = MetadataKey as unknown as new <TValue>() => MetadataKey<TValue>;

/**
 * Represents static metadata that is set once when the field is created and cannot change.
 * If the metadata is not defined for a given field, its valud is undefined.
 */
export class StaticMetadataKey<TValue> extends KeyCtor<TValue> {
  protected constructor() {
    super();
  }
}

/**
 * Re-cast the StaticMetadataKey constructor to allow ourselves to new it.
 */
const StaticKeyCtor = StaticMetadataKey as unknown as new <TValue>() => StaticMetadataKey<TValue>;

/**
 * Represents reactive metadata that can change depending on state of the form.
 * Reactive metadata can have multiple definitions for the same field, the individual values from
 * each definition are combined according to the key's accumulation function.
 * If the key is not defined for a given field, it assumes the default value
 */
export class ReactiveMetadataKey<TValue> extends KeyCtor<TValue> {
  protected constructor(
    readonly accumulate: (prev: TValue, next: TValue) => TValue,
    readonly getDefault: () => TValue,
  ) {
    super();
  }
}

/**
 * Re-cast the ReactiveMetadataKey constructor to allow ourselves to new it.
 */
const ReactiveKeyCtor = ReactiveMetadataKey as unknown as new <TValue>(
  accumulate: (prev: TValue, next: TValue) => TValue,
  getDefault: () => TValue,
) => ReactiveMetadataKey<TValue>;

/**
 * Metadata representing whether the field is required.
 */
export const REQUIRED = MetadataKey.or();

/**
 * Metadata representing the min value of the field.
 */
export const MIN = MetadataKey.max();

/**
 * Metadata representing the max value of the field.
 */
export const MAX = MetadataKey.min();

/**
 * Metadata representing the min length of the field.
 */
export const MIN_LENGTH = MetadataKey.max();

/**
 * Metadata representing the max length of the field.
 */
export const MAX_LENGTH = MetadataKey.min();

/**
 * Metadata representing the patterns the field must match.
 */
export const PATTERN = MetadataKey.aggregate<string>();
