/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression} from '../expression';
import {UpdateNode} from '../node';

export const BindingSlotConsumerAspect = Symbol('BindingSlotConsumerAspect');
export const BindingSlotOffsetAspect = Symbol('BindingSlotOffsetAspect');

/**
 * Indicates that a particular `UpdateNode` (or `Expression`) consumes some number of update binding
 * slots.
 *
 * A component definition (or embedded view definition) must report the number of `vars`, (update
 * binding slots) that it needs to allocate. Additionally, other kinds of transformations might need
 * to know the number of slots consumed to a point within an update block - for example, to compute
 * slot offsets for expressions.
 *
 * `Expression`s will also implement the `BindingSlotUpdateAspect`.
 */
export interface BindingSlotConsumerAspect {
  [BindingSlotConsumerAspect]: true;

  /**
   * Calculate the number of binding slots which must be allocated for this node.
   *
   * Note that this needs to be calculated after any transformations which might affect the number
   * of slots needed have been applied.
   */
  countUpdateBindingsUsed(): number;
}

/**
 * Indicates that a particular `Expression` requires a binding slot offset to be emitted.
 *
 * Some instructions within expressions (such as `pipeBind` instructions) must be emitted with an
 * offset into the binding array where they can store persistent values. This `slotOffset` begins as
 * `null` and is set by a transform before the `Expression` is finalized.
 *
 * Any `Expression` with a slot offset also consumes bindings, and thus must implement the
 * `BindingSlotConsumerAspect` as well,
 */
export interface BindingSlotOffsetAspect extends BindingSlotConsumerAspect {
  [BindingSlotOffsetAspect]: true;

  /**
   * The binding slot index at which this `Expression`'s storage begins, or `null` if it has not yet
   * been set.
   */
  slotOffset: number|null;
}

export function hasBindingSlotAspect(node: Expression): node is Expression&BindingSlotOffsetAspect;
export function hasBindingSlotAspect(node: UpdateNode): node is UpdateNode&
    BindingSlotConsumerAspect;
/**
 * Checks whether a node has the appropriate binding slot aspect for its type.
 *
 * For `UpdateNode`s, this is the `BindingSlotConsumerAspect`. `Expression`s will implement the
 * `BindingSlotUpdateAspect` instead.
 */
export function hasBindingSlotAspect(node: UpdateNode|Expression): boolean {
  if (node instanceof UpdateNode) {
    return (node as any)[BindingSlotConsumerAspect] === true;
  } else {
    return (node as any)[BindingSlotOffsetAspect] === true;
  }
}
