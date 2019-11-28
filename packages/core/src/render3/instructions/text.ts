/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertDataInRange, assertEqual} from '../../util/assert';
import {TElementNode, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer';
import {HEADER_OFFSET, RENDERER, TVIEW, T_HOST} from '../interfaces/view';
import {createTextNode, getNativeAnachorNodeIndex, getRenderParentIndex, nativeAppendChild, nativeInsertBefore} from '../node_manipulation';
import {getBindingIndex, getLView, setPreviousOrParentTNode} from '../state';
import {unwrapRNode} from '../util/view_utils';
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
  const tView = lView[TVIEW];
  const renderer = lView[RENDERER];
  const adjustedIndex = index + HEADER_OFFSET;

  ngDevMode && assertEqual(
                   getBindingIndex(), tView.bindingStartIndex,
                   'text nodes should be created before any bindings');
  ngDevMode && assertDataInRange(lView, adjustedIndex);

  let tNode: TElementNode;
  if (tView.firstCreatePass) {
    tNode = getOrCreateTNode(tView, lView[T_HOST], index, TNodeType.Element, null, null);
    tNode.renderParentIndex = getRenderParentIndex(tView, tNode);
    tNode.renderBeforeIndex = getNativeAnachorNodeIndex(tNode);
  } else {
    tNode = tView.data[adjustedIndex] as TElementNode;
  }

  const textNative = lView[adjustedIndex] = createTextNode(value, renderer);
  const renderParentIdx = tNode.renderParentIndex;
  if (renderParentIdx > -1) {
    const nativeParent = unwrapRNode(lView[renderParentIdx]) as RElement;
    const beforeNodeIndex = tNode.renderBeforeIndex;
    if (beforeNodeIndex > 0) {
      nativeInsertBefore(renderer, nativeParent, textNative, unwrapRNode(lView[beforeNodeIndex]));
    } else {
      nativeAppendChild(renderer, nativeParent, textNative);
    }
  }

  // Text nodes are self closing.
  setPreviousOrParentTNode(tNode, false);
}
