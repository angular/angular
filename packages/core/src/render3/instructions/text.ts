/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertEqual, assertIndexInRange} from '../../util/assert.js';
import {TElementNode, TNodeType} from '../interfaces/node.js';
import {HEADER_OFFSET, RENDERER, T_HOST} from '../interfaces/view.js';
import {appendChild, createTextNode} from '../node_manipulation.js';
import {getBindingIndex, getLView, getTView, setCurrentTNode} from '../state.js';

import {getOrCreateTNode} from './shared.js';



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

  const textNative = lView[adjustedIndex] = createTextNode(lView[RENDERER], value);
  appendChild(tView, lView, textNative, tNode);

  // Text nodes are self closing.
  setCurrentTNode(tNode, false);
}
