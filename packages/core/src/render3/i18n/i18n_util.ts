/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertGreaterThan, assertGreaterThanOrEqual, throwError} from '../../util/assert';
import {assertTIcu, assertTNode} from '../assert';
import {createTNodeAtIndex} from '../instructions/shared';
import {IcuCreateOpCode, TIcu} from '../interfaces/i18n';
import {TIcuContainerNode, TNode, TNodeType} from '../interfaces/node';
import {LView, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {setI18nHandling} from '../node_manipulation';
import {getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore} from '../node_manipulation_i18n';

import {addTNodeAndUpdateInsertBeforeIndex} from './i18n_insert_before_index';


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
export function getTIcu(tView: TView, index: number): TIcu|null {
  const value = tView.data[index] as null | TIcu | TIcuContainerNode | string;
  if (value === null || typeof value === 'string') return null;
  if (ngDevMode &&
      !(value.hasOwnProperty('tView') || value.hasOwnProperty('currentCaseLViewIndex'))) {
    throwError('We expect to get \'null\'|\'TIcu\'|\'TIcuContainer\', but got: ' + value);
  }
  // Here the `value.hasOwnProperty('currentCaseLViewIndex')` is a polymorphic read as it can be
  // either TIcu or TIcuContainerNode. This is not ideal, but we still think it is OK because it
  // will be just two cases which fits into the browser inline cache (inline cache can take up to
  // 4)
  const tIcu = value.hasOwnProperty('currentCaseLViewIndex') ? value as TIcu :
                                                               (value as TIcuContainerNode).value;
  ngDevMode && assertTIcu(tIcu);
  return tIcu;
}

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
export function setTIcu(tView: TView, index: number, tIcu: TIcu): void {
  const tNode = tView.data[index] as null | TIcuContainerNode;
  ngDevMode &&
      assertEqual(
          tNode === null || tNode.hasOwnProperty('tView'), true,
          'We expect to get \'null\'|\'TIcuContainer\'');
  if (tNode === null) {
    tView.data[index] = tIcu;
  } else {
    ngDevMode && assertTNodeType(tNode, TNodeType.Icu);
    tNode.value = tIcu;
  }
}

/**
 * Set `TNode.insertBeforeIndex` taking the `Array` into account.
 *
 * See `TNode.insertBeforeIndex`
 */
export function setTNodeInsertBeforeIndex(tNode: TNode, index: number) {
  ngDevMode && assertTNode(tNode);
  let insertBeforeIndex = tNode.insertBeforeIndex;
  if (insertBeforeIndex === null) {
    setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
    insertBeforeIndex = tNode.insertBeforeIndex =
        [null!/* may be updated to number later */, index];
  } else {
    assertEqual(Array.isArray(insertBeforeIndex), true, 'Expecting array here');
    (insertBeforeIndex as number[]).push(index);
  }
}

/**
 * Create `TNode.type=TNodeType.Placeholder` node.
 *
 * See `TNodeType.Placeholder` for more information.
 */
export function createTNodePlaceholder(
    tView: TView, previousTNodes: TNode[], index: number): TNode {
  const tNode = createTNodeAtIndex(tView, index, TNodeType.Placeholder, null, null);
  addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tNode);
  return tNode;
}


/**
 * Returns current ICU case.
 *
 * ICU cases are stored as index into the `TIcu.cases`.
 * At times it is necessary to communicate that the ICU case just switched and that next ICU update
 * should update all bindings regardless of the mask. In such a case the we store negative numbers
 * for cases which have just been switched. This function removes the negative flag.
 */
export function getCurrentICUCaseIndex(tIcu: TIcu, lView: LView) {
  const currentCase: number|null = lView[tIcu.currentCaseLViewIndex];
  return currentCase === null ? currentCase : (currentCase < 0 ? ~currentCase : currentCase);
}

export function getParentFromIcuCreateOpCode(mergedCode: number): number {
  return mergedCode >>> IcuCreateOpCode.SHIFT_PARENT;
}

export function getRefFromIcuCreateOpCode(mergedCode: number): number {
  return (mergedCode & IcuCreateOpCode.MASK_REF) >>> IcuCreateOpCode.SHIFT_REF;
}

export function getInstructionFromIcuCreateOpCode(mergedCode: number): number {
  return mergedCode & IcuCreateOpCode.MASK_INSTRUCTION;
}

export function icuCreateOpCode(opCode: IcuCreateOpCode, parentIdx: number, refIdx: number) {
  ngDevMode && assertGreaterThanOrEqual(parentIdx, 0, 'Missing parent index');
  ngDevMode && assertGreaterThan(refIdx, 0, 'Missing ref index');
  return opCode | parentIdx << IcuCreateOpCode.SHIFT_PARENT | refIdx << IcuCreateOpCode.SHIFT_REF;
}
