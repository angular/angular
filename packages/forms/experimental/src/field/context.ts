/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, Signal, WritableSignal} from '@angular/core';
import {Field, FieldContext, FieldPath, FieldState} from '../api/types';
import {FieldPathNode} from '../path_node';
import {FieldNode} from './node';

/**
 * `FieldContext` implementation, backed by a `FieldNode`.
 */
export class FieldNodeContext implements FieldContext<unknown> {
  private readonly cache = new WeakMap<FieldPath<unknown>, Signal<Field<unknown>>>();

  constructor(private readonly node: FieldNode) {}

  private resolve<U>(target: FieldPath<U>): Field<U> {
    if (!this.cache.has(target)) {
      const resolver = computed<Field<unknown>>(() => {
        const targetPathNode = FieldPathNode.unwrapFieldPath(target);

        // First, find the field where the root our target path was merged in.
        // We determine this by walking up the field tree from the current field and looking for
        // the place where the LogicNodeBuilder from the target path's root was merged in.
        let field: FieldNode | undefined = this.node;
        while (field && !field.structure.logic.hasLogic(targetPathNode.root.logic)) {
          field = field.structure.parent;
          if (field === undefined) {
            throw new Error('Path is not part of this field tree.');
          }
        }

        // Now, we can navigate to the target field using the relative path in the target path node
        // to traverse down from the field we just found.
        for (let key of targetPathNode.keys) {
          field = field.structure.getChild(key);
          if (field === undefined) {
            throw new Error(`Resolved field does not exist.`);
          }
        }

        return field.fieldProxy;
      });

      this.cache.set(target, resolver);
    }
    return this.cache.get(target)!() as Field<U>;
  }

  get field(): Field<unknown> {
    return this.node.fieldProxy;
  }

  get state(): FieldState<unknown> {
    return this.node;
  }

  get value(): WritableSignal<unknown> {
    return this.node.structure.value;
  }

  readonly fieldOf = <P>(p: FieldPath<P>) => this.resolve(p);
  readonly stateOf = <P>(p: FieldPath<P>) => this.resolve(p)();
  readonly valueOf = <P>(p: FieldPath<P>) => this.resolve(p)().value();
}
