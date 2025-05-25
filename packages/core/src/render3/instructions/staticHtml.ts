/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertEqual, assertIndexInRange} from '../../util/assert';
import {createElementNode} from '../dom_node_manipulation';
import {TElementNode, TNodeType} from '../interfaces/node';
import {HEADER_OFFSET, RENDERER, TVIEW} from '../interfaces/view';
import {appendChild} from '../node_manipulation';
import {getBindingIndex, getLView} from '../state';
import {getOrCreateTNode} from '../tnode_manipulation';

/**
 * Renders a static HTML string, no binding or event listeners are attached
 *
 * @codeGenApi
 */
export function ɵɵstaticHtml<T>(htmlString: string): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  const adjustedIndex = HEADER_OFFSET;

  ngDevMode &&
    assertEqual(
      getBindingIndex(),
      tView.bindingStartIndex,
      'text nodes should be created before any bindings',
    );
  ngDevMode && assertIndexInRange(lView, adjustedIndex);

  const tNode = tView.firstCreatePass
    ? getOrCreateTNode(tView, adjustedIndex, TNodeType.Element, null, null)
    : (tView.data[adjustedIndex] as TElementNode);

  const renderer = lView[RENDERER];

  const template = createElementNode(renderer, 'template', null) as HTMLTemplateElement;
  template.innerHTML = htmlString;
  if (ngDevMode && template.content.childNodes.length !== 1) {
    throw new Error(
      `htmlString should only contain a single root element, but found ${template.content.childNodes.length}`,
    );
  }

  appendChild(tView, lView, template.content.firstElementChild!, tNode);

  lView[adjustedIndex] = template.content.firstChild;
}
