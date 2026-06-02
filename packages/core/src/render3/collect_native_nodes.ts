/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertParentView} from './assert';
import {icuContainerIterate} from './i18n/i18n_tree_shaking';
import {CONTAINER_HEADER_OFFSET, LContainer, LContainerFlags, NATIVE} from './interfaces/container';
import {TIcuContainerNode, TNode, TNodeType} from './interfaces/node';
import {RNode} from './interfaces/renderer_dom';
import {isLContainer} from './interfaces/type_checks';
import {
  DECLARATION_COMPONENT_VIEW,
  FLAGS,
  HOST,
  LView,
  TVIEW,
  TView,
  TViewType,
} from './interfaces/view';
import {assertTNodeType} from './node_assert';
import {getProjectionNodes} from './node_manipulation';
import {getLViewParent, unwrapRNode} from './util/view_utils';

export function collectNativeNodes(
  tView: TView,
  lView: LView,
  tNode: TNode | null,
  result: any[],
  isProjection: boolean = false,
): any[] {
  if (tView.type === TViewType.Foreign) {
    const headTNode = tView.firstChild!;
    const tailTNode = headTNode.next!;
    const head = unwrapRNode(lView[headTNode.index]);
    const tail = unwrapRNode(lView[tailTNode.index]);

    let current: RNode | null = head;
    while (current !== null) {
      result.push(current);
      if (current === tail) break;
      current = current.nextSibling;
    }
    return result;
  }

  while (tNode !== null) {
    // Let declarations don't have corresponding DOM nodes so we skip over them.
    if (tNode.type === TNodeType.LetDeclaration) {
      tNode = isProjection ? tNode.projectionNext : tNode.next;
      continue;
    }

    ngDevMode &&
      assertTNodeType(
        tNode,
        TNodeType.AnyRNode | TNodeType.AnyContainer | TNodeType.Projection | TNodeType.Icu,
      );

    const lNode = lView[tNode.index];
    if (lNode !== null) {
      if (isLContainer(lNode)) {
        const anchor = lNode[NATIVE];
        // If this is a dynamic container (ViewContainerRef on an element), the HOST element is a
        // distinct element node and must be pushed first (before the views are collected) to
        // preserve DOM order.
        if (anchor !== lNode[HOST]) {
          result.push(unwrapRNode(lNode));
        }

        // Collect the root nodes from the views in this container.
        if (!(lNode[FLAGS] & LContainerFlags.LogicalOnly)) {
          collectNativeNodesInLContainer(lNode, result);
        }

        // The container's anchor comment node is always physically positioned after any views
        // rendered inside the container, so we always push it here at the end.
        result.push(anchor);
      } else {
        result.push(unwrapRNode(lNode));
      }
    }

    const tNodeType = tNode.type;
    if (tNodeType & TNodeType.ElementContainer) {
      collectNativeNodes(tView, lView, tNode.child, result);
    } else if (tNodeType & TNodeType.Icu) {
      const nextRNode = icuContainerIterate(tNode as TIcuContainerNode, lView);
      let rNode: RNode | null;
      while ((rNode = nextRNode())) {
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

/**
 * Collects all root nodes in all views in a given LContainer.
 */
export function collectNativeNodesInLContainer(lContainer: LContainer, result: any[]) {
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const lViewInAContainer = lContainer[i];
    const lViewFirstChildTNode = lViewInAContainer[TVIEW].firstChild;
    if (lViewFirstChildTNode !== null) {
      collectNativeNodes(lViewInAContainer[TVIEW], lViewInAContainer, lViewFirstChildTNode, result);
    }
  }
}
