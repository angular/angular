/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal, untracked, WritableSignal} from '@angular/core';
import {BothFieldPath, Field, FieldContext, FieldPath, FieldState} from '../api/types';
import {FieldPathNode} from '../schema/path_node';
import {isArray} from '../util/type_guards';
import type {FieldNode} from './node';
import {getBoundPathDepth} from './resolution';
import { UnwrapControl } from './compat/compat_types';

/**
 * `FieldContext` implementation, backed by a `FieldNode`.
 */
export class FieldNodeContext implements FieldContext<unknown> {
  /**
   * Cache of paths that have been resolved for this context.
   *
   * For each resolved path we keep track of a signal of field that it maps to rather than a static
   * field, since it theoretically could change. In practice for the current system it should not
   * actually change, as they only place we currently track fields moving within the parent
   * structure is for arrays, and paths do not currently support array indexing.
   */
  private readonly cache = new WeakMap<FieldPath<unknown>, Signal<Field<unknown>>>();

  constructor(
    /** The field node this context corresponds to. */
    private readonly node: FieldNode,
  ) {}

  /**
   * Resolves a target path relative to this context.
   * @param target The path to resolve
   * @returns The field corresponding to the target path.
   */
  private resolve<U>(target: BothFieldPath<U>): Field<U> {
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
        let stepsRemaining = getBoundPathDepth();
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
            throw new Error(
              `Cannot resolve path .${targetPathNode.keys.join('.')} relative to field ${[
                '<root>',
                ...this.node.structure.pathKeys(),
              ].join('.')}.`,
            );
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

  get key(): Signal<string> {
    return this.node.structure.keyInParent;
  }

  readonly index = computed(() => {
    // Attempt to read the key first, this will throw an error if we're on a root field.
    const key = this.key();
    // Assert that the parent is actually an array.
    if (!isArray(untracked(this.node.structure.parent!.value))) {
      throw new Error(`RuntimeError: cannot access index, parent field is not an array`);
    }
    // Return the key as a number if we are indeed inside an array field.
    return Number(key);
  });

  readonly fieldOf = <P>(p: BothFieldPath<P>) => this.resolve(p);
  readonly stateOf = <P>(p: BothFieldPath<P>) => this.resolve(p)();
  readonly valueOf = <P>(p: BothFieldPath<P>) => this.resolve(p)().value() as UnwrapControl<P>;
}
