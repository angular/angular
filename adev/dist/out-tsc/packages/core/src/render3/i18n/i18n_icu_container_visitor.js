/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertDomNode, assertNumber, assertNumberInRange} from '../../util/assert';
import {EMPTY_ARRAY} from '../../util/empty';
import {assertTIcu, assertTNodeForLView} from '../assert';
import {getCurrentICUCaseIndex} from './i18n_util';
import {TVIEW} from '../interfaces/view';
function enterIcu(state, tIcu, lView) {
  state.index = 0;
  const currentCase = getCurrentICUCaseIndex(tIcu, lView);
  if (currentCase !== null) {
    ngDevMode && assertNumberInRange(currentCase, 0, tIcu.cases.length - 1);
    state.removes = tIcu.remove[currentCase];
  } else {
    state.removes = EMPTY_ARRAY;
  }
}
function icuContainerIteratorNext(state) {
  if (state.index < state.removes.length) {
    const removeOpCode = state.removes[state.index++];
    ngDevMode && assertNumber(removeOpCode, 'Expecting OpCode number');
    if (removeOpCode > 0) {
      const rNode = state.lView[removeOpCode];
      ngDevMode && assertDomNode(rNode);
      return rNode;
    } else {
      state.stack.push(state.index, state.removes);
      // ICUs are represented by negative indices
      const tIcuIndex = ~removeOpCode;
      const tIcu = state.lView[TVIEW].data[tIcuIndex];
      ngDevMode && assertTIcu(tIcu);
      enterIcu(state, tIcu, state.lView);
      return icuContainerIteratorNext(state);
    }
  } else {
    if (state.stack.length === 0) {
      return null;
    } else {
      state.removes = state.stack.pop();
      state.index = state.stack.pop();
      return icuContainerIteratorNext(state);
    }
  }
}
export function loadIcuContainerVisitor() {
  const _state = {
    stack: [],
    index: -1,
  };
  /**
   * Retrieves a set of root nodes from `TIcu.remove`. Used by `TNodeType.ICUContainer`
   * to determine which root belong to the ICU.
   *
   * Example of usage.
   * ```ts
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
  function icuContainerIteratorStart(tIcuContainerNode, lView) {
    _state.lView = lView;
    while (_state.stack.length) _state.stack.pop();
    ngDevMode && assertTNodeForLView(tIcuContainerNode, lView);
    enterIcu(_state, tIcuContainerNode.value, lView);
    return icuContainerIteratorNext.bind(null, _state);
  }
  return icuContainerIteratorStart;
}
export function createIcuIterator(tIcu, lView) {
  const state = {
    stack: [],
    index: -1,
    lView,
  };
  ngDevMode && assertTIcu(tIcu);
  enterIcu(state, tIcu, lView);
  return icuContainerIteratorNext.bind(null, state);
}
//# sourceMappingURL=i18n_icu_container_visitor.js.map
