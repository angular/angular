/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertDataInRange, assertDefined, assertEqual} from '../../util/assert';
import {TNodeType} from '../interfaces/node';
import {RText, isProceduralRenderer} from '../interfaces/renderer';
import {BINDING_INDEX, HEADER_OFFSET, RENDERER, TVIEW, T_HOST} from '../interfaces/view';
import {appendChild, createTextNode} from '../node_manipulation';
import {getLView, setIsNotParent} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/misc_utils';
import {getNativeByIndex} from '../util/view_utils';
import {getOrCreateTNode} from './shared';

/**
 * Create static text node
 *
 * @param index Index of the node in the data array
 * @param value Value to write. This value will be stringified.
 *
 * @codeGenApi
 */
export function ɵɵtext(index: number, value?: any): void {
  const lView = getLView();
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], lView[TVIEW].bindingStartIndex,
                   'text nodes should be created before any bindings');
  ngDevMode && ngDevMode.rendererCreateTextNode++;
  ngDevMode && assertDataInRange(lView, index + HEADER_OFFSET);
  const textNative = lView[index + HEADER_OFFSET] = createTextNode(value, lView[RENDERER]);
  const tNode = getOrCreateTNode(lView[TVIEW], lView[T_HOST], index, TNodeType.Element, null, null);

  // Text nodes are self closing.
  setIsNotParent();
  appendChild(textNative, tNode, lView);
}

/**
 * Create text node with binding
 * Bindings should be handled externally with the proper interpolation(1-8) method
 *
 * @param index Index of the node in the data array.
 * @param value Stringified value to write.
 *
 * @codeGenApi
 */
export function ɵɵtextBinding<T>(index: number, value: T | NO_CHANGE): void {
  if (value !== NO_CHANGE) {
    const lView = getLView();
    ngDevMode && assertDataInRange(lView, index + HEADER_OFFSET);
    const element = getNativeByIndex(index, lView) as any as RText;
    ngDevMode && assertDefined(element, 'native element should exist');
    ngDevMode && ngDevMode.rendererSetText++;
    const renderer = lView[RENDERER];
    isProceduralRenderer(renderer) ? renderer.setValue(element, renderStringify(value)) :
                                     element.textContent = renderStringify(value);
  }
}
