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

let boundPathDepth = 0;

/**
 * Sets the bound path depth for the duration of the given logic function.
 * This is used to ensure that the field resolution algorithm walks far enough up the field tree to
 * reach the point where the root of the path we're bound to is applied. This normally isn't a big
 * concern, but matters when we're dealing with recursive structures.
 *
 * Consider this example:
 *
 * ```
 * const s = schema(p => {
 *   disabled(p.next, ({valueOf}) => valueOf(p.data));
 *   apply(p.next, s);
 * });
 * ```
 *
 * Here we need to know that the `disabled` logic was bound to a path of depth 1. Otherwise we'd
 * attempt to resolve `p.data` in the context of the field corresponding to `p.next`.
 * The resolution algorithm would start with the field for `p.next` and see that it *does* contain
 * the logic for `s` (due to the fact that its recursively applied.) It would then decide not to
 * walk up the field tree at all, and to immediately start walking down the keys for the target path
 * `p.data`, leading it to grab the field corresponding to `p.next.data`.
 *
 * We avoid the problem described above by keeping track of the depth (relative to Schema root) of
 * the path we were bound to. We then require the resolution algorithm to walk at least that far up
 * the tree before finding a node that contains the logic for `s`.
 *
 * @param fn
 * @param depth
 * @returns
 */
// TODO: Is there a way we can do this without needing to wrap each logic function?
export function setBoundPathDepthForResolution<A extends any[], R>(
  fn: (...args: A) => R,
  depth: number,
): (...args: A) => R {
  return (...args: A) => {
    try {
      boundPathDepth = depth;
      return fn(...args);
    } finally {
      boundPathDepth = 0;
    }
  };
}

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
        // We always make sure to walk up at least as far as the depth of the path we were bound to.
        // This ensures that we do not accidentally match on the wrong application of a recursively
        // applied schema.
        let field: FieldNode | undefined = this.node;
        let stepsRemaining = boundPathDepth;
        while (stepsRemaining > 0 || !field.structure.logic.hasLogic(targetPathNode.root.logic)) {
          stepsRemaining--;
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
