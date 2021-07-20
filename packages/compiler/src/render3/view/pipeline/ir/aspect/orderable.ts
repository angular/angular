/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Id, UpdateNode} from '../node';

export const OrderableAspect = Symbol('OrderableAspect');

/**
 * Indicates that an `UpdateNode` requires a specific ordering relative to other `UpdateNode`s for a
 * given creation entity.
 *
 * For example, all of the styling instructions which affect the styles of a particular element must
 * be ordered in a specific way for correctness. The styling `UpdateNode`s implement
 * `OrderableAspect` to define this ordering.
 */
export interface OrderableAspect {
  [OrderableAspect]: true;

  /**
   * The `Id` of the `CreateNode` which this `UpdateNode` is affecting.
   *
   * Reordering according to priority will happen to all adjacent `OrderableAspect` `UpdateNode`s
   * that affect this same `Id`.
   */
  readonly id: Id;

  /**
   * The relative priority applied to this particular `UpdateNode`.
   *
   * After ordering is applied, the `UpdateNode`s will be sorted from least to greatest `priority`
   * values.
   */
  readonly priority: number;
}

/**
 * Whether the given `UpdateNode` will participate in sorting.
 */
export function hasOrderableAspect(node: UpdateNode): node is UpdateNode&OrderableAspect {
  return (node as any)[OrderableAspect] === true;
}
