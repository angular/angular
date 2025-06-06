/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WritableSignal} from '@angular/core';
import {Field, FieldContext, FieldPath, FieldState} from '../api/types';
import {DYNAMIC} from '../logic_node';
import {FieldPathNode, FieldRootPathNode} from '../path_node';
import {FieldNode} from './node';

/**
 * `FieldContext` implementation, backed by a `FieldNode`.
 */
export class FieldNodeContext implements FieldContext<unknown> {
  constructor(private readonly node: FieldNode) {}

  private readonly cache = new WeakMap<FieldPath<unknown>, Field<unknown>>();
  private resolve<U>(target: FieldPath<U>): Field<U> {
    if (this.cache.has(target)) {
      return this.cache.get(target) as Field<U>;
    }
    const currentPathKeys = this.node.structure.pathKeys();
    const targetPathNode = FieldPathNode.unwrapFieldPath(target);

    if (!(this.node.structure.root.structure.logicPath instanceof FieldRootPathNode)) {
      throw Error('Expected root of FieldNode tree to have a FieldRootPathNode.');
    }
    const prefix = this.node.structure.root.structure.logicPath.subroots.get(targetPathNode.root);
    if (!prefix) {
      throw Error('Path is not part of this field tree.');
    }

    const targetPathKeys = [...prefix, ...targetPathNode.keys];

    // Navigate from `currentPath` to `targetPath`. As an example, suppose that:
    // currentPath = [A, B, C, D]
    // targetPath = [A, B, X, Y, Z]

    // Firstly, find the length of the shared prefix between the two paths. In our example, this
    // is the prefix [A, B], so we would expect a `sharedPrefixLength` of 2.
    const sharedPrefixLength = lengthOfSharedPrefix(currentPathKeys, targetPathNode.keys);

    // Walk up the graph until we arrive at the common ancestor, which could be the root node if
    // there is no shared prefix. In our example, this will require 2 up steps, navigating from
    // D to B.
    let requiredUpSteps = currentPathKeys.length - sharedPrefixLength;
    let field: FieldNode = this.node;
    while (requiredUpSteps-- > 0) {
      field = field.structure.parent!;
    }

    // Now, we can navigate from the closest ancestor to the target, e.g. from B through X, Y,
    // and then to Z.
    for (let idx = sharedPrefixLength; idx < targetPathKeys.length; idx++) {
      const property = targetPathKeys[idx] === DYNAMIC ? currentPathKeys[idx] : targetPathKeys[idx];
      field = field.structure.getChild(property)!;
    }

    this.cache.set(target, field.fieldProxy);
    return field.fieldProxy as Field<U>;
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

function lengthOfSharedPrefix(
  currentPath: readonly PropertyKey[],
  targetPath: readonly PropertyKey[],
): number {
  const minLength = Math.min(targetPath.length, currentPath.length);
  let sharedPrefixLength = 0;
  while (
    sharedPrefixLength < minLength &&
    targetPath[sharedPrefixLength] === currentPath[sharedPrefixLength]
  ) {
    sharedPrefixLength++;
  }
  return sharedPrefixLength;
}
