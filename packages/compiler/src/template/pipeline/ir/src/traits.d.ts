/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ParseSourceSpan } from '../../../../parse_util';
import type { Expression } from './expression';
import * as o from '../../../../output/output_ast';
import type { Op, XrefId } from './operations';
import { SlotHandle } from './handle';
/**
 * Marker symbol for `ConsumesSlotOpTrait`.
 */
export declare const ConsumesSlot: unique symbol;
/**
 * Marker symbol for `DependsOnSlotContextOpTrait`.
 */
export declare const DependsOnSlotContext: unique symbol;
/**
 * Marker symbol for `ConsumesVars` trait.
 */
export declare const ConsumesVarsTrait: unique symbol;
/**
 * Marker symbol for `UsesVarOffset` trait.
 */
export declare const UsesVarOffset: unique symbol;
/**
 * Marks an operation as requiring allocation of one or more data slots for storage.
 */
export interface ConsumesSlotOpTrait {
    readonly [ConsumesSlot]: true;
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
    readonly [DependsOnSlotContext]: true;
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
    [ConsumesVarsTrait]: true;
}
/**
 * Marker trait indicating that an expression requires knowledge of the number of variable storage
 * slots used prior to it.
 */
export interface UsesVarOffsetTrait {
    [UsesVarOffset]: true;
    varOffset: number | null;
}
/**
 * Default values for most `ConsumesSlotOpTrait` fields (used with the spread operator to initialize
 * implementors of the trait).
 */
export declare const TRAIT_CONSUMES_SLOT: Omit<ConsumesSlotOpTrait, 'xref' | 'handle'>;
/**
 * Default values for most `DependsOnSlotContextOpTrait` fields (used with the spread operator to
 * initialize implementors of the trait).
 */
export declare const TRAIT_DEPENDS_ON_SLOT_CONTEXT: Omit<DependsOnSlotContextOpTrait, 'target' | 'sourceSpan'>;
/**
 * Default values for `UsesVars` fields (used with the spread operator to initialize
 * implementors of the trait).
 */
export declare const TRAIT_CONSUMES_VARS: ConsumesVarsTrait;
/**
 * Test whether an operation implements `ConsumesSlotOpTrait`.
 */
export declare function hasConsumesSlotTrait<OpT extends Op<OpT>>(op: OpT): op is OpT & ConsumesSlotOpTrait;
/**
 * Test whether an operation implements `DependsOnSlotContextOpTrait`.
 */
export declare function hasDependsOnSlotContextTrait<ExprT extends o.Expression>(expr: ExprT): expr is ExprT & DependsOnSlotContextOpTrait;
export declare function hasDependsOnSlotContextTrait<OpT extends Op<OpT>>(op: OpT): op is OpT & DependsOnSlotContextOpTrait;
/**
 * Test whether an operation implements `ConsumesVarsTrait`.
 */
export declare function hasConsumesVarsTrait<ExprT extends Expression>(expr: ExprT): expr is ExprT & ConsumesVarsTrait;
export declare function hasConsumesVarsTrait<OpT extends Op<OpT>>(op: OpT): op is OpT & ConsumesVarsTrait;
/**
 * Test whether an expression implements `UsesVarOffsetTrait`.
 */
export declare function hasUsesVarOffsetTrait<ExprT extends Expression>(expr: ExprT): expr is ExprT & UsesVarOffsetTrait;
