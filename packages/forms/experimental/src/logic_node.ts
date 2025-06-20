/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {untracked} from '@angular/core';
import {DataKey} from './api/data';
import {MetadataKey} from './api/metadata';
import {
  DisabledReason,
  FormTreeError,
  type FieldContext,
  type FieldPath,
  type FormError,
  type LogicFn,
} from './api/types';
import {FieldNode} from './field/node';

/**
 * Special key which is used to represent a dynamic index in a `FieldLogicNode` path.
 */
export const DYNAMIC: unique symbol = Symbol('DYNAMIC');

export interface Predicate {
  readonly fn: LogicFn<any, boolean>;
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

export interface DataDefinition {
  readonly factory: LogicFn<unknown, unknown>;
  readonly initializer?: (value: unknown) => void;
}

/**
 * Logic associated with a particular location (path) in a form.
 *
 * This can be logic associated with a specific field, or with all fields within in array or other
 * dynamic structure.
 */
export class FieldLogicNode {
  readonly hidden: BooleanOrLogic;
  readonly disabledReasons: ArrayMergeLogic<DisabledReason>;
  readonly readonly: BooleanOrLogic;
  readonly syncErrors: ArrayMergeLogic<FormError>;
  readonly syncTreeErrors: ArrayMergeLogic<FormTreeError>;
  readonly asyncErrors: ArrayMergeLogic<FormTreeError | 'pending'>;

  private readonly metadata = new Map<MetadataKey<unknown>, AbstractLogic<unknown>>();

  readonly dataFactories = new Map<DataKey<unknown>, (ctx: FieldContext<unknown>) => unknown>();
  private readonly children = new Map<PropertyKey, FieldLogicNode>();
  private readonly predicates: Predicate[];

  private constructor(predicate: Predicate | undefined) {
    this.predicates = predicate !== undefined ? [predicate] : [];
    this.hidden = new BooleanOrLogic(this.predicates);
    this.disabledReasons = new ArrayMergeLogic(this.predicates);
    this.readonly = new BooleanOrLogic(this.predicates);
    this.syncErrors = new ArrayMergeLogic<FormError>(this.predicates);
    this.syncTreeErrors = new ArrayMergeLogic<FormTreeError>(this.predicates);
    this.asyncErrors = new ArrayMergeLogic<FormTreeError | 'pending'>(this.predicates);
  }

  get element(): FieldLogicNode {
    return this.getChild(DYNAMIC);
  }

  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T> {
    if (!this.metadata.has(key as MetadataKey<unknown>)) {
      this.metadata.set(key as MetadataKey<unknown>, new MetadataMergeLogic(this.predicates, key));
    }
    return this.metadata.get(key as MetadataKey<unknown>)! as AbstractLogic<T>;
  }

  /**
   * Get or create a child `LogicNode` for the given property.
   */
  getChild(key: PropertyKey): FieldLogicNode {
    if (!this.children.has(key)) {
      this.children.set(key, new FieldLogicNode(this.predicates[0]));
    }
    return this.children.get(key)!;
  }

  mergeIn(other: FieldLogicNode) {
    // Merge standard logic.
    this.hidden.mergeIn(other.hidden);
    this.disabledReasons.mergeIn(other.disabledReasons);
    this.readonly.mergeIn(other.readonly);
    this.syncErrors.mergeIn(other.syncErrors);

    // Merge data
    for (const [key, def] of other.dataFactories) {
      if (this.dataFactories.has(key)) {
        // TODO: name the key in the error message?
        throw new Error(`Duplicate definition`);
      }
      this.dataFactories.set(key, def);
    }

    // Merge metadata.
    for (const key of other.metadata.keys()) {
      this.getMetadata(key).mergeIn(other.getMetadata(key));
    }

    // Merge children.
    for (const [key, otherChild] of other.children) {
      const child = this.getChild(key);
      child.mergeIn(otherChild);
    }
  }

  static newRoot(predicate: Predicate | undefined): FieldLogicNode {
    return new FieldLogicNode(predicate);
  }
}

export abstract class AbstractLogic<TReturn, TValue = TReturn> {
  protected readonly fns: Array<LogicFn<any, TValue>> = [];

  constructor(private predicates: ReadonlyArray<Predicate>) {}

  abstract compute(arg: FieldContext<any>): TReturn;

  abstract get defaultValue(): TValue;

  push(logicFn: LogicFn<any, TValue>) {
    this.fns.push(wrapWithPredicates(this.predicates, logicFn, this.defaultValue));
  }

  mergeIn(other: AbstractLogic<TReturn, TValue>) {
    const fns = this.predicates
      ? other.fns.map((fn) => wrapWithPredicates(this.predicates, fn, this.defaultValue))
      : other.fns;
    this.fns.push(...fns);
  }
}

export class BooleanOrLogic extends AbstractLogic<boolean> {
  override get defaultValue() {
    return false;
  }

  override compute(arg: FieldContext<any>): boolean {
    return this.fns.some((f) => f(arg));
  }
}

export class ArrayMergeLogic<TElement> extends AbstractLogic<
  readonly TElement[],
  TElement | readonly TElement[] | undefined
> {
  override get defaultValue() {
    return undefined;
  }

  override compute(arg: FieldContext<any>): readonly TElement[] {
    return this.fns.reduce((prev, f) => {
      const value = f(arg);

      if (value === undefined) {
        return prev;
      } else if (Array.isArray(value)) {
        return [...prev, ...value];
      } else {
        return [...prev, value];
      }
    }, [] as TElement[]);
  }
}

export class MetadataMergeLogic<T> extends AbstractLogic<T> {
  override get defaultValue() {
    return this.key.defaultValue();
  }

  constructor(
    predicates: ReadonlyArray<Predicate>,
    private key: MetadataKey<T>,
  ) {
    super(predicates);
  }

  override compute(ctx: FieldContext<any>): T {
    if (this.fns.length === 0) {
      return this.key.defaultValue();
    }
    let value = this.fns[0](ctx);
    for (let i = 1; i < this.fns.length; i++) {
      value = this.key.merge(value, this.fns[i](ctx));
    }
    return value;
  }
}

function wrapWithPredicates<TValue, TReturn>(
  predicates: ReadonlyArray<Predicate>,
  logicFn: LogicFn<TValue, TReturn>,
  defaultValue: TReturn,
) {
  if (predicates.length === 0) {
    return logicFn;
  }
  return (arg: FieldContext<any>): TReturn => {
    for (const predicate of predicates) {
      let predicateField = arg.stateOf(predicate.path) as FieldNode;
      const bp = predicate as BoundPredicate; // TODO: require BoundPredicate in the first place.
      const levelDiff = untracked(predicateField.structure.pathKeys).length - bp.depth;
      for (let i = 0; i < levelDiff; i++) {
        predicateField = predicateField.structure.parent!;
      }
      if (!predicate.fn(predicateField.context)) {
        // don't actually run the user function
        return defaultValue;
      }
    }
    return logicFn(arg);
  };
}
