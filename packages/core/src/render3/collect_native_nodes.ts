/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertParentView} from './assert';
import {icuContainerIterate} from './i18n/i18n_tree_shaking';
import {CONTAINER_HEADER_OFFSET, NATIVE} from './interfaces/container';
import {TIcuContainerNode, TNode, TNodeType} from './interfaces/node';
import {RNode} from './interfaces/renderer_dom';
import {isLContainer} from './interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, HOST, LView, T_HOST, TVIEW, TView} from './interfaces/view';
import {assertTNodeType} from './node_assert';
import {getProjectionNodes} from './node_manipulation';
import {getLViewParent} from './util/view_traversal_utils';
import {unwrapRNode} from './util/view_utils';



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

      // When an LContainer is created, the anchor (comment) node is:
      // - (1) either reused in case of an ElementContainer (<ng-container>)
      // - (2) or a new comment node is created
      // In the first case, the anchor comment node would be added to the final
      // list by the code above (`result.push(unwrapRNode(lNode))`), but the second
      // case requires extra handling: the anchor node needs to be added to the
      // final list manually. See additional information in the `createAnchorNode`
      // function in the `view_container_ref.ts`.
      //
      // In the first case, the same reference would be stored in the `NATIVE`
      // and `HOST` slots in an LContainer. Otherwise, this is the second case and
      // we should add an element to the final list.
      if (lNode[NATIVE] !== lNode[HOST]) {
        result.push(lNode[NATIVE]);
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
