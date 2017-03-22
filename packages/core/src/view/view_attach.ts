/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementData, Services, ViewData} from './types';
import {RenderNodeAction, declaredViewContainer, renderNode, visitRootRenderNodes} from './util';

export function attachEmbeddedView(
    parentView: ViewData, elementData: ElementData, viewIndex: number | undefined | null,
    view: ViewData) {
  let embeddedViews = elementData.viewContainer !._embeddedViews;
  if (viewIndex === null || viewIndex === undefined) {
    viewIndex = embeddedViews.length;
  }
  view.viewContainerParent = parentView;
  addToArray(embeddedViews, viewIndex !, view);
  const dvcElementData = declaredViewContainer(view);
  if (dvcElementData && dvcElementData !== elementData) {
    let projectedViews = dvcElementData.template._projectedViews;
    if (!projectedViews) {
      projectedViews = dvcElementData.template._projectedViews = [];
    }
    projectedViews.push(view);
  }

  Services.dirtyParentQueries(view);

  const prevView = viewIndex ! > 0 ? embeddedViews[viewIndex ! - 1] : null;
  renderAttachEmbeddedView(elementData, prevView, view);
}

export function detachEmbeddedView(elementData: ElementData, viewIndex?: number): ViewData|null {
  const embeddedViews = elementData.viewContainer !._embeddedViews;
  if (viewIndex == null || viewIndex >= embeddedViews.length) {
    viewIndex = embeddedViews.length - 1;
  }
  if (viewIndex < 0) {
    return null;
  }
  const view = embeddedViews[viewIndex];
  view.viewContainerParent = null;
  removeFromArray(embeddedViews, viewIndex);

  const dvcElementData = declaredViewContainer(view);
  if (dvcElementData && dvcElementData !== elementData) {
    const projectedViews = dvcElementData.template._projectedViews;
    removeFromArray(projectedViews, projectedViews.indexOf(view));
  }

  Services.dirtyParentQueries(view);

  renderDetachView(view);

  return view;
}

export function moveEmbeddedView(
    elementData: ElementData, oldViewIndex: number, newViewIndex: number): ViewData {
  const embeddedViews = elementData.viewContainer !._embeddedViews;
  const view = embeddedViews[oldViewIndex];
  removeFromArray(embeddedViews, oldViewIndex);
  if (newViewIndex == null) {
    newViewIndex = embeddedViews.length;
  }
  addToArray(embeddedViews, newViewIndex, view);

  // Note: Don't need to change projectedViews as the order in there
  // as always invalid...

  Services.dirtyParentQueries(view);

  renderDetachView(view);
  const prevView = newViewIndex > 0 ? embeddedViews[newViewIndex - 1] : null;
  renderAttachEmbeddedView(elementData, prevView, view);

  return view;
}

function renderAttachEmbeddedView(
    elementData: ElementData, prevView: ViewData | null, view: ViewData) {
  const prevRenderNode = prevView ? renderNode(prevView, prevView.def.lastRenderRootNode !) :
                                    elementData.renderElement;
  const parentNode = view.renderer.parentNode(prevRenderNode);
  const nextSibling = view.renderer.nextSibling(prevRenderNode);
  // Note: We can't check if `nextSibling` is present, as on WebWorkers it will always be!
  // However, browsers automatically do `appendChild` when there is no `nextSibling`.
  visitRootRenderNodes(view, RenderNodeAction.InsertBefore, parentNode, nextSibling, undefined);
}

export function renderDetachView(view: ViewData) {
  visitRootRenderNodes(view, RenderNodeAction.RemoveChild, null, null, undefined);
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
