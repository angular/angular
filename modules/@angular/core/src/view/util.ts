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
import {ViewEncapsulation} from '../metadata/view';
import {ComponentRenderTypeV2, Renderer} from '../render/api';

import {expressionChangedAfterItHasBeenCheckedError, isViewDebugError, viewDestroyedError, viewWrappedDebugError} from './errors';
import {DebugContext, ElementData, NodeData, NodeDef, NodeFlags, NodeType, QueryValueType, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewState, asElementData, asProviderData, asTextData} from './types';

const _tokenKeyCache = new Map<any, string>();

export function tokenKey(token: any): string {
  let key = _tokenKeyCache.get(token);
  if (!key) {
    key = stringify(token) + '_' + _tokenKeyCache.size;
    _tokenKeyCache.set(token, key);
  }
  return key;
}

let unwrapCounter = 0;

export function unwrapValue(value: any): any {
  if (value instanceof WrappedValue) {
    value = value.wrapped;
    unwrapCounter++;
  }
  return value;
}

let _renderCompCount = 0;

export function createComponentRenderTypeV2(values: {
  styles: (string | any[])[],
  encapsulation: ViewEncapsulation,
  data: {[kind: string]: any[]}
}): ComponentRenderTypeV2 {
  const isFilled = values && (values.encapsulation !== ViewEncapsulation.None ||
                              values.styles.length || Object.keys(values.data).length);
  if (isFilled) {
    const id = `c${_renderCompCount++}`;
    return {id: id, styles: values.styles, encapsulation: values.encapsulation, data: values.data};
  } else {
    return null;
  }
}

export function checkBinding(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any): boolean {
  const oldValue = view.oldValues[def.bindingIndex + bindingIdx];
  return unwrapCounter > 0 || !!(view.state & ViewState.FirstCheck) ||
      !devModeEqual(oldValue, value);
}

export function checkBindingNoChanges(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any) {
  const oldValue = view.oldValues[def.bindingIndex + bindingIdx];
  if (unwrapCounter || (view.state & ViewState.FirstCheck) || !devModeEqual(oldValue, value)) {
    unwrapCounter = 0;
    throw expressionChangedAfterItHasBeenCheckedError(
        Services.createDebugContext(view, def.index), oldValue, value,
        (view.state & ViewState.FirstCheck) !== 0);
  }
}

export function checkAndUpdateBinding(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any): boolean {
  const oldValues = view.oldValues;
  if (unwrapCounter || (view.state & ViewState.FirstCheck) ||
      !looseIdentical(oldValues[def.bindingIndex + bindingIdx], value)) {
    unwrapCounter = 0;
    oldValues[def.bindingIndex + bindingIdx] = value;
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

export function declaredViewContainer(view: ViewData): ElementData {
  if (view.parent) {
    const parentView = view.parent;
    return asElementData(parentView, view.parentNodeDef.index);
  }
  return undefined;
}

/**
 * for component views, this is the host element.
 * for embedded views, this is the index of the parent node
 * that contains the view container.
 */
export function viewParentEl(view: ViewData): NodeDef {
  const parentView = view.parent;
  if (parentView) {
    return view.parentNodeDef.parent;
  } else {
    return null;
  }
}

export function renderNode(view: ViewData, def: NodeDef): any {
  switch (def.type) {
    case NodeType.Element:
      return asElementData(view, def.index).renderElement;
    case NodeType.Text:
      return asTextData(view, def.index).renderText;
  }
}

export function nodeValue(view: ViewData, index: number): any {
  const def = view.def.nodes[index];
  switch (def.type) {
    case NodeType.Element:
      return asElementData(view, def.index).renderElement;
    case NodeType.Text:
      return asTextData(view, def.index).renderText;
    case NodeType.Directive:
    case NodeType.Pipe:
    case NodeType.Provider:
      return asProviderData(view, def.index).instance;
  }
  return undefined;
}

export function elementEventFullName(target: string, name: string): string {
  return target ? `${target}:${name}` : name;
}

export function isComponentView(view: ViewData): boolean {
  return view.component === view.context && !!view.parent;
}

export function isEmbeddedView(view: ViewData): boolean {
  return view.component !== view.context && !!view.parent;
}

export function filterQueryId(queryId: number): number {
  return 1 << (queryId % 32);
}

export function splitMatchedQueriesDsl(matchedQueriesDsl: [string | number, QueryValueType][]): {
  matchedQueries: {[queryId: string]: QueryValueType},
  references: {[refId: string]: QueryValueType},
  matchedQueryIds: number
} {
  const matchedQueries: {[queryId: string]: QueryValueType} = {};
  let matchedQueryIds = 0;
  const references: {[refId: string]: QueryValueType} = {};
  if (matchedQueriesDsl) {
    matchedQueriesDsl.forEach(([queryId, valueType]) => {
      if (typeof queryId === 'number') {
        matchedQueries[queryId] = valueType;
        matchedQueryIds |= filterQueryId(queryId);
      } else {
        references[queryId] = valueType;
      }
    });
  }
  return {matchedQueries, references, matchedQueryIds};
}

export function getParentRenderElement(view: ViewData, renderHost: any, def: NodeDef): any {
  let parentEl: any;
  if (!def.parent) {
    parentEl = renderHost;
  } else if (def.renderParent) {
    parentEl = asElementData(view, def.renderParent.index).renderElement;
  }
  return parentEl;
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
  // We need to re-compute the parent node in case the nodes have been moved around manually
  if (action === RenderNodeAction.RemoveChild) {
    parentNode = view.renderer.parentNode(renderNode(view, view.def.lastRootNode));
  }
  visitSiblingRenderNodes(
      view, action, 0, view.def.nodes.length - 1, parentNode, nextSibling, target);
}

export function visitSiblingRenderNodes(
    view: ViewData, action: RenderNodeAction, startIndex: number, endIndex: number, parentNode: any,
    nextSibling: any, target: any[]) {
  for (let i = startIndex; i <= endIndex; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.type === NodeType.Element || nodeDef.type === NodeType.Text ||
        nodeDef.type === NodeType.NgContent) {
      visitRenderNode(view, nodeDef, action, parentNode, nextSibling, target);
    }
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
  const hostElDef = viewParentEl(compView);
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
    if (nodeDef.type === NodeType.Element && !nodeDef.element.name) {
      visitSiblingRenderNodes(
          view, action, nodeDef.index + 1, nodeDef.index + nodeDef.childCount, parentNode,
          nextSibling, target);
    }
  }
}

function execRenderNodeAction(
    view: ViewData, renderNode: any, action: RenderNodeAction, parentNode: any, nextSibling: any,
    target: any[]) {
  const renderer = view.renderer;
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
