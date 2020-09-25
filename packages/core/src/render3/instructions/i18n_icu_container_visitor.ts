/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDomNode, assertEqual, assertNumber, assertNumberInRange} from '../../util/assert';
import {assertTIcu, assertTNodeForLView} from '../assert';
import {EMPTY_ARRAY} from '../empty';
import {getCurrentICUCaseIndex, I18nMutateOpCode, I18nMutateOpCodes, TIcu} from '../interfaces/i18n';
import {TIcuContainerNode} from '../interfaces/node';
import {RNode} from '../interfaces/renderer';
import {LView, TVIEW} from '../interfaces/view';

export function loadIcuContainerVisitor() {
  const _stack: any[] = [];
  let _index: number = -1;
  let _lView: LView;
  let _removes: I18nMutateOpCodes;

  /**
   * Retrieves a set of root nodes from `TIcu.remove`. Used by `TNodeType.ICUContainer`
   * to determine which root belong to the ICU.
   *
   * Example of usage.
   * ```
   * const nextRNode = icuContainerIteratorStart(tIcuContainerNode, lView);
   * let rNode: RNode|null;
   * while(rNode = nextRNode()) {
   *   console.log(rNode);
   * }
   * ```
   *
   * @param tIcuContainerNode Current `TIcuContainerNode`
   * @param lView `LView` where the `RNode`s should be looked up.
   */
  function icuContainerIteratorStart(tIcuContainerNode: TIcuContainerNode, lView: LView): () =>
      RNode | null {
    _lView = lView;
    while (_stack.length) _stack.pop();
    // FIXME(misko): This is a hack which allows us to associate `TI18n` with `TNode`.
    // This should be refactored so that one can attach arbitrary data with `TNode`
    ngDevMode && assertTNodeForLView(tIcuContainerNode, lView);
    const tIcu: TIcu = tIcuContainerNode.tagName as any;
    enterIcu(tIcu, lView);
    return icuContainerIteratorNext;
  }

  function enterIcu(tIcu: TIcu, lView: LView) {
    _index = 0;
    const currentCase = getCurrentICUCaseIndex(tIcu, lView);
    if (currentCase !== null) {
      ngDevMode && assertNumberInRange(currentCase, 0, tIcu.cases.length - 1);
      _removes = tIcu.remove[currentCase];
    } else {
      _removes = EMPTY_ARRAY;
    }
  }


  function icuContainerIteratorNext(): RNode|null {
    if (_index < _removes.length) {
      const removeOpCode = _removes[_index++] as number;
      ngDevMode && assertNumber(removeOpCode, 'Expecting OpCode number');
      const opCode = removeOpCode & I18nMutateOpCode.MASK_INSTRUCTION;
      if (opCode === I18nMutateOpCode.Remove) {
        const rNode = _lView[removeOpCode >>> I18nMutateOpCode.SHIFT_REF];
        ngDevMode && assertDomNode(rNode);
        return rNode;
      } else {
        ngDevMode &&
            assertEqual(opCode, I18nMutateOpCode.RemoveNestedIcu, 'Expecting RemoveNestedIcu');
        _stack.push(_index, _removes);
        const tIcu = _lView[TVIEW].data[removeOpCode >>> I18nMutateOpCode.SHIFT_REF] as TIcu;
        ngDevMode && assertTIcu(tIcu);
        enterIcu(tIcu, _lView);
        return icuContainerIteratorNext();
      }
    } else {
      if (_stack.length === 0) {
        return null;
      } else {
        _removes = _stack.pop();
        _index = _stack.pop();
        return icuContainerIteratorNext();
      }
    }
  }

  return icuContainerIteratorStart;
}
