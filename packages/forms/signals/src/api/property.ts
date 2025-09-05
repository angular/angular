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
 *
 * @experimental 21.0.0
 */
export class Property<TValue> {
  private brand!: TValue;

  /** Use {@link createProperty}. */
  private constructor() {}
}

/**
 * Creates a {@link Property}.
 *
 * @experimental 21.0.0
 */
export function createProperty<TValue>(): Property<TValue> {
  return new (Property as new () => Property<TValue>)();
}

/**
 * Represents a property that is aggregated from multiple parts according to the property's reducer
 * function. A value can be contributed to the aggregated value for a field using an
 * `aggregateProperty` rule in the schema. There may be multiple rules in a schema that contribute
 * values to the same `AggregateProperty` of the same field.
 *
 * @experimental 21.0.0
 */
export class AggregateProperty<TAcc, TItem> {
  private brand!: [TAcc, TItem];

  /** Use {@link reducedProperty}. */
  private constructor(
    readonly reduce: (acc: TAcc, item: TItem) => TAcc,
    readonly getInitial: () => TAcc,
  ) {}
}

/**
 * Creates an aggregate property that reduces its individual values into an accumulated value using
 * the given `reduce` and `getInitial` functions.
 * @param reduce The reducer function.
 * @param getInitial A function that gets the initial value for the reduce operation.
 *
 * @experimental 21.0.0
 */
export function reducedProperty<TAcc, TItem>(
  reduce: (acc: TAcc, item: TItem) => TAcc,
  getInitial: () => TAcc,
): AggregateProperty<TAcc, TItem> {
  return new (AggregateProperty as new (
    reduce: (acc: TAcc, item: TItem) => TAcc,
    getInitial: () => TAcc,
  ) => AggregateProperty<TAcc, TItem>)(reduce, getInitial);
}

/**
 * Creates an aggregate property that reduces its individual values into a list.
 *
 * @experimental 21.0.0
 */
export function listProperty<TItem>(): AggregateProperty<TItem[], TItem | undefined> {
  return reducedProperty<TItem[], TItem | undefined>(
    (acc, item) => (item === undefined ? acc : [...acc, item]),
    () => [],
  );
}

/**
 * Creates an aggregate property that reduces its individual values by taking their min.
 *
 * @experimental 21.0.0
 */
export function minProperty(): AggregateProperty<number | undefined, number | undefined> {
  return reducedProperty<number | undefined, number | undefined>(
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
 *
 * @experimental 21.0.0
 */
export function maxProperty(): AggregateProperty<number | undefined, number | undefined> {
  return reducedProperty<number | undefined, number | undefined>(
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
 *
 * @experimental 21.0.0
 */
export function orProperty(): AggregateProperty<boolean, boolean> {
  return reducedProperty(
    (prev, next) => prev || next,
    () => false,
  );
}

/**
 * Creates an aggregate property that reduces its individual values by logically and-ing them.
 *
 * @experimental 21.0.0
 */
export function andProperty(): AggregateProperty<boolean, boolean> {
  return reducedProperty(
    (prev, next) => prev && next,
    () => true,
  );
}

/**
 * An aggregate property representing whether the field is required.
 *
 * @experimental 21.0.0
 */
export const REQUIRED: AggregateProperty<boolean, boolean> = orProperty();

/**
 * An aggregate property representing the min value of the field.
 *
 * @experimental 21.0.0
 */
export const MIN: AggregateProperty<number | undefined, number | undefined> = maxProperty();

/**
 * An aggregate property representing the max value of the field.
 *
 * @experimental 21.0.0
 */
export const MAX: AggregateProperty<number | undefined, number | undefined> = minProperty();

/**
 * An aggregate property representing the min length of the field.
 *
 * @experimental 21.0.0
 */
export const MIN_LENGTH: AggregateProperty<number | undefined, number | undefined> = maxProperty();

/**
 * An aggregate property representing the max length of the field.
 *
 * @experimental 21.0.0
 */
export const MAX_LENGTH: AggregateProperty<number | undefined, number | undefined> = minProperty();

/**
 * An aggregate property representing the patterns the field must match.
 *
 * @experimental 21.0.0
 */
export const PATTERN: AggregateProperty<RegExp[], RegExp | undefined> = listProperty<RegExp>();
