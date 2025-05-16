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
import {I18nRemoveOpCodes, TIcu} from '../interfaces/i18n';
import {TIcuContainerNode} from '../interfaces/node';
import {RNode} from '../interfaces/renderer_dom';
import {LView, TVIEW} from '../interfaces/view';

interface IcuIteratorState {
  stack: any[];
  index: number;
  lView?: LView;
  removes?: I18nRemoveOpCodes;
}

type IcuIterator = () => RNode | null;

function enterIcu(state: IcuIteratorState, tIcu: TIcu, lView: LView) {
  state.index = 0;
  const currentCase = getCurrentICUCaseIndex(tIcu, lView);
  if (currentCase !== null) {
    ngDevMode && assertNumberInRange(currentCase, 0, tIcu.cases.length - 1);
    state.removes = tIcu.remove[currentCase];
  } else {
    state.removes = EMPTY_ARRAY as any;
  }
}

function icuContainerIteratorNext(state: IcuIteratorState): RNode | null {
  if (state.index < state.removes!.length) {
    const removeOpCode = state.removes![state.index++] as number;
    ngDevMode && assertNumber(removeOpCode, 'Expecting OpCode number');
    if (removeOpCode > 0) {
      const rNode = state.lView![removeOpCode];
      ngDevMode && assertDomNode(rNode);
      return rNode;
    } else {
      state.stack.push(state.index, state.removes);
      // ICUs are represented by negative indices
      const tIcuIndex = ~removeOpCode;
      const tIcu = state.lView![TVIEW].data[tIcuIndex] as TIcu;
      ngDevMode && assertTIcu(tIcu);
      enterIcu(state, tIcu, state.lView!);
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
  const _state: IcuIteratorState = {
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
  function icuContainerIteratorStart(
    tIcuContainerNode: TIcuContainerNode,
    lView: LView,
  ): IcuIterator {
    _state.lView = lView;
    while (_state.stack.length) _state.stack.pop();
    ngDevMode && assertTNodeForLView(tIcuContainerNode, lView);
    enterIcu(_state, tIcuContainerNode.value, lView);
    return icuContainerIteratorNext.bind(null, _state);
  }

  return icuContainerIteratorStart;
}

export function createIcuIterator(tIcu: TIcu, lView: LView): IcuIterator {
  const state: IcuIteratorState = {
    stack: [],
    index: -1,
    lView,
  };
  ngDevMode && assertTIcu(tIcu);
  enterIcu(state, tIcu, lView);
  return icuContainerIteratorNext.bind(null, state);
}
