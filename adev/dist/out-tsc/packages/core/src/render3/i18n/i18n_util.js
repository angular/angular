/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  assertEqual,
  assertGreaterThan,
  assertGreaterThanOrEqual,
  throwError,
} from '../../util/assert';
import {assertTIcu, assertTNode} from '../assert';
import {assertTNodeType} from '../node_assert';
import {setI18nHandling} from '../node_manipulation';
import {getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore} from '../node_manipulation_i18n';
import {createTNodeAtIndex} from '../tnode_manipulation';
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
export function getTIcu(tView, index) {
  const value = tView.data[index];
  if (value === null || typeof value === 'string') return null;
  if (
    ngDevMode &&
    !(value.hasOwnProperty('tView') || value.hasOwnProperty('currentCaseLViewIndex'))
  ) {
    throwError("We expect to get 'null'|'TIcu'|'TIcuContainer', but got: " + value);
  }
  // Here the `value.hasOwnProperty('currentCaseLViewIndex')` is a polymorphic read as it can be
  // either TIcu or TIcuContainerNode. This is not ideal, but we still think it is OK because it
  // will be just two cases which fits into the browser inline cache (inline cache can take up to
  // 4)
  const tIcu = value.hasOwnProperty('currentCaseLViewIndex') ? value : value.value;
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
export function setTIcu(tView, index, tIcu) {
  const tNode = tView.data[index];
  ngDevMode &&
    assertEqual(
      tNode === null || tNode.hasOwnProperty('tView'),
      true,
      "We expect to get 'null'|'TIcuContainer'",
    );
  if (tNode === null) {
    tView.data[index] = tIcu;
  } else {
    ngDevMode && assertTNodeType(tNode, 32 /* TNodeType.Icu */);
    tNode.value = tIcu;
  }
}
/**
 * Set `TNode.insertBeforeIndex` taking the `Array` into account.
 *
 * See `TNode.insertBeforeIndex`
 */
export function setTNodeInsertBeforeIndex(tNode, index) {
  ngDevMode && assertTNode(tNode);
  let insertBeforeIndex = tNode.insertBeforeIndex;
  if (insertBeforeIndex === null) {
    setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
    insertBeforeIndex = tNode.insertBeforeIndex = [
      null /* may be updated to number later */,
      index,
    ];
  } else {
    assertEqual(Array.isArray(insertBeforeIndex), true, 'Expecting array here');
    insertBeforeIndex.push(index);
  }
}
/**
 * Create `TNode.type=TNodeType.Placeholder` node.
 *
 * See `TNodeType.Placeholder` for more information.
 */
export function createTNodePlaceholder(tView, previousTNodes, index) {
  const tNode = createTNodeAtIndex(tView, index, 64 /* TNodeType.Placeholder */, null, null);
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
export function getCurrentICUCaseIndex(tIcu, lView) {
  const currentCase = lView[tIcu.currentCaseLViewIndex];
  return currentCase === null ? currentCase : currentCase < 0 ? ~currentCase : currentCase;
}
export function getParentFromIcuCreateOpCode(mergedCode) {
  return mergedCode >>> 17 /* IcuCreateOpCode.SHIFT_PARENT */;
}
export function getRefFromIcuCreateOpCode(mergedCode) {
  return (mergedCode & 131070) /* IcuCreateOpCode.MASK_REF */ >>> 1 /* IcuCreateOpCode.SHIFT_REF */;
}
export function getInstructionFromIcuCreateOpCode(mergedCode) {
  return mergedCode & 1 /* IcuCreateOpCode.MASK_INSTRUCTION */;
}
export function icuCreateOpCode(opCode, parentIdx, refIdx) {
  ngDevMode && assertGreaterThanOrEqual(parentIdx, 0, 'Missing parent index');
  ngDevMode && assertGreaterThan(refIdx, 0, 'Missing ref index');
  return (
    opCode |
    (parentIdx << 17) /* IcuCreateOpCode.SHIFT_PARENT */ |
    (refIdx << 1) /* IcuCreateOpCode.SHIFT_REF */
  );
}
// Returns whether the given value corresponds to a root template message,
// or a sub-template.
export function isRootTemplateMessage(subTemplateIndex) {
  return subTemplateIndex === -1;
}
//# sourceMappingURL=i18n_util.js.map
