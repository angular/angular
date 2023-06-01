/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {validateMatchingNode} from '../../hydration/error_handling';
import {locateNextRNode} from '../../hydration/node_lookup_utils';
import {isDisconnectedNode, markRNodeAsClaimedByHydration} from '../../hydration/utils';
import {assertEqual, assertIndexInRange} from '../../util/assert';
import {TElementNode, TNode, TNodeType} from '../interfaces/node';
import {RText} from '../interfaces/renderer_dom';
import {HEADER_OFFSET, HYDRATION, LView, RENDERER, T_HOST, TView} from '../interfaces/view';
import {appendChild, createTextNode} from '../node_manipulation';
import {getBindingIndex, getLView, getTView, isInSkipHydrationBlock, lastNodeWasCreated, setCurrentTNode, wasLastNodeCreated} from '../state';

import {getOrCreateTNode} from './shared';



/**
 * Create static text node
 *
 * @param index Index of the node in the data array
 * @param value Static string value to write.
 *
 * @codeGenApi
 */
export function ɵɵtext(index: number, value: string = ''): void {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;

  ngDevMode &&
      assertEqual(
          getBindingIndex(), tView.bindingStartIndex,
          'text nodes should be created before any bindings');
  ngDevMode && assertIndexInRange(lView, adjustedIndex);

  const tNode = tView.firstCreatePass ?
      getOrCreateTNode(tView, adjustedIndex, TNodeType.Text, value, null) :
      tView.data[adjustedIndex] as TElementNode;

  const textNative = _locateOrCreateTextNode(tView, lView, tNode, value, index);
  lView[adjustedIndex] = textNative;

  if (wasLastNodeCreated()) {
    appendChild(tView, lView, textNative, tNode);
  }

  // Text nodes are self closing.
  setCurrentTNode(tNode, false);
}

let _locateOrCreateTextNode: typeof locateOrCreateTextNodeImpl =
    (tView: TView, lView: LView, tNode: TNode, value: string, index: number) => {
      lastNodeWasCreated(true);
      return createTextNode(lView[RENDERER], value);
    };

/**
 * Enables hydration code path (to lookup existing elements in DOM)
 * in addition to the regular creation mode of text nodes.
 */
function locateOrCreateTextNodeImpl(
    tView: TView, lView: LView, tNode: TNode, value: string, index: number): RText {
  const hydrationInfo = lView[HYDRATION];
  const isNodeCreationMode =
      !hydrationInfo || isInSkipHydrationBlock() || isDisconnectedNode(hydrationInfo, index);
  lastNodeWasCreated(isNodeCreationMode);

  // Regular creation mode.
  if (isNodeCreationMode) {
    return createTextNode(lView[RENDERER], value);
  }

  // Hydration mode, looking up an existing element in DOM.
  const textNative = locateNextRNode(hydrationInfo, tView, lView, tNode) as RText;

  ngDevMode && validateMatchingNode(textNative, Node.TEXT_NODE, null, lView, tNode);
  ngDevMode && markRNodeAsClaimedByHydration(textNative);

  return textNative;
}

export function enableLocateOrCreateTextNodeImpl() {
  _locateOrCreateTextNode = locateOrCreateTextNodeImpl;
}
