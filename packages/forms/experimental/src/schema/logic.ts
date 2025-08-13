/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '@angular/core';
import {AggregateProperty, Property} from '../api/property';
import {DisabledReason, type FieldContext, type FieldPath, type LogicFn} from '../api/types';
import type {ValidationError} from '../api/validation_errors';
import type {FieldNode} from '../field/node';
import {isArray} from '../util/type_guards';

/**
 * Special key which is used to represent a dynamic logic property in a `FieldPathNode` path.
 * This property is used to represent logic that applies to every element of some dynamic form data
 * (i.e. an array).
 *
 * For example, a rule like `applyEach(p.myArray, () => { ... })` will add logic to the `DYNAMIC`
 * property of `p.myArray`.
 */
export const DYNAMIC: unique symbol = Symbol();

/** Represents a result that should be ignored because its predicate indicates it is not active. */
const IGNORED = Symbol();

/**
 * A predicate that indicates whether an `AbstractLogic` instance is currently active, or should be
 * ignored.
 */
export interface Predicate {
  /** A boolean logic function that returns true if the logic is considered active. */
  readonly fn: LogicFn<any, boolean>;
  /**
   * The path which this predicate was created for. This is used to determine the correct
   * `FieldContext` to pass to the predicate function.
   */
  readonly path: FieldPath<any>;
}

/**
 * Represents a predicate that is bound to a particular depth in the field tree. This is needed for
 * recursively applied logic to ensure that the predicate is evaluated against the correct
 * application of that logic.
 *
 * Consider the following example:
 *
 * ```
 * const s = schema(p => {
 *   disabled(p.data);
 *   applyWhen(p.next, ({valueOf}) => valueOf(p.data) === 1, s);
 * });
 *
 * const f = form(signal({data: 0, next: {data: 1, next: {data: 2, next: undefined}}}), s);
 *
 * const isDisabled = f.next.next.data().disabled();
 * ```
 *
 * In order to determine `isDisabled` we need to evaluate the predicate from `applyWhen` *twice*.
 * Once to see if the schema should be applied to `f.next` and again to see if it should be applied
 * to `f.next.next`. The `depth` tells us which field we should be evaluating against each time.
 */
export interface BoundPredicate extends Predicate {
  /** The depth in the field tree at which this predicate is bound. */
  readonly depth: number;
}

/**
 * Base class for all logic. It is responsible for combining the results from multiple individual
 * logic functions registered in the schema, and using them to derive the value for some associated
 * piece of field state.
 */
export abstract class AbstractLogic<TReturn, TValue = TReturn> {
  /** The set of logic functions that contribute to the value of the associated state. */
  protected readonly fns: Array<LogicFn<any, TValue | typeof IGNORED>> = [];

  constructor(
    /**
     * A list of predicates that conditionally enable all logic in this logic instance.
     * The logic is only enabled when *all* of the predicates evaluate to true.
     */
    private predicates: ReadonlyArray<BoundPredicate>,
  ) {}

  /**
   * Computes the value of the associated field state based on the logic functions and predicates
   * registered with this logic instance.
   */
  abstract compute(arg: FieldContext<any>): TReturn;

  /**
   * The default value that the associated field state should assume if there are no logic functions
   * registered by the schema (or if the logic is disabled by a predicate).
   */
  abstract get defaultValue(): TReturn;

  /** Registers a logic function with this logic instance. */
  push(logicFn: LogicFn<any, TValue>) {
    this.fns.push(wrapWithPredicates(this.predicates, logicFn));
  }

  /**
   * Merges in the logic from another logic instance, subject to the predicates of both the other
   * instance and this instance.
   */
  mergeIn(other: AbstractLogic<TReturn, TValue>) {
    const fns = this.predicates
      ? other.fns.map((fn) => wrapWithPredicates(this.predicates, fn))
      : other.fns;
    this.fns.push(...fns);
  }
}

/** Logic that combines its individual logic function results with logical OR. */
export class BooleanOrLogic extends AbstractLogic<boolean> {
  override get defaultValue() {
    return false;
  }

  override compute(arg: FieldContext<any>): boolean {
    return this.fns.some((f) => {
      const result = f(arg);
      return result && result !== IGNORED;
    });
  }
}

/**
 * Logic that combines its individual logic function results by aggregating them in an array.
 * Depending on its `ignore` function it may ignore certain values, omitting them from the array.
 */
export class ArrayMergeIgnoreLogic<TElement, TIgnore = never> extends AbstractLogic<
  readonly TElement[],
  TElement | readonly (TElement | TIgnore)[] | TIgnore | undefined | void
> {
  /** Creates an instance of this class that ignores `null` values. */
  static ignoreNull<TElement>(predicates: ReadonlyArray<BoundPredicate>) {
    return new ArrayMergeIgnoreLogic<TElement, null>(predicates, (e: unknown) => e === null);
  }

  constructor(
    predicates: ReadonlyArray<BoundPredicate>,
    private ignore: undefined | ((e: TElement | undefined | TIgnore) => e is TIgnore),
  ) {
    super(predicates);
  }

  override get defaultValue() {
    return [];
  }

  override compute(arg: FieldContext<any>): readonly TElement[] {
    return this.fns.reduce((prev, f) => {
      const value = f(arg);

      if (value === undefined || value === IGNORED) {
        return prev;
      } else if (isArray(value)) {
        return [...prev, ...(this.ignore ? value.filter((e) => !this.ignore!(e)) : value)];
      } else {
        if (this.ignore && this.ignore(value as TElement | TIgnore | undefined)) {
          return prev;
        }
        return [...prev, value];
      }
    }, [] as TElement[]);
  }
}

/** Logic that combines its individual logic function results by aggregating them in an array. */
export class ArrayMergeLogic<TElement> extends ArrayMergeIgnoreLogic<TElement, never> {
  constructor(predicates: ReadonlyArray<BoundPredicate>) {
    super(predicates, undefined);
  }
}

/** Logic that combines an AggregateProperty according to the property's own reduce function. */
export class AggregatePropertyMergeLogic<TAcc, TItem> extends AbstractLogic<TAcc, TItem> {
  override get defaultValue() {
    return this.key.getInitial();
  }

  constructor(
    predicates: ReadonlyArray<BoundPredicate>,
    private key: AggregateProperty<TAcc, TItem>,
  ) {
    super(predicates);
  }

  override compute(ctx: FieldContext<any>): TAcc {
    if (this.fns.length === 0) {
      return this.key.getInitial();
    }
    let acc: TAcc = this.key.getInitial();
    for (let i = 0; i < this.fns.length; i++) {
      const item = this.fns[i](ctx);
      if (item !== IGNORED) {
        acc = this.key.reduce(acc, item);
      }
    }
    return acc;
  }
}

/**
 * Wraps a logic function such that it returns the special `IGNORED` sentinel value if any of the
 * given predicates evaluates to false.
 *
 * @param predicates A list of bound predicates to apply to the logic function
 * @param logicFn The logic function to wrap
 * @returns A wrapped version of the logic function that may return `IGNORED`.
 */
function wrapWithPredicates<TValue, TReturn>(
  predicates: ReadonlyArray<BoundPredicate>,
  logicFn: LogicFn<TValue, TReturn>,
): LogicFn<TValue, TReturn | typeof IGNORED> {
  if (predicates.length === 0) {
    return logicFn;
  }
  return (arg: FieldContext<any>): TReturn | typeof IGNORED => {
    for (const predicate of predicates) {
      let predicateField = arg.stateOf(predicate.path) as FieldNode;
      // Check the depth of the current field vs the depth this predicate is supposed to be
      // evaluated at. If necessary, walk up the field tree to grab the correct context field.
      // We can check the pathKeys as an untracked read since we know the structure of our fields
      // doesn't change.
      const depthDiff = untracked(predicateField.structure.pathKeys).length - predicate.depth;
      for (let i = 0; i < depthDiff; i++) {
        predicateField = predicateField.structure.parent!;
      }
      // If any of the predicates don't match, don't actually run the logic function, just return
      // the default value.
      if (!predicate.fn(predicateField.context)) {
        return IGNORED;
      }
    }
    return logicFn(arg);
  };
}

/**
 * Container for all the different types of logic that can be applied to a field
 * (disabled, hidden, errors, etc.)
 */

export class LogicContainer {
  /** Logic that determines if the field is hidden. */
  readonly hidden: BooleanOrLogic;
  /** Logic that determines reasons for the field being disabled. */
  readonly disabledReasons: ArrayMergeLogic<DisabledReason>;
  /** Logic that determines if the field is read-only. */
  readonly readonly: BooleanOrLogic;
  /** Logic that produces synchronous validation errors for the field. */
  readonly syncErrors: ArrayMergeIgnoreLogic<ValidationError, null>;
  /** Logic that produces synchronous validation errors for the field's subtree. */
  readonly syncTreeErrors: ArrayMergeIgnoreLogic<ValidationError, null>;
  /** Logic that produces asynchronous validation results (errors or 'pending'). */
  readonly asyncErrors: ArrayMergeIgnoreLogic<ValidationError | 'pending', null>;
  /** A map of aggregate properties to the `AbstractLogic` instances that compute their values. */
  private readonly aggregateProperties = new Map<
    AggregateProperty<unknown, unknown>,
    AbstractLogic<unknown>
  >();
  /** A map of property keys to the factory functions that create their values. */
  private readonly propertyFactories = new Map<
    Property<unknown>,
    (ctx: FieldContext<unknown>) => unknown
  >();

  /**
   * Constructs a new `Logic` container.
   * @param predicates An array of predicates that must all be true for the logic
   *   functions within this container to be active.
   */
  constructor(private predicates: ReadonlyArray<BoundPredicate>) {
    this.hidden = new BooleanOrLogic(predicates);
    this.disabledReasons = new ArrayMergeLogic(predicates);
    this.readonly = new BooleanOrLogic(predicates);
    this.syncErrors = ArrayMergeIgnoreLogic.ignoreNull<ValidationError>(predicates);
    this.syncTreeErrors = ArrayMergeIgnoreLogic.ignoreNull<ValidationError>(predicates);
    this.asyncErrors = ArrayMergeIgnoreLogic.ignoreNull<ValidationError | 'pending'>(predicates);
  }

  /**
   * Gets an iterable of [aggregate property, logic function] pairs.
   * @returns An iterable of aggregate property entries.
   */
  getAggregatePropertyEntries() {
    return this.aggregateProperties.entries();
  }

  /**
   * Gets an iterable of [property, value factory function] pairs.
   * @returns An iterable of property factory entries.
   */
  getPropertyFactoryEntries() {
    return this.propertyFactories.entries();
  }

  /**
   * Retrieves or creates the `AbstractLogic` for a given aggregate property.
   * @param prop The `AggregateProperty` for which to get the logic.
   * @returns The `AbstractLogic` associated with the key.
   */
  getAggregateProperty<T>(prop: AggregateProperty<unknown, T>): AbstractLogic<T> {
    if (!this.aggregateProperties.has(prop as AggregateProperty<unknown, unknown>)) {
      this.aggregateProperties.set(
        prop as AggregateProperty<unknown, unknown>,
        new AggregatePropertyMergeLogic(this.predicates, prop),
      );
    }
    return this.aggregateProperties.get(
      prop as AggregateProperty<unknown, unknown>,
    )! as AbstractLogic<T>;
  }

  /**
   * Adds a factory function for a given property.
   * @param prop The `Property` to associate the factory with.
   * @param factory The factory function.
   * @throws If a factory is already defined for the given key.
   */
  addPropertyFactory(prop: Property<unknown>, factory: (ctx: FieldContext<unknown>) => unknown) {
    if (this.propertyFactories.has(prop)) {
      // TODO: name of the property?
      throw new Error(`Can't define value twice for the same Property`);
    }
    this.propertyFactories.set(prop, factory);
  }

  /**
   * Merges logic from another `Logic` instance into this one.
   * @param other The `Logic` instance to merge from.
   */
  mergeIn(other: LogicContainer) {
    this.hidden.mergeIn(other.hidden);
    this.disabledReasons.mergeIn(other.disabledReasons);
    this.readonly.mergeIn(other.readonly);
    this.syncErrors.mergeIn(other.syncErrors);
    this.syncTreeErrors.mergeIn(other.syncTreeErrors);
    this.asyncErrors.mergeIn(other.asyncErrors);
    for (const [prop, propertyLogic] of other.getAggregatePropertyEntries()) {
      this.getAggregateProperty(prop).mergeIn(propertyLogic);
    }
    for (const [prop, propertyFactory] of other.getPropertyFactoryEntries()) {
      this.addPropertyFactory(prop, propertyFactory);
    }
  }
}
