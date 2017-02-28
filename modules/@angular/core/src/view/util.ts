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
import {Renderer, RendererTypeV2} from '../render/api';

import {expressionChangedAfterItHasBeenCheckedError, isViewDebugError, viewDestroyedError, viewWrappedDebugError} from './errors';
import {DebugContext, ElementData, NodeData, NodeDef, NodeFlags, QueryValueType, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewState, asElementData, asProviderData, asTextData} from './types';

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

export function createRendererTypeV2(values: {
  styles: (string | any[])[],
  encapsulation: ViewEncapsulation,
  data: {[kind: string]: any[]}
}): RendererTypeV2 {
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
  const oldValues = view.oldValues;
  if (unwrapCounter > 0 || !!(view.state & ViewState.FirstCheck) ||
      !looseIdentical(oldValues[def.bindingIndex + bindingIdx], value)) {
    unwrapCounter = 0;
    return true;
  }
  return false;
}

export function checkAndUpdateBinding(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any): boolean {
  if (checkBinding(view, def, bindingIdx, value)) {
    view.oldValues[def.bindingIndex + bindingIdx] = value;
    return true;
  }
  return false;
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

export function markParentViewsForCheck(view: ViewData) {
  let currView = view;
  while (currView) {
    if (currView.def.flags & ViewFlags.OnPush) {
      currView.state |= ViewState.ChecksEnabled;
    }
    currView = currView.viewContainerParent || currView.parent;
  }
}

export function dispatchEvent(
    view: ViewData, nodeIndex: number, eventName: string, event: any): boolean {
  markParentViewsForCheck(view);
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
  switch (def.flags & NodeFlags.Types) {
    case NodeFlags.TypeElement:
      return asElementData(view, def.index).renderElement;
    case NodeFlags.TypeText:
      return asTextData(view, def.index).renderText;
  }
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
  let renderParent = def.renderParent;
  if (renderParent) {
    if ((renderParent.flags & NodeFlags.TypeElement) === 0 ||
        (renderParent.flags & NodeFlags.ComponentView) === 0 ||
        (renderParent.element.componentRendererType &&
         renderParent.element.componentRendererType.encapsulation === ViewEncapsulation.Native)) {
      // only children of non components, or children of components with native encapsulation should
      // be attached.
      return asElementData(view, def.renderParent.index).renderElement;
    }
  } else {
    return renderHost;
  }
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
    parentNode = view.renderer.parentNode(renderNode(view, view.def.lastRenderRootNode));
  }
  visitSiblingRenderNodes(
      view, action, 0, view.def.nodes.length - 1, parentNode, nextSibling, target);
}

export function visitSiblingRenderNodes(
    view: ViewData, action: RenderNodeAction, startIndex: number, endIndex: number, parentNode: any,
    nextSibling: any, target: any[]) {
  for (let i = startIndex; i <= endIndex; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.flags & (NodeFlags.TypeElement | NodeFlags.TypeText | NodeFlags.TypeNgContent)) {
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
  if (nodeDef.flags & NodeFlags.TypeNgContent) {
    visitProjectedRenderNodes(
        view, nodeDef.ngContent.index, action, parentNode, nextSibling, target);
  } else {
    const rn = renderNode(view, nodeDef);
    execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
    if (nodeDef.flags & NodeFlags.EmbeddedViews) {
      const embeddedViews = asElementData(view, nodeDef.index).embeddedViews;
      if (embeddedViews) {
        for (let k = 0; k < embeddedViews.length; k++) {
          visitRootRenderNodes(embeddedViews[k], action, parentNode, nextSibling, target);
        }
      }
    }
    if (nodeDef.flags & NodeFlags.TypeElement && !nodeDef.element.name) {
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

const NS_PREFIX_RE = /^:([^:]+):(.+)$/;

export function splitNamespace(name: string): string[] {
  if (name[0] === ':') {
    const match = name.match(NS_PREFIX_RE);
    return [match[1], match[2]];
  }
  return ['', name];
}

export function interpolate(valueCount: number, constAndInterp: string[]): string {
  let result = '';
  for (let i = 0; i < valueCount * 2; i = i + 2) {
    result = result + constAndInterp[i] + _toStringWithNull(constAndInterp[i + 1]);
  }
  return result + constAndInterp[valueCount * 2];
}

export function inlineInterpolate(
    valueCount: number, c0: string, a1: any, c1: string, a2?: any, c2?: string, a3?: any,
    c3?: string, a4?: any, c4?: string, a5?: any, c5?: string, a6?: any, c6?: string, a7?: any,
    c7?: string, a8?: any, c8?: string, a9?: any, c9?: string): string {
  switch (valueCount) {
    case 1:
      return c0 + _toStringWithNull(a1) + c1;
    case 2:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2;
    case 3:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
          c3;
    case 4:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
          c3 + _toStringWithNull(a4) + c4;
    case 5:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
          c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5;
    case 6:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
          c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) + c6;
    case 7:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
          c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
          c6 + _toStringWithNull(a7) + c7;
    case 8:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
          c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
          c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8;
    case 9:
      return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
          c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
          c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8 + _toStringWithNull(a9) + c9;
    default:
      throw new Error(`Does not support more than 9 expressions`);
  }
}

function _toStringWithNull(v: any): string {
  return v != null ? v.toString() : '';
}

export const EMPTY_ARRAY: any[] = [];
export const EMPTY_MAP: {[key: string]: any} = {};