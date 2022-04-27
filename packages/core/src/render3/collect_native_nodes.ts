/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertParentView} from './assert.js';
import {icuContainerIterate} from './i18n/i18n_tree_shaking.js';
import {CONTAINER_HEADER_OFFSET} from './interfaces/container.js';
import {TIcuContainerNode, TNode, TNodeType} from './interfaces/node.js';
import {RNode} from './interfaces/renderer_dom.js';
import {isLContainer} from './interfaces/type_checks.js';
import {DECLARATION_COMPONENT_VIEW, LView, T_HOST, TVIEW, TView} from './interfaces/view.js';
import {assertTNodeType} from './node_assert.js';
import {getProjectionNodes} from './node_manipulation.js';
import {getLViewParent} from './util/view_traversal_utils.js';
import {unwrapRNode} from './util/view_utils.js';



export function collectNativeNodes(
    tView: TView, lView: LView, tNode: TNode|null, result: any[],
    isProjection: boolean = false): any[] {
  while (tNode !== null) {
    ngDevMode &&
        assertTNodeType(
            tNode,
            TNodeType.AnyRNode | TNodeType.AnyContainer | TNodeType.Projection | TNodeType.Icu);

    const lNode = lView[tNode.index];
    if (lNode !== null) {
      result.push(unwrapRNode(lNode));
    }

    // A given lNode can represent either a native node or a LContainer (when it is a host of a
    // ViewContainerRef). When we find a LContainer we need to descend into it to collect root nodes
    // from the views in this container.
    if (isLContainer(lNode)) {
      for (let i = CONTAINER_HEADER_OFFSET; i < lNode.length; i++) {
        const lViewInAContainer = lNode[i];
        const lViewFirstChildTNode = lViewInAContainer[TVIEW].firstChild;
        if (lViewFirstChildTNode !== null) {
          collectNativeNodes(
              lViewInAContainer[TVIEW], lViewInAContainer, lViewFirstChildTNode, result);
        }
      }
    }

    const tNodeType = tNode.type;
    if (tNodeType & TNodeType.ElementContainer) {
      collectNativeNodes(tView, lView, tNode.child, result);
    } else if (tNodeType & TNodeType.Icu) {
      const nextRNode = icuContainerIterate(tNode as TIcuContainerNode, lView);
      let rNode: RNode|null;
      while (rNode = nextRNode()) {
        result.push(rNode);
      }
    } else if (tNodeType & TNodeType.Projection) {
      const nodesInSlot = getProjectionNodes(lView, tNode);
      if (Array.isArray(nodesInSlot)) {
        result.push(...nodesInSlot);
      } else {
        const parentView = getLViewParent(lView[DECLARATION_COMPONENT_VIEW])!;
        ngDevMode && assertParentView(parentView);
        collectNativeNodes(parentView[TVIEW], parentView, nodesInSlot, result, true);
      }
    }
    tNode = isProjection ? tNode.projectionNext : tNode.next;
  }

  return result;
}
