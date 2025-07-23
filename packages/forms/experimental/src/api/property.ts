/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Represents a property that may be defined on a field when it is created using a `property` rule
 * in the schema. A particular `Property` can only be defined on a particular field **once**.
 */
export class Property<TValue> {
  private brand!: TValue;

  protected constructor() {}

  /**
   * Creates a `Property`.
   */
  static create<TValue>() {
    return new Property<TValue>();
  }
}

/**
 * Represents a property that is aggregated from multiple parts according to the property's reducer
 * function. A value can be contributed to the aggregated value for a field using an
 * `aggregateProperty` rule in the schema. There may be multiple rules in a schema that contribute
 * values to the same `AggregateProperty` of the same field.
 */
export class AggregateProperty<TAcc, TItem> {
  private brand!: [TAcc, TItem];

  protected constructor(
    readonly reduce: (acc: TAcc, item: TItem) => TAcc,
    readonly getInitial: () => TAcc,
  ) {}

  /**
   * Creates an aggregate property that reduces its individual values into an accumulated value
   * using the given `reduce` and `getDefault` functions.
   * @param reduce The reducer function
   * @param getInitial A function that gets the initial value for the reduce operation.
   */
  static reduce<TAcc, TItem>(reduce: (acc: TAcc, item: TItem) => TAcc, getInitial: () => TAcc) {
    return new AggregateProperty(reduce, getInitial);
  }

  /**
   * Creates an aggregate property that reduces its individual values into a list.
   */
  static list<TItem>() {
    return new AggregateProperty<TItem[], TItem | undefined>(
      (acc, item) => (item === undefined ? acc : [...acc, item]),
      () => [],
    );
  }

  /**
   * Creates an aggregate property that reduces its individual values by taking their min.
   */
  static min() {
    return new AggregateProperty<number | undefined, number | undefined>(
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
   * Creates an aggregate property that reduces its individual values by taking their max.
   */
  static max() {
    return new AggregateProperty<number | undefined, number | undefined>(
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
   * Creates an aggregate property that reduces its individual values by logically or-ing them.
   */
  static or() {
    return new AggregateProperty<boolean, boolean>(
      (prev, next) => prev || next,
      () => false,
    );
  }

  /**
   * Creates an aggregate property that reduces its individual values by logically and-ing them.
   */
  static and() {
    return new AggregateProperty<boolean, boolean>(
      (prev, next) => prev && next,
      () => true,
    );
  }
}

/**
 * An aggregate property representing whether the field is required.
 */
export const REQUIRED = AggregateProperty.or();

/**
 * An aggregate property representing the min value of the field.
 */
export const MIN = AggregateProperty.max();

/**
 * An aggregate property representing the max value of the field.
 */
export const MAX = AggregateProperty.min();

/**
 * An aggregate property representing the min length of the field.
 */
export const MIN_LENGTH = AggregateProperty.max();

/**
 * An aggregate property representing the max length of the field.
 */
export const MAX_LENGTH = AggregateProperty.min();

/**
 * An aggregate property representing the patterns the field must match.
 */
export const PATTERN = AggregateProperty.list<string>();
