/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MetadataKey} from './api/metadata';
import {type FieldContext, type FormError, type LogicFn} from './api/types';
import {FieldPathNode} from './path_node';

/**
 * Special key which is used to represent a dynamic index in a `FieldLogicNode` path.
 */
export const INDEX = Symbol('INDEX');

/**
 * Logic associated with a particular location (path) in a form.
 *
 * This can be logic associated with a specific field, or with all fields within in array or other
 * dynamic structure.
 */
export class FieldLogicNode {
  readonly hidden = new BooleanOrLogic();
  readonly disabled = new BooleanOrLogic();
  readonly errors = new ArrayMergeLogic<FormError>();
  readonly rootPaths = new Map<FieldPathNode, PropertyKey[]>();

  private readonly metadata = new Map<MetadataKey<unknown>, AbstractLogic<unknown>>();
  private readonly children = new Map<PropertyKey, FieldLogicNode>();

  private constructor(readonly pathKeys: PropertyKey[]) {}

  get element(): FieldLogicNode {
    return this.getChild(INDEX);
  }

  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T> {
    if (!this.metadata.has(key as MetadataKey<unknown>)) {
      this.metadata.set(key as MetadataKey<unknown>, new MetadataMergeLogic(key));
    }
    return this.metadata.get(key as MetadataKey<unknown>)! as AbstractLogic<T>;
  }

  readMetadata<T>(key: MetadataKey<T>, arg: FieldContext<any>): T {
    if (this.metadata.has(key as MetadataKey<unknown>)) {
      return this.metadata.get(key as MetadataKey<unknown>)!.compute(arg) as T;
    } else {
      return key.defaultValue;
    }
  }

  /**
   * Get or create a child `LogicNode` for the given property.
   */
  getChild(key: PropertyKey): FieldLogicNode {
    if (!this.children.has(key)) {
      this.children.set(key, new FieldLogicNode([...this.pathKeys, key]));
    }
    return this.children.get(key)!;
  }

  mergeIn(other: FieldLogicNode) {
    // Merge standard logic.
    this.hidden.mergeIn(other.hidden);
    this.disabled.mergeIn(other.disabled);
    this.errors.mergeIn(other.errors);

    // Merge metadata.
    for (const [key, otherMetadata] of other.metadata) {
      if (!this.metadata.has(key)) {
        this.metadata.set(key, otherMetadata);
      } else {
        this.metadata.get(key)!.mergeIn(otherMetadata);
      }
    }

    // Merge children.
    for (const [key, otherChild] of other.children) {
      const child = this.getChild(key);
      child.mergeIn(otherChild);
    }

    // Merging roots handled separately (see structure.ts, propagateRoots).
    // TODO: clean this up.
  }

  static newRoot(path: FieldPathNode): FieldLogicNode {
    const root = new FieldLogicNode([]);
    root.rootPaths.set(path, []);
    return root;
  }
}

export abstract class AbstractLogic<TReturn, TValue = TReturn> {
  protected readonly fns: Array<LogicFn<any, TValue>> = [];

  abstract compute(arg: FieldContext<any>): TReturn;

  push(logicFn: LogicFn<any, TValue>) {
    this.fns.push(logicFn);
  }

  mergeIn(other: AbstractLogic<TReturn, TValue>) {
    this.fns.push(...other.fns);
  }
}

class BooleanOrLogic extends AbstractLogic<boolean> {
  get defaultValue(): boolean {
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
  get defaultValue(): T {
    return this.key.defaultValue;
  }

  constructor(private key: MetadataKey<T>) {
    super();
  }

  override compute(arg: FieldContext<any>): T {
    return this.fns.reduce((prev, fn) => this.key.merge(prev, fn(arg)), this.key.defaultValue);
  }
}
