/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertDataInRange, assertEqual} from '../../util/assert';
import {NG_DEV_MODE} from '../../util/ng_dev_mode';
import {TElementNode, TNodeType} from '../interfaces/node';
import {HEADER_OFFSET, RENDERER, TVIEW, T_HOST} from '../interfaces/view';
import {appendChild, createTextNode} from '../node_manipulation';
import {getBindingIndex, getLView, setPreviousOrParentTNode} from '../state';

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
  const adjustedIndex = index + HEADER_OFFSET;

  NG_DEV_MODE && assertEqual(
                   getBindingIndex(), tView.bindingStartIndex,
                   'text nodes should be created before any bindings');
  NG_DEV_MODE && assertDataInRange(lView, adjustedIndex);

  const tNode = tView.firstCreatePass ?
      getOrCreateTNode(tView, lView[T_HOST], index, TNodeType.Element, null, null) :
      tView.data[adjustedIndex] as TElementNode;

  const textNative = lView[adjustedIndex] = createTextNode(value, lView[RENDERER]);
  appendChild(textNative, tNode, lView);

  // Text nodes are self closing.
  setPreviousOrParentTNode(tNode, false);
}
