/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer_dom';
import {HEADER_OFFSET, RENDERER} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {getLView, getTView} from '../state';
import {getNativeByIndex, getTNode} from '../util/view_utils';

/**
 * Sets the location within the source template at which
 * each element in the current view was defined.
 *
 * @param index Index at which the DOM node was created.
 * @param templatePath Path to the template at which the node was defined.
 * @param locations Element locations to which to attach the source location.
 *
 * @codeGenApi
 */
export function ɵɵattachSourceLocations(
  templatePath: string,
  locations: [index: number, offset: number, line: number, column: number][],
) {
  const tView = getTView();
  const lView = getLView();
  const renderer = lView[RENDERER];
  const attributeName = 'data-ng-source-location';

  for (const [index, offset, line, column] of locations) {
    const tNode = getTNode(tView, index + HEADER_OFFSET);
    // The compiler shouldn't generate the instruction for non-element nodes, but assert just in case.
    ngDevMode && assertTNodeType(tNode, TNodeType.Element);
    const node = getNativeByIndex(index + HEADER_OFFSET, lView) as RElement;

    // Set the attribute directly in the DOM so it doesn't participate in directive matching.
    if (!node.hasAttribute(attributeName)) {
      const attributeValue = `${templatePath}@o:${offset},l:${line},c:${column}`;
      renderer.setAttribute(node, attributeName, attributeValue);
    }
  }
}
