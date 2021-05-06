/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {devModeEqual, WrappedValue} from '../change_detection/change_detection';
import {SOURCE} from '../di/injector_compatibility';
import {ViewEncapsulation} from '../metadata/view';
import {RendererType2} from '../render/api_flags';
import {stringify} from '../util/stringify';

import {expressionChangedAfterItHasBeenCheckedError} from './errors';
import {asElementData, asTextData, BindingDef, BindingFlags, Definition, DefinitionFactory, DepDef, DepFlags, ElementData, NodeDef, NodeFlags, QueryValueType, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewState} from './types';

export const NOOP: any = () => {};

const _tokenKeyCache = new Map<any, string>();

export function tokenKey(token: any): string {
  let key = _tokenKeyCache.get(token);
  if (!key) {
    key = stringify(token) + '_' + _tokenKeyCache.size;
    _tokenKeyCache.set(token, key);
  }
  return key;
}

export function unwrapValue(view: ViewData, nodeIdx: number, bindingIdx: number, value: any): any {
  if (WrappedValue.isWrapped(value)) {
    value = WrappedValue.unwrap(value);
    const globalBindingIdx = view.def.nodes[nodeIdx].bindingIndex + bindingIdx;
    const oldValue = WrappedValue.unwrap(view.oldValues[globalBindingIdx]);
    view.oldValues[globalBindingIdx] = new WrappedValue(oldValue);
  }
  return value;
}

const UNDEFINED_RENDERER_TYPE_ID = '$$undefined';
const EMPTY_RENDERER_TYPE_ID = '$$empty';

// Attention: this function is called as top level function.
// Putting any logic in here will destroy closure tree shaking!
export function createRendererType2(values: {
  styles: (string|any[])[],
  encapsulation: ViewEncapsulation,
  data: {[kind: string]: any[]}
}): RendererType2 {
  return {
    id: UNDEFINED_RENDERER_TYPE_ID,
    styles: values.styles,
    encapsulation: values.encapsulation,
    data: values.data
  };
}

let _renderCompCount = 0;

export function resolveRendererType2(type?: RendererType2|null): RendererType2|null {
  if (type && type.id === UNDEFINED_RENDERER_TYPE_ID) {
    // first time we see this RendererType2. Initialize it...
    const isFilled =
        ((type.encapsulation != null && type.encapsulation !== ViewEncapsulation.None) ||
         type.styles.length || Object.keys(type.data).length);
    if (isFilled) {
      type.id = `c${_renderCompCount++}`;
    } else {
      type.id = EMPTY_RENDERER_TYPE_ID;
    }
  }
  if (type && type.id === EMPTY_RENDERER_TYPE_ID) {
    type = null;
  }
  return type || null;
}

export function checkBinding(
    view: ViewData, def: NodeDef, bindingIdx: number, value: any): boolean {
  const oldValues = view.oldValues;
  if ((view.state & ViewState.FirstCheck) ||
      !Object.is(oldValues[def.bindingIndex + bindingIdx], value)) {
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
  if ((view.state & ViewState.BeforeFirstCheck) || !devModeEqual(oldValue, value)) {
    const bindingName = def.bindings[bindingIdx].name;
    throw expressionChangedAfterItHasBeenCheckedError(
        Services.createDebugContext(view, def.nodeIndex), `${bindingName}: ${oldValue}`,
        `${bindingName}: ${value}`, (view.state & ViewState.BeforeFirstCheck) !== 0);
  }
}

export function markParentViewsForCheck(view: ViewData) {
  let currView: ViewData|null = view;
  while (currView) {
    if (currView.def.flags & ViewFlags.OnPush) {
      currView.state |= ViewState.ChecksEnabled;
    }
    currView = currView.viewContainerParent || currView.parent;
  }
}

export function markParentViewsForCheckProjectedViews(view: ViewData, endView: ViewData) {
  let currView: ViewData|null = view;
  while (currView && currView !== endView) {
    currView.state |= ViewState.CheckProjectedViews;
    currView = currView.viewContainerParent || currView.parent;
  }
}

export function dispatchEvent(
    view: ViewData, nodeIndex: number, eventName: string, event: any): boolean|undefined {
  try {
    const nodeDef = view.def.nodes[nodeIndex];
    const startView = nodeDef.flags & NodeFlags.ComponentView ?
        asElementData(view, nodeIndex).componentView :
        view;
    markParentViewsForCheck(startView);
    return Services.handleEvent(view, nodeIndex, eventName, event);
  } catch (e) {
    // Attention: Don't rethrow, as it would cancel Observable subscriptions!
    view.root.errorHandler.handleError(e);
  }
}

export function declaredViewContainer(view: ViewData): ElementData|null {
  if (view.parent) {
    const parentView = view.parent;
    return asElementData(parentView, view.parentNodeDef!.nodeIndex);
  }
  return null;
}

/**
 * for component views, this is the host element.
 * for embedded views, this is the index of the parent node
 * that contains the view container.
 */
export function viewParentEl(view: ViewData): NodeDef|null {
  const parentView = view.parent;
  if (parentView) {
    return view.parentNodeDef!.parent;
  } else {
    return null;
  }
}

export function renderNode(view: ViewData, def: NodeDef): any {
  switch (def.flags & NodeFlags.Types) {
    case NodeFlags.TypeElement:
      return asElementData(view, def.nodeIndex).renderElement;
    case NodeFlags.TypeText:
      return asTextData(view, def.nodeIndex).renderText;
  }
}

export function elementEventFullName(target: string|null, name: string): string {
  return target ? `${target}:${name}` : name;
}

export function isComponentView(view: ViewData): boolean {
  return !!view.parent && !!(view.parentNodeDef!.flags & NodeFlags.Component);
}

export function isEmbeddedView(view: ViewData): boolean {
  return !!view.parent && !(view.parentNodeDef!.flags & NodeFlags.Component);
}

export function filterQueryId(queryId: number): number {
  return 1 << (queryId % 32);
}

export function splitMatchedQueriesDsl(matchedQueriesDsl: [string|number, QueryValueType][]|null): {
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

export function splitDepsDsl(deps: ([DepFlags, any]|any)[], sourceName?: string): DepDef[] {
  return deps.map(value => {
    let token: any;
    let flags: DepFlags;
    if (Array.isArray(value)) {
      [flags, token] = value;
    } else {
      flags = DepFlags.None;
      token = value;
    }
    if (token && (typeof token === 'function' || typeof token === 'object') && sourceName) {
      Object.defineProperty(token, SOURCE, {value: sourceName, configurable: true});
    }
    return {flags, token, tokenKey: tokenKey(token)};
  });
}

export function getParentRenderElement(view: ViewData, renderHost: any, def: NodeDef): any {
  let renderParent = def.renderParent;
  if (renderParent) {
    if ((renderParent.flags & NodeFlags.TypeElement) === 0 ||
        (renderParent.flags & NodeFlags.ComponentView) === 0 ||
        (renderParent.element!.componentRendererType &&
         (renderParent.element!.componentRendererType!.encapsulation ===
              ViewEncapsulation.ShadowDom ||
          // TODO(FW-2290): remove the `encapsulation === 1` fallback logic in v12.
          // @ts-ignore TODO: Remove as part of FW-2290. TS complains about us dealing with an enum
          // value that is not known (but previously was the value for ViewEncapsulation.Native)
          renderParent.element!.componentRendererType!.encapsulation === 1))) {
      // only children of non components, or children of components with native encapsulation should
      // be attached.
      return asElementData(view, def.renderParent!.nodeIndex).renderElement;
    }
  } else {
    return renderHost;
  }
}

const DEFINITION_CACHE = new WeakMap<any, Definition<any>>();

export function resolveDefinition<D extends Definition<any>>(factory: DefinitionFactory<D>): D {
  let value = DEFINITION_CACHE.get(factory)! as D;
  if (!value) {
    value = factory(() => NOOP);
    value.factory = factory;
    DEFINITION_CACHE.set(factory, value);
  }
  return value;
}

export function rootRenderNodes(view: ViewData): any[] {
  const renderNodes: any[] = [];
  visitRootRenderNodes(view, RenderNodeAction.Collect, undefined, undefined, renderNodes);
  return renderNodes;
}

export const enum RenderNodeAction {
  Collect,
  AppendChild,
  InsertBefore,
  RemoveChild
}

export function visitRootRenderNodes(
    view: ViewData, action: RenderNodeAction, parentNode: any, nextSibling: any, target?: any[]) {
  // We need to re-compute the parent node in case the nodes have been moved around manually
  if (action === RenderNodeAction.RemoveChild) {
    parentNode = view.renderer.parentNode(renderNode(view, view.def.lastRenderRootNode!));
  }
  visitSiblingRenderNodes(
      view, action, 0, view.def.nodes.length - 1, parentNode, nextSibling, target);
}

export function visitSiblingRenderNodes(
    view: ViewData, action: RenderNodeAction, startIndex: number, endIndex: number, parentNode: any,
    nextSibling: any, target?: any[]) {
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
    nextSibling: any, target?: any[]) {
  let compView: ViewData|null = view;
  while (compView && !isComponentView(compView)) {
    compView = compView.parent;
  }
  const hostView = compView!.parent;
  const hostElDef = viewParentEl(compView!);
  const startIndex = hostElDef!.nodeIndex + 1;
  const endIndex = hostElDef!.nodeIndex + hostElDef!.childCount;
  for (let i = startIndex; i <= endIndex; i++) {
    const nodeDef = hostView!.def.nodes[i];
    if (nodeDef.ngContentIndex === ngContentIndex) {
      visitRenderNode(hostView!, nodeDef, action, parentNode, nextSibling, target);
    }
    // jump to next sibling
    i += nodeDef.childCount;
  }
  if (!hostView!.parent) {
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
    target?: any[]) {
  if (nodeDef.flags & NodeFlags.TypeNgContent) {
    visitProjectedRenderNodes(
        view, nodeDef.ngContent!.index, action, parentNode, nextSibling, target);
  } else {
    const rn = renderNode(view, nodeDef);
    if (action === RenderNodeAction.RemoveChild && (nodeDef.flags & NodeFlags.ComponentView) &&
        (nodeDef.bindingFlags & BindingFlags.CatSyntheticProperty)) {
      // Note: we might need to do both actions.
      if (nodeDef.bindingFlags & (BindingFlags.SyntheticProperty)) {
        execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
      }
      if (nodeDef.bindingFlags & (BindingFlags.SyntheticHostProperty)) {
        const compView = asElementData(view, nodeDef.nodeIndex).componentView;
        execRenderNodeAction(compView, rn, action, parentNode, nextSibling, target);
      }
    } else {
      execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
    }
    if (nodeDef.flags & NodeFlags.EmbeddedViews) {
      const embeddedViews = asElementData(view, nodeDef.nodeIndex).viewContainer!._embeddedViews;
      for (let k = 0; k < embeddedViews.length; k++) {
        visitRootRenderNodes(embeddedViews[k], action, parentNode, nextSibling, target);
      }
    }
    if (nodeDef.flags & NodeFlags.TypeElement && !nodeDef.element!.name) {
      visitSiblingRenderNodes(
          view, action, nodeDef.nodeIndex + 1, nodeDef.nodeIndex + nodeDef.childCount, parentNode,
          nextSibling, target);
    }
  }
}

function execRenderNodeAction(
    view: ViewData, renderNode: any, action: RenderNodeAction, parentNode: any, nextSibling: any,
    target?: any[]) {
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
      target!.push(renderNode);
      break;
  }
}

const NS_PREFIX_RE = /^:([^:]+):(.+)$/;

export function splitNamespace(name: string): string[] {
  if (name[0] === ':') {
    const match = name.match(NS_PREFIX_RE)!;
    return [match[1], match[2]];
  }
  return ['', name];
}

export function calcBindingFlags(bindings: BindingDef[]): BindingFlags {
  let flags = 0;
  for (let i = 0; i < bindings.length; i++) {
    flags |= bindings[i].flags;
  }
  return flags;
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

export const EMPTY_MAP: {[key: string]: any} = {};
