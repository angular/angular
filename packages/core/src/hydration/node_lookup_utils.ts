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
import {DehydratedView} from './interfaces';
import {calcSerializedContainerSize, getSegmentHead} from './utils';

/** Whether current TNode is a first node in an <ng-container>. */
function isFirstElementInNgContainer(tNode: TNode): boolean {
  return !tNode.prev && tNode.parent?.type === TNodeType.ElementContainer;
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
    if (isFirstElementInNgContainer(tNode)) {
      const noOffsetParentIndex = tNode.parent!.index - HEADER_OFFSET;
      native = getSegmentHead(hydrationInfo, noOffsetParentIndex);
    } else {
      let previousRElement = getNativeByTNode(previousTNode, lView);
      if (previousTNodeParent) {
        native = (previousRElement as RElement).firstChild;
      } else {
        // If the previous node is an element, but it also has container info,
        // this means that we are processing a node like `<div #vcrTarget>`, which is
        // represented in the DOM as `<div></div>...<!--container-->`.
        // In this case, there are nodes *after* this element and we need to skip
        // all of them to reach an element that we are looking for.
        const noOffsetPrevSiblingIndex = previousTNode.index - HEADER_OFFSET;
        const segmentHead = getSegmentHead(hydrationInfo, noOffsetPrevSiblingIndex);
        if (previousTNode.type === TNodeType.Element && segmentHead) {
          const numRootNodesToSkip =
              calcSerializedContainerSize(hydrationInfo, noOffsetPrevSiblingIndex);
          // `+1` stands for an anchor comment node after all the views in this container.
          const nodesToSkip = numRootNodesToSkip + 1;
          // First node after this segment.
          native = siblingAfter(nodesToSkip, segmentHead);
        } else {
          native = previousRElement.nextSibling;
        }
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
    ngDevMode && validateSiblingNodeExists(currentNode);
    currentNode = currentNode.nextSibling!;
  }
  return currentNode as T;
}
