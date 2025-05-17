/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertEqual, assertIndexInRange} from '../../util/assert';
import {createElementNode} from '../dom_node_manipulation';
import {HEADER_OFFSET, RENDERER, TVIEW} from '../interfaces/view';
import {getBindingIndex, getLView} from '../state';

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

  const renderer = lView[RENDERER];

  const native = createElementNode(renderer, 'template', null) as HTMLTemplateElement;
  native.innerHTML = htmlString;

  lView[adjustedIndex] = native;
}
