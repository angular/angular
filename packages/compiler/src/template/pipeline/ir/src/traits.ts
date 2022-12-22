/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {Op, XrefId} from './operations';
import type {Expression} from './expression';

/**
 * Marker symbol for `ConsumesSlotOpTrait`.
 */
export const ConsumesSlot = Symbol('ConsumesSlot');

/**
 * Marker symbol for `UsesSlotIndex` trait.
 */
export const UsesSlotIndex = Symbol('UsesSlotIndex');

/**
 * Marker symbol for `ConsumesVars` trait.
 */
export const ConsumesVarsTrait = Symbol('UsesVars');

/**
 * Marks an operation as requiring allocation of one or more data slots for storage.
 */
export interface ConsumesSlotOpTrait {
  readonly[ConsumesSlot]: true;

  /**
   * Assigned data slot (the starting index, if more than one slot is needed) for this operation, or
   * `null` if slots have not yet been assigned.
   */
  slot: number|null;

  /**
   * The number of slots which will be used by this operation. By default 1, but can be increased if
   * necessary.
   */
  numSlotsUsed: number;

  /**
   * `XrefId` of this operation (e.g. the element stored in the assigned slot). This `XrefId` is
   * used to link this `ConsumesSlotOpTrait` operation with `DependsOnSlotContextTrait` or
   * `UsesSlotIndexExprTrait` implementors and ensure that the assigned slot is propagated through
   * the IR to all consumers.
   */
  xref: XrefId;
}

/**
 * Marks an expression which requires knowledge of the assigned slot of a given
 * `ConsumesSlotOpTrait` implementor (e.g. an element slot).
 *
 * During IR processing, assigned slots of `ConsumesSlotOpTrait` implementors will be propagated to
 * `UsesSlotIndexTrait` implementors by matching their `XrefId`s.
 */
export interface UsesSlotIndexExprTrait {
  readonly[UsesSlotIndex]: true;

  /**
   * `XrefId` of the `ConsumesSlotOpTrait` which this expression needs to reference by its assigned
   * slot index.
   */
  target: XrefId;

  /**
   * The slot index of `target`, or `null` if slots have not yet been assigned.
   */
  slot: number|null;
}

/**
 * Marker trait indicating that an operation or expression consumes variable storage space.
 */
export interface ConsumesVarsTrait {
  [ConsumesVarsTrait]: true;
}

/**
 * Default values for most `ConsumesSlotOpTrait` fields (used with the spread operator to initialize
 * implementors of the trait).
 */
export const TRAIT_CONSUMES_SLOT: Omit<ConsumesSlotOpTrait, 'xref'> = {
  [ConsumesSlot]: true,
  slot: null,
  numSlotsUsed: 1,
} as const;

/**
 * Default values for `UsesVars` fields (used with the spread operator to initialize
 * implementors of the trait).
 */
export const TRAIT_CONSUMES_VARS: ConsumesVarsTrait = {
  [ConsumesVarsTrait]: true,
} as const;

/**
 * Test whether an operation implements `ConsumesSlotOpTrait`.
 */
export function hasConsumesSlotTrait<OpT extends Op<OpT>>(op: OpT): op is OpT&ConsumesSlotOpTrait {
  return (op as Partial<ConsumesSlotOpTrait>)[ConsumesSlot] === true;
}

/**
 * Test whether an operation implements `ConsumesVarsTrait`.
 */
export function hasConsumesVarsTrait<ExprT extends Expression>(expr: ExprT): expr is ExprT&
    ConsumesVarsTrait;
export function hasConsumesVarsTrait<OpT extends Op<OpT>>(op: OpT): op is OpT&ConsumesVarsTrait;
export function hasConsumesVarsTrait(value: any): boolean {
  return (value as Partial<ConsumesVarsTrait>)[ConsumesVarsTrait] === true;
}

/**
 * Test whether an expression implements `UsesSlotIndexExprTrait`.
 */
export function hasUsesSlotIndexTrait<ExprT extends Expression>(expr: ExprT): expr is ExprT&
    UsesSlotIndexExprTrait {
  return (expr as Partial<UsesSlotIndexExprTrait>)[UsesSlotIndex] === true;
}
