/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NodeData, NodeFlags, ViewData} from './types';
import {declaredViewContainer} from './util';

export function attachEmbeddedView(node: NodeData, viewIndex: number, view: ViewData) {
  let embeddedViews = node.elementOrText.embeddedViews;
  if (viewIndex == null) {
    viewIndex = embeddedViews.length;
  }
  addToArray(embeddedViews, viewIndex, view);
  const dvc = declaredViewContainer(view);
  if (dvc && dvc !== node) {
    let projectedViews = dvc.elementOrText.projectedViews;
    if (!projectedViews) {
      projectedViews = dvc.elementOrText.projectedViews = [];
    }
    projectedViews.push(view);
  }

  for (let queryId in view.def.nodeMatchedQueries) {
    dirtyParentQuery(queryId, view);
  }

  // update rendering
  const prevView = viewIndex > 0 ? embeddedViews[viewIndex - 1] : null;
  const prevNode = prevView ? prevView.nodes[prevView.def.lastRootNode] : node;
  const prevRenderNode = prevNode.elementOrText.node;
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
  const renderData = node.elementOrText;
  const embeddedViews = renderData.embeddedViews;
  if (viewIndex == null) {
    viewIndex = embeddedViews.length;
  }
  const view = embeddedViews[viewIndex];
  removeFromArray(embeddedViews, viewIndex);

  const dvc = declaredViewContainer(view);
  if (dvc && dvc !== node) {
    const projectedViews = dvc.elementOrText.projectedViews;
    removeFromArray(projectedViews, projectedViews.indexOf(view));
  }

  for (let queryId in view.def.nodeMatchedQueries) {
    dirtyParentQuery(queryId, view);
  }

  // update rendering
  if (view.renderer) {
    view.renderer.detachView(rootRenderNodes(view));
  } else {
    const parentNode = renderData.node.parentNode;
    if (parentNode) {
      directDomAttachDetachSiblingRenderNodes(
          view, 0, DirectDomAction.RemoveChild, parentNode, null);
    }
  }
  return view;
}

function addToArray(arr: any[], index: number, value: any) {
  // perf: array.push is faster than array.splice!
  if (index >= arr.length) {
    arr.push(value);
  } else {
    arr.splice(index, 0, value);
  }
}

function removeFromArray(arr: any[], index: number) {
  // perf: array.pop is faster than array.splice!
  if (index >= arr.length - 1) {
    arr.pop();
  } else {
    arr.splice(index, 1);
  }
}

function dirtyParentQuery(queryId: string, view: ViewData) {
  let nodeIndex = view.parentIndex;
  view = view.parent;
  let providerIdx: number;
  while (view) {
    const nodeDef = view.def.nodes[nodeIndex];
    providerIdx = nodeDef.providerIndices[queryId];
    if (providerIdx != null) {
      break;
    }
    nodeIndex = view.parentIndex;
    view = view.parent;
  }
  if (!view) {
    throw new Error(
        `Illegal State: Tried to dirty parent query ${queryId} but the query could not be found!`);
  }
  const providerData = view.nodes[providerIdx].provider;
  providerData.queries[queryId].setDirty();
}

export function rootRenderNodes(view: ViewData): any[] {
  const renderNodes: any[] = [];
  collectSiblingRenderNodes(view, 0, renderNodes);
  return renderNodes;
}

function collectSiblingRenderNodes(view: ViewData, startIndex: number, target: any[]) {
  for (let i = startIndex; i < view.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    const nodeData = view.nodes[i].elementOrText;
    target.push(nodeData.node);
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
    const nodeData = view.nodes[i].elementOrText;
    switch (action) {
      case DirectDomAction.AppendChild:
        parentNode.appendChild(nodeData.node);
        break;
      case DirectDomAction.InsertBefore:
        parentNode.insertBefore(nodeData.node, nextSibling);
        break;
      case DirectDomAction.RemoveChild:
        parentNode.removeChild(nodeData.node);
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