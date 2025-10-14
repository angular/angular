/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { IcuCreateOpCode, TIcu } from '../interfaces/i18n';
import { TNode } from '../interfaces/node';
import { LView, TView } from '../interfaces/view';
/**
 * Retrieve `TIcu` at a given `index`.
 *
 * The `TIcu` can be stored either directly (if it is nested ICU) OR
 * it is stored inside tho `TIcuContainer` if it is top level ICU.
 *
 * The reason for this is that the top level ICU need a `TNode` so that they are part of the render
 * tree, but nested ICU's have no TNode, because we don't know ahead of time if the nested ICU is
 * expressed (parent ICU may have selected a case which does not contain it.)
 *
 * @param tView Current `TView`.
 * @param index Index where the value should be read from.
 */
export declare function getTIcu(tView: TView, index: number): TIcu | null;
/**
 * Store `TIcu` at a give `index`.
 *
 * The `TIcu` can be stored either directly (if it is nested ICU) OR
 * it is stored inside tho `TIcuContainer` if it is top level ICU.
 *
 * The reason for this is that the top level ICU need a `TNode` so that they are part of the render
 * tree, but nested ICU's have no TNode, because we don't know ahead of time if the nested ICU is
 * expressed (parent ICU may have selected a case which does not contain it.)
 *
 * @param tView Current `TView`.
 * @param index Index where the value should be stored at in `Tview.data`
 * @param tIcu The TIcu to store.
 */
export declare function setTIcu(tView: TView, index: number, tIcu: TIcu): void;
/**
 * Set `TNode.insertBeforeIndex` taking the `Array` into account.
 *
 * See `TNode.insertBeforeIndex`
 */
export declare function setTNodeInsertBeforeIndex(tNode: TNode, index: number): void;
/**
 * Create `TNode.type=TNodeType.Placeholder` node.
 *
 * See `TNodeType.Placeholder` for more information.
 */
export declare function createTNodePlaceholder(tView: TView, previousTNodes: TNode[], index: number): TNode;
/**
 * Returns current ICU case.
 *
 * ICU cases are stored as index into the `TIcu.cases`.
 * At times it is necessary to communicate that the ICU case just switched and that next ICU update
 * should update all bindings regardless of the mask. In such a case the we store negative numbers
 * for cases which have just been switched. This function removes the negative flag.
 */
export declare function getCurrentICUCaseIndex(tIcu: TIcu, lView: LView): number | null;
export declare function getParentFromIcuCreateOpCode(mergedCode: number): number;
export declare function getRefFromIcuCreateOpCode(mergedCode: number): number;
export declare function getInstructionFromIcuCreateOpCode(mergedCode: number): number;
export declare function icuCreateOpCode(opCode: IcuCreateOpCode, parentIdx: number, refIdx: number): number;
export declare function isRootTemplateMessage(subTemplateIndex: number): subTemplateIndex is -1;
