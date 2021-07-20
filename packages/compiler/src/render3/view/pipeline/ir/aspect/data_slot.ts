/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression} from '../expression';
import {CreateNode, Id, UpdateNode} from '../node';

/**
 * A slot index into the runtime data structure which stores created entities (element nodes, text
 * nodes, embedded view definitions, etc).
 *
 * Sometimes referred to as a "creation slot" or "element id".
 */
export type DataSlot = number&{__brand: 'DataSlot'};

export const CreateSlotAspect = Symbol('CreateSlotAspect');
export const UpdateSlotAspect = Symbol('UpdateSlotAspect');

/**
 * Indicates that a `CreateNode` will consume at least one `DataSlot`.
 *
 * A `CreateNode` may consume more than one `DataSlot`. For example, the `element` creation
 * instruction consumes one slot for the element itself, and an additional slot for each local
 * reference (#ref) declared on it.
 */
export interface CreateSlotAspect {
  [CreateSlotAspect]: true;

  /**
   * The `Id` of the `CreateNode` in question.
   *
   * Any `CreateNode` which allocates a `DataSlot` must have an `Id`.
   */
  readonly id: Id;

  /**
   * The `DataSlot` allocated to this `CreateNode`, or `null` if one has not yet been allocated.
   */
  slot: DataSlot|null;

  /**
   * Assign any extra slots required for this `CreateNode` (for example, local refs on an element
   * declaration), using the `allocate` callback which allocates one additional slot. `allocate` can
   * be called as many times as is needed.
   */
  allocateExtraSlots(allocate: () => DataSlot): void;
}

/**
 * An `UpdateNode` or `Expression` that refers to an entity (such as an element or embedded view
 * declaration) by its `DataSlot`.
 *
 * For example, update instructions that interpolate text into a DOM text node refer to the target
 * text node from the creation block via its `DataSlot` index.
 *
 * This association works based on the internal `Id`. At first, the node with `UpdateSlotAspect`
 * will have a `null` `slot`, but will have an `id` that matches that of the referenced
 * `CreateNode`. After slots are allocated to `CreateNode`s, another transform uses the mapping of
 * `Id` to `DataSlot` to populate the `slot` of all `UpdateSlotAspect` nodes in the template.
 */
export interface UpdateSlotAspect {
  [UpdateSlotAspect]: true;

  readonly id: Id;
  slot: DataSlot|null;
}

export function hasSlotAspect(node: CreateNode): node is CreateNode&CreateSlotAspect;
export function hasSlotAspect(node: UpdateNode): node is UpdateNode&UpdateSlotAspect;
export function hasSlotAspect(node: Expression): node is Expression&UpdateSlotAspect;
/**
 * Checks whether a node has the appropriate `DataSlot` aspect for its type.
 *
 * For `CreateNode`s, this is the `CreateSlotAspect`. `UpdateNode`s and `Expression`s that refer to
 * creation block entities by their `DataSlot` will have the `UpdateSlotAspect`.
 */
export function hasSlotAspect(node: CreateNode|UpdateNode|Expression): boolean {
  if (node instanceof CreateNode) {
    return (node as any)[CreateSlotAspect] === true;
  } else {
    return (node as any)[UpdateSlotAspect] === true;
  }
}
