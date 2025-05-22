/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DataKey} from './api/data';
import {MetadataKey} from './api/metadata';
import {
  FormTreeError,
  type FieldContext,
  type FieldPath,
  type FormError,
  type LogicFn,
} from './api/types';
import {FieldNode} from './field_node';

/**
 * Special key which is used to represent a dynamic index in a `FieldLogicNode` path.
 */
export const DYNAMIC: unique symbol = Symbol('DYNAMIC');

export interface Predicate {
  readonly fn: LogicFn<any, boolean>;
  readonly path: FieldPath<any>;
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
  readonly disabled: BooleanOrLogic;
  readonly readonly: BooleanOrLogic;
  readonly syncErrors: ArrayMergeLogic<FormError>;
  readonly syncTreeErrors: ArrayMergeLogic<FormTreeError>;
  readonly asyncErrors: ArrayMergeLogic<FormTreeError | 'pending'>;

  private readonly metadata = new Map<MetadataKey<unknown>, AbstractLogic<unknown>>();

  readonly dataFactories = new Map<DataKey<unknown>, (ctx: FieldContext<unknown>) => unknown>();
  private readonly children = new Map<PropertyKey, FieldLogicNode>();

  private constructor(private predicate: Predicate | undefined) {
    this.hidden = new BooleanOrLogic(predicate);
    this.disabled = new BooleanOrLogic(predicate);
    this.readonly = new BooleanOrLogic(predicate);
    this.syncErrors = new ArrayMergeLogic<FormError>(predicate);
    this.syncTreeErrors = new ArrayMergeLogic<FormTreeError>(predicate);
    this.asyncErrors = new ArrayMergeLogic<FormTreeError | 'pending'>(predicate);
  }

  get element(): FieldLogicNode {
    return this.getChild(DYNAMIC);
  }

  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T> {
    if (!this.metadata.has(key as MetadataKey<unknown>)) {
      this.metadata.set(key as MetadataKey<unknown>, new MetadataMergeLogic(this.predicate, key));
    }
    return this.metadata.get(key as MetadataKey<unknown>)! as AbstractLogic<T>;
  }

  /**
   * Get or create a child `LogicNode` for the given property.
   */
  getChild(key: PropertyKey): FieldLogicNode {
    if (!this.children.has(key)) {
      this.children.set(key, new FieldLogicNode(this.predicate));
    }
    return this.children.get(key)!;
  }

  mergeIn(other: FieldLogicNode) {
    // Merge standard logic.
    this.hidden.mergeIn(other.hidden);
    this.disabled.mergeIn(other.disabled);
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

  constructor(private predicate: Predicate | undefined) {}

  abstract compute(arg: FieldContext<any>): TReturn;

  abstract get defaultValue(): TValue;

  push(logicFn: LogicFn<any, TValue>) {
    this.fns.push(wrapWithPredicate(this.predicate, logicFn, this.defaultValue));
  }

  mergeIn(other: AbstractLogic<TReturn, TValue>) {
    const fns = this.predicate
      ? other.fns.map((fn) => wrapWithPredicate(this.predicate, fn, this.defaultValue))
      : other.fns;
    this.fns.push(...fns);
  }
}

class BooleanOrLogic extends AbstractLogic<boolean> {
  override get defaultValue() {
    return false;
  }

  override compute(arg: FieldContext<any>): boolean {
    return this.fns.some((f) => f(arg));
  }
}

class ArrayMergeLogic<TElement> extends AbstractLogic<
  TElement[],
  TElement | TElement[] | undefined
> {
  override get defaultValue() {
    return undefined;
  }

  override compute(arg: FieldContext<any>): TElement[] {
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

class MetadataMergeLogic<T> extends AbstractLogic<T> {
  override get defaultValue() {
    return this.key.defaultValue();
  }

  constructor(
    predicate: Predicate | undefined,
    private key: MetadataKey<T>,
  ) {
    super(predicate);
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

function wrapWithPredicate<TValue, TReturn>(
  predicate: Predicate | undefined,
  logicFn: LogicFn<TValue, TReturn>,
  defaultValue: TReturn,
) {
  if (predicate === undefined) {
    return logicFn;
  }
  return (arg: FieldContext<any>): TReturn => {
    const predicateField = arg.stateOf(predicate.path) as FieldNode;
    if (!predicate.fn(predicateField.fieldContext)) {
      // don't actually run the user function
      return defaultValue;
    }
    return logicFn(arg);
  };
}
