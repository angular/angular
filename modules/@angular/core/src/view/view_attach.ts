/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirtyParentQueries} from './query';
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

  dirtyParentQueries(view);

  const prevView = viewIndex > 0 ? embeddedViews[viewIndex - 1] : null;
  renderAttachEmbeddedView(elementData, prevView, view);
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

  dirtyParentQueries(view);

  renderDetachEmbeddedView(elementData, view);

  return view;
}

export function moveEmbeddedView(
    elementData: ElementData, oldViewIndex: number, newViewIndex: number): ViewData {
  const embeddedViews = elementData.embeddedViews;
  const view = embeddedViews[oldViewIndex];
  removeFromArray(embeddedViews, oldViewIndex);
  if (newViewIndex == null) {
    newViewIndex = embeddedViews.length;
  }
  addToArray(embeddedViews, newViewIndex, view);

  // Note: Don't need to change projectedViews as the order in there
  // as always invalid...

  dirtyParentQueries(view);

  renderDetachEmbeddedView(elementData, view);
  const prevView = newViewIndex > 0 ? embeddedViews[newViewIndex - 1] : null;
  renderAttachEmbeddedView(elementData, prevView, view);

  return view;
}

function renderAttachEmbeddedView(elementData: ElementData, prevView: ViewData, view: ViewData) {
  const prevRenderNode =
      prevView ? renderNode(prevView, prevView.def.lastRootNode) : elementData.renderElement;
  const parentNode = view.root.renderer.parentNode(prevRenderNode);
  const nextSibling = view.root.renderer.nextSibling(prevRenderNode);
  // Note: We can't check if `nextSibling` is present, as on WebWorkers it will always be!
  // However, browsers automatically do `appendChild` when there is no `nextSibling`.
  visitRootRenderNodes(view, RenderNodeAction.InsertBefore, parentNode, nextSibling, undefined);
}

function renderDetachEmbeddedView(elementData: ElementData, view: ViewData) {
  const parentNode = view.root.renderer.parentNode(elementData.renderElement);
  visitRootRenderNodes(view, RenderNodeAction.RemoveChild, parentNode, null, undefined);
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
