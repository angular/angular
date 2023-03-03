/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNode, TNodeType} from '../render3/interfaces/node';
import {RElement, RNode} from '../render3/interfaces/renderer_dom';
import {HEADER_OFFSET, LView, TView} from '../render3/interfaces/view';
import {getNativeByTNode} from '../render3/util/view_utils';
import {assertDefined} from '../util/assert';

import {validateSiblingNodeExists} from './error_handling';
import {DehydratedElementContainer, DehydratedView} from './interfaces';

/** Whether current TNode is a first node in an <ng-container>. */
function isFirstElementInNgContainer(tNode: TNode): boolean {
  return !tNode.prev && tNode.parent?.type === TNodeType.ElementContainer;
}

/** Returns first element from a DOM segment that corresponds to this <ng-container>. */
function getDehydratedNgContainer(
    hydrationInfo: DehydratedView, tContainerNode: TNode): DehydratedElementContainer {
  const noOffsetIndex = tContainerNode.index - HEADER_OFFSET;
  const ngContainer = hydrationInfo.ngContainers?.[noOffsetIndex]!;
  ngDevMode &&
      assertDefined(
          ngContainer,
          'Unexpected state: no hydration info available for a given TNode, ' +
              'which represents an element container.');
  return ngContainer;
}

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
    const previousTNode = (tNode.prev ?? tNode.parent)!;
    ngDevMode &&
        assertDefined(
            previousTNode,
            'Unexpected state: current TNode does not have a connection ' +
                'to the previous node or a parent node.');
    const previousRElement = getNativeByTNode(previousTNode, lView);
    if (isFirstElementInNgContainer(tNode)) {
      const ngContainer = getDehydratedNgContainer(hydrationInfo, tNode.parent!);
      native = ngContainer.firstChild ?? null;
    } else {
      if (previousTNodeParent) {
        native = (previousRElement as RElement).firstChild;
      } else {
        native = previousRElement.nextSibling;
      }
    }
  }
  return native as T;
}

/**
 * Skips over a specified number of nodes and returns the next sibling node after that.
 */
export function siblingAfter<T extends RNode>(skip: number, from: RNode): T|null {
  let currentNode = from;
  for (let i = 0; i < skip; i++) {
    ngDevMode && validateSiblingNodeExists(currentNode as Node);
    currentNode = currentNode.nextSibling!;
  }
  return currentNode as T;
}
