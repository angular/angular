/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirtyParentQuery} from './query';
import {ElementData, NodeData, NodeFlags, NodeType, ViewData, asElementData, asProviderData, asTextData} from './types';
import {declaredViewContainer, renderNode} from './util';

export function attachEmbeddedView(elementData: ElementData, viewIndex: number, view: ViewData) {
  let embeddedViews = elementData.embeddedViews;
  if (viewIndex == null) {
    viewIndex = embeddedViews.length;
  }
  addToArray(embeddedViews, viewIndex, view);
  const dvcElementData = declaredViewContainer(view);
  if (dvcElementData && dvcElementData !== elementData) {
    let projectedViews = dvcElementData.projectedViews;
    if (!projectedViews) {
      projectedViews = dvcElementData.projectedViews = [];
    }
    projectedViews.push(view);
  }

  for (let queryId in view.def.nodeMatchedQueries) {
    dirtyParentQuery(queryId, view);
  }

  // update rendering
  const prevView = viewIndex > 0 ? embeddedViews[viewIndex - 1] : null;
  const prevRenderNode =
      prevView ? renderNode(prevView, prevView.def.lastRootNode) : elementData.renderElement;
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

export function detachEmbeddedView(elementData: ElementData, viewIndex: number): ViewData {
  const embeddedViews = elementData.embeddedViews;
  if (viewIndex == null) {
    viewIndex = embeddedViews.length;
  }
  const view = embeddedViews[viewIndex];
  removeFromArray(embeddedViews, viewIndex);

  const dvcElementData = declaredViewContainer(view);
  if (dvcElementData && dvcElementData !== elementData) {
    const projectedViews = dvcElementData.projectedViews;
    removeFromArray(projectedViews, projectedViews.indexOf(view));
  }

  for (let queryId in view.def.nodeMatchedQueries) {
    dirtyParentQuery(queryId, view);
  }

  // update rendering
  if (view.renderer) {
    view.renderer.detachView(rootRenderNodes(view));
  } else {
    const parentNode = elementData.renderElement.parentNode;
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

export function rootRenderNodes(view: ViewData): any[] {
  const renderNodes: any[] = [];
  collectSiblingRenderNodes(view, 0, renderNodes);
  return renderNodes;
}

function collectSiblingRenderNodes(view: ViewData, startIndex: number, target: any[]) {
  const nodeCount = view.def.nodes.length;
  for (let i = startIndex; i < nodeCount; i++) {
    const nodeDef = view.def.nodes[i];
    target.push(renderNode(view, nodeDef));
    if (nodeDef.flags & NodeFlags.HasEmbeddedViews) {
      const embeddedViews = asElementData(view, i).embeddedViews;
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
  const nodeCount = view.def.nodes.length;
  for (let i = startIndex; i < nodeCount; i++) {
    const nodeDef = view.def.nodes[i];
    const rn = renderNode(view, nodeDef);
    switch (action) {
      case DirectDomAction.AppendChild:
        parentNode.appendChild(rn);
        break;
      case DirectDomAction.InsertBefore:
        parentNode.insertBefore(rn, nextSibling);
        break;
      case DirectDomAction.RemoveChild:
        parentNode.removeChild(rn);
        break;
    }
    if (nodeDef.flags & NodeFlags.HasEmbeddedViews) {
      const embeddedViews = asElementData(view, i).embeddedViews;
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