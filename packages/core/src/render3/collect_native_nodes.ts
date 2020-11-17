/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined} from '../util/assert';

import {icuContainerIterate} from './i18n/i18n_tree_shaking';
import {CONTAINER_HEADER_OFFSET} from './interfaces/container';
import {TElementNode, TIcuContainerNode, TNode, TNodeType} from './interfaces/node';
import {RNode} from './interfaces/renderer_dom';
import {isLContainer} from './interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, LView, T_HOST, TVIEW, TView} from './interfaces/view';
import {assertTNodeType} from './node_assert';
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
      const componentView = lView[DECLARATION_COMPONENT_VIEW];
      const componentHost = componentView[T_HOST] as TElementNode;
      const slotIdx = tNode.projection as number;
      ngDevMode &&
          assertDefined(
              componentHost.projection,
              'Components with projection nodes (<ng-content>) must have projection slots defined.');

      const nodesInSlot = componentHost.projection![slotIdx];
      if (Array.isArray(nodesInSlot)) {
        result.push(...nodesInSlot);
      } else {
        const parentView = getLViewParent(componentView)!;
        ngDevMode &&
            assertDefined(
                parentView,
                'Component views should always have a parent view (component\'s host view)');
        collectNativeNodes(parentView[TVIEW], parentView, nodesInSlot, result, true);
      }
    }
    tNode = isProjection ? tNode.projectionNext : tNode.next;
  }

  return result;
}
