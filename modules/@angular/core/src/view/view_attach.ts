/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirtyParentQuery} from './query';
import {ElementData, NodeData, NodeDef, NodeFlags, NodeType, ViewData, asElementData, asProviderData, asTextData} from './types';
import {RenderNodeAction, declaredViewContainer, isComponentView, renderNode, rootRenderNodes, visitProjectedRenderNodes, visitRootRenderNodes} from './util';

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
      const action = nextSibling ? RenderNodeAction.InsertBefore : RenderNodeAction.AppendChild;
      visitRootRenderNodes(view, action, parentNode, nextSibling, undefined);
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
      visitRootRenderNodes(view, RenderNodeAction.RemoveChild, parentNode, null, undefined);
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
