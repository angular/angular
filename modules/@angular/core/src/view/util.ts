/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {WrappedValue, devModeEqual} from '../change_detection/change_detection';
import {SimpleChange} from '../change_detection/change_detection_util';
import {Injector} from '../di';
import {looseIdentical, stringify} from '../facade/lang';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {ViewRef} from '../linker/view_ref';
import {Renderer} from '../render/api';

import {expressionChangedAfterItHasBeenCheckedError, isViewDebugError, viewDestroyedError, viewWrappedDebugError} from './errors';
import {DebugContext, ElementData, NodeData, NodeDef, NodeFlags, NodeType, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewState, asElementData, asProviderData, asTextData} from './types';

const _tokenKeyCache = new Map<any, string>();

export function tokenKey(token: any): string {
  let key = _tokenKeyCache.get(token);
  if (!key) {
    key = stringify(token) + '_' + _tokenKeyCache.size;
    _tokenKeyCache.set(token, key);
  }
  return key;
}

export function checkBinding(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any): boolean {
  const oldValue = view.oldValues[def.bindingIndex + bindingIdx];
  return !!(view.state & ViewState.FirstCheck) || !devModeEqual(oldValue, value);
}

export function checkBindingNoChanges(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any) {
  const oldValue = view.oldValues[def.bindingIndex + bindingIdx];
  if ((view.state & ViewState.FirstCheck) || !devModeEqual(oldValue, value)) {
    throw expressionChangedAfterItHasBeenCheckedError(
        Services.createDebugContext(view, def.index), oldValue, value,
        (view.state & ViewState.FirstCheck) !== 0);
  }
}

export function checkAndUpdateBinding(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any): boolean {
  const oldValues = view.oldValues;
  if ((view.state & ViewState.FirstCheck) ||
      !looseIdentical(oldValues[def.bindingIndex + bindingIdx], value)) {
    oldValues[def.bindingIndex + bindingIdx] = value;
    if (def.flags & NodeFlags.HasComponent) {
      const compView = asProviderData(view, def.index).componentView;
      if (compView.def.flags & ViewFlags.OnPush) {
        compView.state |= ViewState.ChecksEnabled;
      }
    }
    return true;
  }
  return false;
}

export function dispatchEvent(
    view: ViewData, nodeIndex: number, eventName: string, event: any): boolean {
  let currView = view;
  while (currView) {
    if (currView.def.flags & ViewFlags.OnPush) {
      currView.state |= ViewState.ChecksEnabled;
    }
    currView = currView.parent;
  }
  return Services.handleEvent(view, nodeIndex, eventName, event);
}

export function unwrapValue(value: any): any {
  if (value instanceof WrappedValue) {
    value = value.wrapped;
  }
  return value;
}

export function declaredViewContainer(view: ViewData): ElementData {
  if (view.parent) {
    const parentView = view.parent;
    return asElementData(parentView, view.parentIndex);
  }
  return undefined;
}

/**
 * for component views, this is the same as parentIndex.
 * for embedded views, this is the index of the parent node
 * that contains the view container.
 */
export function parentDiIndex(view: ViewData): number {
  if (view.parent) {
    const parentNodeDef = view.def.nodes[view.parentIndex];
    return parentNodeDef.element && parentNodeDef.element.template ? parentNodeDef.parent :
                                                                     parentNodeDef.index;
  }
  return view.parentIndex;
}

export function findElementDef(view: ViewData, nodeIndex: number): NodeDef {
  const viewDef = view.def;
  let nodeDef = viewDef.nodes[nodeIndex];
  while (nodeDef) {
    if (nodeDef.type === NodeType.Element) {
      return nodeDef;
    }
    nodeDef = nodeDef.parent != null ? viewDef.nodes[nodeDef.parent] : undefined;
  }
  return undefined;
}

export function renderNode(view: ViewData, def: NodeDef): any {
  switch (def.type) {
    case NodeType.Element:
      return asElementData(view, def.index).renderElement;
    case NodeType.Text:
      return asTextData(view, def.index).renderText;
  }
}

export function isComponentView(view: ViewData): boolean {
  return view.component === view.context && !!view.parent;
}

const VIEW_DEFINITION_CACHE = new WeakMap<any, ViewDefinition>();

export function resolveViewDefinition(factory: ViewDefinitionFactory): ViewDefinition {
  let value: ViewDefinition = VIEW_DEFINITION_CACHE.get(factory);
  if (!value) {
    value = factory();
    VIEW_DEFINITION_CACHE.set(factory, value);
  }
  return value;
}

export function sliceErrorStack(start: number, end: number): string {
  let err: any;
  try {
    throw new Error();
  } catch (e) {
    err = e;
  }
  const stack = err.stack || '';
  const lines = stack.split('\n');
  if (lines[0].startsWith('Error')) {
    // Chrome always adds the message to the stack as well...
    start++;
    end++;
  }
  return lines.slice(start, end).join('\n');
}

export function rootRenderNodes(view: ViewData): any[] {
  const renderNodes: any[] = [];
  visitRootRenderNodes(view, RenderNodeAction.Collect, undefined, undefined, renderNodes);
  return renderNodes;
}

export enum RenderNodeAction {
  Collect,
  AppendChild,
  InsertBefore,
  RemoveChild
}

export function visitRootRenderNodes(
    view: ViewData, action: RenderNodeAction, parentNode: any, nextSibling: any, target: any[]) {
  const len = view.def.nodes.length;
  for (let i = 0; i < len; i++) {
    const nodeDef = view.def.nodes[i];
    visitRenderNode(view, nodeDef, action, parentNode, nextSibling, target);
    // jump to next sibling
    i += nodeDef.childCount;
  }
}

export function visitProjectedRenderNodes(
    view: ViewData, ngContentIndex: number, action: RenderNodeAction, parentNode: any,
    nextSibling: any, target: any[]) {
  let compView = view;
  while (compView && !isComponentView(compView)) {
    compView = compView.parent;
  }
  const hostView = compView.parent;
  const hostElDef = hostView.def.nodes[compView.parentIndex];
  const startIndex = hostElDef.index + 1;
  const endIndex = hostElDef.index + hostElDef.childCount;
  for (let i = startIndex; i <= endIndex; i++) {
    const nodeDef = hostView.def.nodes[i];
    if (nodeDef.ngContentIndex === ngContentIndex) {
      visitRenderNode(hostView, nodeDef, action, parentNode, nextSibling, target);
    }
    // jump to next sibling
    i += nodeDef.childCount;
  }
  if (!hostView.parent) {
    // a root view
    const projectedNodes = view.root.projectableNodes[ngContentIndex];
    if (projectedNodes) {
      for (let i = 0; i < projectedNodes.length; i++) {
        execRenderNodeAction(view, projectedNodes[i], action, parentNode, nextSibling, target);
      }
    }
  }
}

function visitRenderNode(
    view: ViewData, nodeDef: NodeDef, action: RenderNodeAction, parentNode: any, nextSibling: any,
    target: any[]) {
  if (nodeDef.type === NodeType.NgContent) {
    visitProjectedRenderNodes(
        view, nodeDef.ngContent.index, action, parentNode, nextSibling, target);
  } else {
    const rn = renderNode(view, nodeDef);
    execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
    if (nodeDef.flags & NodeFlags.HasEmbeddedViews) {
      const embeddedViews = asElementData(view, nodeDef.index).embeddedViews;
      if (embeddedViews) {
        for (let k = 0; k < embeddedViews.length; k++) {
          visitRootRenderNodes(embeddedViews[k], action, parentNode, nextSibling, target);
        }
      }
    }
  }
}

function execRenderNodeAction(
    view: ViewData, renderNode: any, action: RenderNodeAction, parentNode: any, nextSibling: any,
    target: any[]) {
  const renderer = view.root.renderer;
  switch (action) {
    case RenderNodeAction.AppendChild:
      renderer.appendChild(parentNode, renderNode);
      break;
    case RenderNodeAction.InsertBefore:
      renderer.insertBefore(parentNode, renderNode, nextSibling);
      break;
    case RenderNodeAction.RemoveChild:
      renderer.removeChild(parentNode, renderNode);
      break;
    case RenderNodeAction.Collect:
      target.push(renderNode);
      break;
  }
}
