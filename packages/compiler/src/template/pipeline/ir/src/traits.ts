/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {ParseSourceSpan} from '../../../../parse_util';
import type {Expression} from './expression';
import type {SlotHandle} from './handle';
import type {Op, XrefId} from './operations';

/**
 * Marks an operation as requiring allocation of one or more data slots for storage.
 */
export interface ConsumesSlotOpTrait {
  consumesSlot: true;

  /**
   * Assigned data slot (the starting index, if more than one slot is needed) for this operation, or
   * `null` if slots have not yet been assigned.
   */
  handle: SlotHandle;

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
 * Marks an operation as depending on the runtime's implicit slot context being set to a particular
 * slot.
 *
 * The runtime has an implicit slot context which is adjusted using the `advance()` instruction
 * during the execution of template update functions. This trait marks an operation as requiring
 * this implicit context to be `advance()`'d to point at a particular slot prior to execution.
 */
export interface DependsOnSlotContextOpTrait {
  dependsOnSlotContext: true;

  /**
   * `XrefId` of the `ConsumesSlotOpTrait` which the implicit slot context must reference before
   * this operation can be executed.
   */
  target: XrefId;

  sourceSpan: ParseSourceSpan;
}

/**
 * Marker trait indicating that an operation or expression consumes variable storage space.
 */
export interface ConsumesVarsTrait {
  consumesVars: true;
}

/**
 * Marker trait indicating that an expression requires knowledge of the number of variable storage
 * slots used prior to it.
 */
export interface UsesVarOffsetTrait {
  usesVarOffset: true;

  varOffset: number|null;
}

/**
 * An op that has a corresponding `end` op, and can be collapsed into a single op. For example,
 * ElementStart and ElementEnd can be collapsed into Element.
 */
export interface CollapsableStartTrait<OpT extends Op<OpT>> {
  collapsableStart: true;

  /**
   * The xref associated with this op.
   */
  xref: XrefId;

  collapse(): Op<OpT>;
}

export interface CollapsableEndTrait<OpT extends Op<OpT>> {
  collapsableEnd: true;

  /**
   * The xref of the corresponding start op.
   */
  xref: XrefId;
}

/**
 * Test whether an operation implements `ConsumesSlotOpTrait`.
 */
export function hasConsumesSlotTrait<OpT extends Op<OpT>>(op: OpT): op is OpT&ConsumesSlotOpTrait {
  return 'consumesSlot' in op;
}

/**
 * Test whether an operation implements `DependsOnSlotContextOpTrait`.
 */
export function hasDependsOnSlotContextTrait<OpT extends Op<OpT>>(op: OpT): op is OpT&
    DependsOnSlotContextOpTrait {
  return 'dependsOnSlotContext' in op;
}

/**
 * Test whether an operation implements `ConsumesVarsTrait`.
 */
export function hasConsumesVarsTrait<ExprT extends Expression>(expr: ExprT): expr is ExprT&
    ConsumesVarsTrait;
export function hasConsumesVarsTrait<OpT extends Op<OpT>>(op: OpT): op is OpT&ConsumesVarsTrait;
export function hasConsumesVarsTrait(value: any): boolean {
  return 'consumesVars' in value;
}

/**
 * Test whether an expression implements `UsesVarOffsetTrait`.
 */
export function hasUsesVarOffsetTrait<ExprT extends Expression>(expr: ExprT): expr is ExprT&
    UsesVarOffsetTrait {
  return 'usesVarOffset' in expr;
}

/**
 * Test whether an expression implements `CollapsableStartTrait`.
 */
export function hasCollapsableStartTrait<OpT extends Op<OpT>>(op: OpT): op is OpT&
    CollapsableStartTrait<OpT> {
  return 'collapsableStart' in op;
}

/**
 * Test whether an expression implements `CollapsableEndTrait`.
 */
export function hasCollapsableEndTrait<OpT extends Op<OpT>>(op: OpT): op is OpT&
    CollapsableEndTrait<OpT> {
  return 'collapsableEnd' in op;
}
