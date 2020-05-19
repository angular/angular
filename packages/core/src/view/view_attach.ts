/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {addToArray, removeFromArray} from '../util/array_utils';

import {ElementData, NodeDef, NodeFlags, Services, ViewData, ViewDefinition, ViewState} from './types';
import {declaredViewContainer, renderNode, RenderNodeAction, visitRootRenderNodes} from './util';

export function attachEmbeddedView(
    parentView: ViewData, elementData: ElementData, viewIndex: number|undefined|null,
    view: ViewData) {
  let embeddedViews = elementData.viewContainer!._embeddedViews;
  if (viewIndex === null || viewIndex === undefined) {
    viewIndex = embeddedViews.length;
  }
  view.viewContainerParent = parentView;
  addToArray(embeddedViews, viewIndex!, view);
  attachProjectedView(elementData, view);

  Services.dirtyParentQueries(view);

  const prevView = viewIndex! > 0 ? embeddedViews[viewIndex! - 1] : null;
  renderAttachEmbeddedView(elementData, prevView, view);
}

function attachProjectedView(vcElementData: ElementData, view: ViewData) {
  const dvcElementData = declaredViewContainer(view);
  if (!dvcElementData || dvcElementData === vcElementData ||
      view.state & ViewState.IsProjectedView) {
    return;
  }
  // Note: For performance reasons, we
  // - add a view to template._projectedViews only 1x throughout its lifetime,
  //   and remove it not until the view is destroyed.
  //   (hard, as when a parent view is attached/detached we would need to attach/detach all
  //    nested projected views as well, even across component boundaries).
  // - don't track the insertion order of views in the projected views array
  //   (hard, as when the views of the same template are inserted different view containers)
  view.state |= ViewState.IsProjectedView;
  let projectedViews = dvcElementData.template._projectedViews;
  if (!projectedViews) {
    projectedViews = dvcElementData.template._projectedViews = [];
  }
  projectedViews.push(view);
  // Note: we are changing the NodeDef here as we cannot calculate
  // the fact whether a template is used for projection during compilation.
  markNodeAsProjectedTemplate(view.parent!.def, view.parentNodeDef!);
}

function markNodeAsProjectedTemplate(viewDef: ViewDefinition, nodeDef: NodeDef) {
  if (nodeDef.flags & NodeFlags.ProjectedTemplate) {
    return;
  }
  viewDef.nodeFlags |= NodeFlags.ProjectedTemplate;
  nodeDef.flags |= NodeFlags.ProjectedTemplate;
  let parentNodeDef = nodeDef.parent;
  while (parentNodeDef) {
    parentNodeDef.childFlags |= NodeFlags.ProjectedTemplate;
    parentNodeDef = parentNodeDef.parent;
  }
}

export function detachEmbeddedView(elementData: ElementData, viewIndex?: number): ViewData|null {
  const embeddedViews = elementData.viewContainer!._embeddedViews;
  if (viewIndex == null || viewIndex >= embeddedViews.length) {
    viewIndex = embeddedViews.length - 1;
  }
  if (viewIndex < 0) {
    return null;
  }
  const view = embeddedViews[viewIndex];
  view.viewContainerParent = null;
  removeFromArray(embeddedViews, viewIndex);

  // See attachProjectedView for why we don't update projectedViews here.
  Services.dirtyParentQueries(view);

  renderDetachView(view);

  return view;
}

export function detachProjectedView(view: ViewData) {
  if (!(view.state & ViewState.IsProjectedView)) {
    return;
  }
  const dvcElementData = declaredViewContainer(view);
  if (dvcElementData) {
    const projectedViews = dvcElementData.template._projectedViews;
    if (projectedViews) {
      removeFromArray(projectedViews, projectedViews.indexOf(view));
      Services.dirtyParentQueries(view);
    }
  }
}

export function moveEmbeddedView(
    elementData: ElementData, oldViewIndex: number, newViewIndex: number): ViewData {
  const embeddedViews = elementData.viewContainer!._embeddedViews;
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
    elementData: ElementData, prevView: ViewData|null, view: ViewData) {
  const prevRenderNode =
      prevView ? renderNode(prevView, prevView.def.lastRenderRootNode!) : elementData.renderElement;
  const parentNode = view.renderer.parentNode(prevRenderNode);
  const nextSibling = view.renderer.nextSibling(prevRenderNode);
  // Note: We can't check if `nextSibling` is present, as on WebWorkers it will always be!
  // However, browsers automatically do `appendChild` when there is no `nextSibling`.
  visitRootRenderNodes(view, RenderNodeAction.InsertBefore, parentNode, nextSibling, undefined);
}

export function renderDetachView(view: ViewData) {
  visitRootRenderNodes(view, RenderNodeAction.RemoveChild, null, null, undefined);
}
