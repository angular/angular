/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNode} from '../render3/interfaces/node';
import {RElement, RNode} from '../render3/interfaces/renderer_dom';
import {LView, TView} from '../render3/interfaces/view';
import {getNativeByTNode} from '../render3/util/view_utils';
import {assertDefined} from '../util/assert';

import {DehydratedView} from './interfaces';

/**
 * Locate a node in DOM tree that corresponds to a given TNode.
 *
 * @param hydrationInfo The hydration annotation data
 * @param tView the current tView
 * @param lView the current lView
 * @param tNode the current tNode
 * @returns an RNode that represents a given tNode
 */
export function locateNextRNode<T extends RNode>(
    hydrationInfo: DehydratedView, tView: TView, lView: LView<unknown>, tNode: TNode): T|null {
  let native: RNode|null = null;
  if (tView.firstChild === tNode) {
    // We create a first node in this view, so we use a reference
    // to the first child in this DOM segment.
    native = hydrationInfo.firstChild;
  } else {
    // Locate a node based on a previous sibling or a parent node.
    const previousTNodeParent = tNode.prev === null;
    const previousTNode = tNode.prev ?? tNode.parent;
    ngDevMode &&
        assertDefined(
            previousTNode,
            'Unexpected state: current TNode does not have a connection ' +
                'to the previous node or a parent node.');
    const previousRElement = getNativeByTNode(previousTNode!, lView);
    if (previousTNodeParent) {
      native = (previousRElement as RElement).firstChild;
    } else {
      native = previousRElement.nextSibling;
    }
  }
  return native as T;
}
