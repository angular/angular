/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OpKind } from './enums';
/**
 * Branded type for a cross-reference ID. During ingest, `XrefId`s are generated to link together
 * different IR operations which need to reference each other.
 */
export type XrefId = number & {
    __brand: 'XrefId';
};
/**
 * Base interface for semantic operations being performed within a template.
 *
 * @param OpT a specific narrower type of `Op` (for example, creation operations) which this
 *     specific subtype of `Op` can be linked with in a linked list.
 */
export interface Op<OpT extends Op<OpT>> {
    /**
     * All operations have a distinct kind.
     */
    kind: OpKind;
    /**
     * The previous operation in the linked list, if any.
     *
     * This is `null` for operation nodes not currently in a list, or for the special head/tail nodes.
     */
    prev: OpT | null;
    /**
     * The next operation in the linked list, if any.
     *
     * This is `null` for operation nodes not currently in a list, or for the special head/tail nodes.
     */
    next: OpT | null;
    /**
     * Debug id of the list to which this node currently belongs, or `null` if this node is not part
     * of a list.
     */
    debugListId: number | null;
}
/**
 * A linked list of `Op` nodes of a given subtype.
 *
 * @param OpT specific subtype of `Op` nodes which this list contains.
 */
export declare class OpList<OpT extends Op<OpT>> {
    static nextListId: number;
    /**
     * Debug ID of this `OpList` instance.
     */
    readonly debugListId: number;
    readonly head: OpT;
    readonly tail: OpT;
    constructor();
    /**
     * Push a new operation to the tail of the list.
     */
    push(op: OpT | Array<OpT>): void;
    /**
     * Prepend one or more nodes to the start of the list.
     */
    prepend(ops: OpT[]): void;
    /**
     * `OpList` is iterable via the iteration protocol.
     *
     * It's safe to mutate the part of the list that has already been returned by the iterator, up to
     * and including the last operation returned. Mutations beyond that point _may_ be safe, but may
     * also corrupt the iteration position and should be avoided.
     */
    [Symbol.iterator](): Generator<OpT>;
    reversed(): Generator<OpT>;
    /**
     * Replace `oldOp` with `newOp` in the list.
     */
    static replace<OpT extends Op<OpT>>(oldOp: OpT, newOp: OpT): void;
    /**
     * Replace `oldOp` with some number of new operations in the list (which may include `oldOp`).
     */
    static replaceWithMany<OpT extends Op<OpT>>(oldOp: OpT, newOps: OpT[]): void;
    /**
     * Remove the given node from the list which contains it.
     */
    static remove<OpT extends Op<OpT>>(op: OpT): void;
    /**
     * Insert `op` before `target`.
     */
    static insertBefore<OpT extends Op<OpT>>(op: OpT | OpT[], target: OpT): void;
    /**
     * Insert `op` after `target`.
     */
    static insertAfter<OpT extends Op<OpT>>(op: OpT, target: OpT): void;
    /**
     * Asserts that `op` does not currently belong to a list.
     */
    static assertIsUnowned<OpT extends Op<OpT>>(op: OpT): void;
    /**
     * Asserts that `op` currently belongs to a list. If `byList` is passed, `op` is asserted to
     * specifically belong to that list.
     */
    static assertIsOwned<OpT extends Op<OpT>>(op: OpT, byList?: number): void;
    /**
     * Asserts that `op` is not a special `ListEnd` node.
     */
    static assertIsNotEnd<OpT extends Op<OpT>>(op: OpT): void;
}
