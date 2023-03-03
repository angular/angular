/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNode} from '../render3/interfaces/node';
import {LView} from '../render3/interfaces/view';

/**
 * Verifies whether a given node matches an expected criteria,
 * based on internal data structure state.
 */
export function validateMatchingNode(
    node: Node, nodeType: number, tagName: string|null, lView: LView, tNode: TNode): void {
  if (node.nodeType !== nodeType ||
      (node.nodeType === Node.ELEMENT_NODE &&
       (node as HTMLElement).tagName.toLowerCase() !== tagName?.toLowerCase())) {
    // TODO: improve error message and use RuntimeError instead.
    throw new Error(`Unexpected node found during hydration.`);
  }
}

/**
 * Verifies whether next sibling node exists.
 */
export function validateSiblingNodeExists(node: Node): void {
  if (!node.nextSibling) {
    // TODO: improve error message and use RuntimeError instead.
    throw new Error(`Unexpected state: insufficient number of sibling nodes.`);
  }
}
