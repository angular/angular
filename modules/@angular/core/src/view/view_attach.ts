/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NodeData, NodeFlags, ViewData} from './types';

export function attachEmbeddedView(node: NodeData, viewIndex: number, view: ViewData) {
  let embeddedViews = node.embeddedViews;
  if (viewIndex == null) {
    viewIndex = embeddedViews.length;
  }
  // perf: array.push is faster than array.splice!
  if (viewIndex >= embeddedViews.length) {
    embeddedViews.push(view);
  } else {
    embeddedViews.splice(viewIndex, 0, view);
  }
  const prevView = viewIndex > 0 ? embeddedViews[viewIndex - 1] : null;
  const prevNode = prevView ? prevView.nodes[prevView.def.lastRootNode] : node;
  const prevRenderNode = prevNode.renderNode;
  if (view.renderer) {
    view.renderer.attachViewAfter(prevRenderNode, rootRenderNodes(view));
  } else {
    const parentNode = prevRenderNode.parentNode;
    const nextSibling = prevRenderNode.nextSibling;
    if (parentNode) {
      const action = nextSibling ? DirectDomAction.InsertBefore : DirectDomAction.AppendChild;
      directDomAttachDetachSiblingRenderNodes(view, 0, action, parentNode, nextSibling);
    }
  }
}

export function detachEmbeddedView(node: NodeData, viewIndex: number): ViewData {
  const embeddedViews = node.embeddedViews;
  if (viewIndex == null) {
    viewIndex = embeddedViews.length;
  }
  const view = embeddedViews[viewIndex];
  // perf: array.pop is faster than array.splice!
  if (viewIndex >= embeddedViews.length - 1) {
    embeddedViews.pop();
  } else {
    embeddedViews.splice(viewIndex, 1);
  }
  if (view.renderer) {
    view.renderer.detachView(rootRenderNodes(view));
  } else {
    const parentNode = node.renderNode.parentNode;
    if (parentNode) {
      directDomAttachDetachSiblingRenderNodes(
          view, 0, DirectDomAction.RemoveChild, parentNode, null);
    }
  }
  return view;
}

export function rootRenderNodes(view: ViewData): any[] {
  const renderNodes: any[] = [];
  collectSiblingRenderNodes(view, 0, renderNodes);
  return renderNodes;
}

function collectSiblingRenderNodes(view: ViewData, startIndex: number, target: any[]) {
  for (let i = startIndex; i < view.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    const nodeData = view.nodes[i];
    target.push(nodeData.renderNode);
    if (nodeDef.flags & NodeFlags.HasEmbeddedViews) {
      const embeddedViews = nodeData.embeddedViews;
      if (embeddedViews) {
        for (let k = 0; k < embeddedViews.length; k++) {
          collectSiblingRenderNodes(embeddedViews[k], 0, target);
        }
      }
    }
    // jump to next sibling
    i += nodeDef.childCount;
  }
}

enum DirectDomAction {
  AppendChild,
  InsertBefore,
  RemoveChild
}

function directDomAttachDetachSiblingRenderNodes(
    view: ViewData, startIndex: number, action: DirectDomAction, parentNode: any,
    nextSibling: any) {
  for (let i = startIndex; i < view.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    const nodeData = view.nodes[i];
    switch (action) {
      case DirectDomAction.AppendChild:
        parentNode.appendChild(nodeData.renderNode);
        break;
      case DirectDomAction.InsertBefore:
        parentNode.insertBefore(nodeData.renderNode, nextSibling);
        break;
      case DirectDomAction.RemoveChild:
        parentNode.removeChild(nodeData.renderNode);
        break;
    }
    if (nodeDef.flags & NodeFlags.HasEmbeddedViews) {
      const embeddedViews = nodeData.embeddedViews;
      if (embeddedViews) {
        for (let k = 0; k < embeddedViews.length; k++) {
          directDomAttachDetachSiblingRenderNodes(
              embeddedViews[k], 0, action, parentNode, nextSibling);
        }
      }
    }
    // jump to next sibling
    i += nodeDef.childCount;
  }
}