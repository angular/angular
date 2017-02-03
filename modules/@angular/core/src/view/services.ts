/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {Injectable, Injector} from '../di';
import {looseIdentical} from '../facade/lang';
import {ElementRef} from '../linker/element_ref';
import * as v1renderer from '../render/api';
import {Sanitizer, SecurityContext} from '../security';
import {Type} from '../type';

import {isViewDebugError, viewDestroyedError, viewWrappedDebugError} from './errors';
import {resolveDep} from './provider';
import {getQueryValue} from './query';
import {createInjector} from './refs';
import {DirectDomRenderer, LegacyRendererAdapter} from './renderer';
import {ArgumentType, BindingType, DebugContext, DepFlags, ElementData, NodeCheckFn, NodeData, NodeDef, NodeType, RendererV2, RootData, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewState, asElementData, asProviderData} from './types';
import {checkBinding, findElementDef, isComponentView, parentDiIndex, renderNode, resolveViewDefinition, rootRenderNodes} from './util';
import {checkAndUpdateView, checkNoChangesView, createEmbeddedView, createRootView, destroyView} from './view';
import {attachEmbeddedView, detachEmbeddedView, moveEmbeddedView} from './view_attach';

let initialized = false;

export function initServicesIfNeeded() {
  if (initialized) {
    return;
  }
  initialized = true;
  const services = isDevMode() ? createDebugServices() : createProdServices();
  Services.setCurrentNode = services.setCurrentNode;
  Services.createRootView = services.createRootView;
  Services.createEmbeddedView = services.createEmbeddedView;
  Services.checkAndUpdateView = services.checkAndUpdateView;
  Services.checkNoChangesView = services.checkNoChangesView;
  Services.destroyView = services.destroyView;
  Services.attachEmbeddedView = services.attachEmbeddedView,
  Services.detachEmbeddedView = services.detachEmbeddedView,
  Services.moveEmbeddedView = services.moveEmbeddedView;
  Services.resolveDep = services.resolveDep;
  Services.createDebugContext = services.createDebugContext;
  Services.handleEvent = services.handleEvent;
  Services.updateView = services.updateView;
}

function createProdServices() {
  return {
    setCurrentNode: () => {},
    createRootView: createProdRootView,
    createEmbeddedView: createEmbeddedView,
    checkAndUpdateView: checkAndUpdateView,
    checkNoChangesView: checkNoChangesView,
    destroyView: destroyView,
    attachEmbeddedView: attachEmbeddedView,
    detachEmbeddedView: detachEmbeddedView,
    moveEmbeddedView: moveEmbeddedView,
    resolveDep: resolveDep,
    createDebugContext: (view: ViewData, nodeIndex: number) => new DebugContext_(view, nodeIndex),
    handleEvent: (view: ViewData, nodeIndex: number, eventName: string, event: any) =>
                     view.def.handleEvent(view, nodeIndex, eventName, event),
    updateView: (check: NodeCheckFn, view: ViewData) => view.def.update(check, view)
  };
}

function createDebugServices() {
  return {
    setCurrentNode: debugSetCurrentNode,
    createRootView: debugCreateRootView,
    createEmbeddedView: debugCreateEmbeddedView,
    checkAndUpdateView: debugCheckAndUpdateView,
    checkNoChangesView: debugCheckNoChangesView,
    destroyView: debugDestroyView,
    attachEmbeddedView: attachEmbeddedView,
    detachEmbeddedView: detachEmbeddedView,
    moveEmbeddedView: moveEmbeddedView,
    resolveDep: resolveDep,
    createDebugContext: (view: ViewData, nodeIndex: number) => new DebugContext_(view, nodeIndex),
    handleEvent: debugHandleEvent,
    updateView: debugUpdateView
  };
}

function createProdRootView(
    injector: Injector, projectableNodes: any[][], rootSelectorOrNode: string | any,
    def: ViewDefinition, context?: any): ViewData {
  return createRootView(
      createRootData(injector, projectableNodes, rootSelectorOrNode), def, context);
}

function debugCreateRootView(
    injector: Injector, projectableNodes: any[][], rootSelectorOrNode: string | any,
    def: ViewDefinition, context?: any): ViewData {
  const root = createRootData(injector, projectableNodes, rootSelectorOrNode);
  const debugRoot: RootData = {
    injector: root.injector,
    projectableNodes: root.projectableNodes,
    element: root.element,
    renderer: new DebugRenderer(root.renderer),
    sanitizer: root.sanitizer
  };
  return callWithDebugContext('create', createRootView, null, [debugRoot, def, context]);
}

function createRootData(
    injector: Injector, projectableNodes: any[][], rootSelectorOrNode: any): RootData {
  const sanitizer = injector.get(Sanitizer);
  // TODO(tbosch): once the new renderer interface is implemented via platform-browser,
  // just get it via the injector and drop LegacyRendererAdapter and DirectDomRenderer.
  const renderer = isDevMode() ? new LegacyRendererAdapter(injector.get(v1renderer.RootRenderer)) :
                                 new DirectDomRenderer();
  const rootElement =
      rootSelectorOrNode ? renderer.selectRootElement(rootSelectorOrNode) : undefined;
  return {injector, projectableNodes, element: rootElement, sanitizer, renderer};
}

function debugCreateEmbeddedView(parent: ViewData, anchorDef: NodeDef, context?: any): ViewData {
  return callWithDebugContext('create', createEmbeddedView, null, [parent, anchorDef, context]);
}

function debugCheckAndUpdateView(view: ViewData) {
  return callWithDebugContext('detectChanges', checkAndUpdateView, null, [view]);
}

function debugCheckNoChangesView(view: ViewData) {
  return callWithDebugContext('checkNoChanges', checkNoChangesView, null, [view]);
}

function debugDestroyView(view: ViewData) {
  return callWithDebugContext('destroyView', destroyView, null, [view]);
}


let _currentAction: string;
let _currentView: ViewData;
let _currentNodeIndex: number;

function debugSetCurrentNode(view: ViewData, nodeIndex: number) {
  _currentView = view;
  _currentNodeIndex = nodeIndex;
}

function debugHandleEvent(view: ViewData, nodeIndex: number, eventName: string, event: any) {
  if (view.state & ViewState.Destroyed) {
    throw viewDestroyedError(_currentAction);
  }
  debugSetCurrentNode(view, nodeIndex);
  return callWithDebugContext(
      'handleEvent', view.def.handleEvent, null, [view, nodeIndex, eventName, event]);
}

function debugUpdateView(check: NodeCheckFn, view: ViewData) {
  if (view.state & ViewState.Destroyed) {
    throw viewDestroyedError(_currentAction);
  }
  debugSetCurrentNode(view, nextNodeIndexWithBinding(view, 0));
  return view.def.update(debugCheckFn, view);

  function debugCheckFn(
      view: ViewData, nodeIndex: number, argStyle: ArgumentType, v0?: any, v1?: any, v2?: any,
      v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any) {
    const values = argStyle === ArgumentType.Dynamic ? v0 : [].slice.call(arguments, 3);
    const nodeDef = view.def.nodes[nodeIndex];
    for (let i = 0; i < nodeDef.bindings.length; i++) {
      const binding = nodeDef.bindings[i];
      const value = values[i];
      if ((binding.type === BindingType.ElementProperty ||
           binding.type === BindingType.ProviderProperty) &&
          checkBinding(view, nodeDef, i, value)) {
        const elIndex = nodeDef.type === NodeType.Provider ? nodeDef.parent : nodeDef.index;
        setBindingDebugInfo(
            view.root.renderer, asElementData(view, elIndex).renderElement, binding.nonMinifiedName,
            value);
      }
    }
    const result = check(view, nodeIndex, <any>argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);

    debugSetCurrentNode(view, nextNodeIndexWithBinding(view, nodeIndex));
    return result;
  };
}

function setBindingDebugInfo(renderer: RendererV2, renderNode: any, propName: string, value: any) {
  try {
    renderer.setAttribute(
        renderNode, `ng-reflect-${camelCaseToDashCase(propName)}`, value ? value.toString() : null);
  } catch (e) {
    renderer.setAttribute(
        renderNode, `ng-reflect-${camelCaseToDashCase(propName)}`,
        '[ERROR] Exception while trying to serialize the value');
  }
}

const CAMEL_CASE_REGEXP = /([A-Z])/g;

function camelCaseToDashCase(input: string): string {
  return input.replace(CAMEL_CASE_REGEXP, (...m: any[]) => '-' + m[1].toLowerCase());
}

function nextNodeIndexWithBinding(view: ViewData, nodeIndex: number): number {
  for (let i = nodeIndex; i < view.def.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.bindings && nodeDef.bindings.length) {
      return i;
    }
  }
  return undefined;
}


class DebugRenderer implements RendererV2 {
  constructor(private _delegate: RendererV2) {}
  createElement(name: string): any {
    return this._delegate.createElement(name, getCurrentDebugContext());
  }
  createComment(value: string): any {
    return this._delegate.createComment(value, getCurrentDebugContext());
  }
  createText(value: string): any {
    return this._delegate.createText(value, getCurrentDebugContext());
  }
  appendChild(parent: any, newChild: any): void {
    return this._delegate.appendChild(parent, newChild);
  }
  insertBefore(parent: any, newChild: any, refChild: any): void {
    return this._delegate.insertBefore(parent, newChild, refChild);
  }
  removeChild(parent: any, oldChild: any): void {
    return this._delegate.removeChild(parent, oldChild);
  }
  selectRootElement(selectorOrNode: string|any): any {
    return this._delegate.selectRootElement(selectorOrNode, getCurrentDebugContext());
  }
  parentNode(node: any): any { return this._delegate.parentNode(node); }
  nextSibling(node: any): any { return this._delegate.nextSibling(node); }
  setAttribute(el: any, name: string, value: string): void {
    return this._delegate.setAttribute(el, name, value);
  }
  removeAttribute(el: any, name: string): void { return this._delegate.removeAttribute(el, name); }
  addClass(el: any, name: string): void { return this._delegate.addClass(el, name); }
  removeClass(el: any, name: string): void { return this._delegate.removeClass(el, name); }
  setStyle(el: any, style: string, value: any): void {
    return this._delegate.setStyle(el, style, value);
  }
  removeStyle(el: any, style: string): void { return this._delegate.removeStyle(el, style); }
  setProperty(el: any, name: string, value: any): void {
    return this._delegate.setProperty(el, name, value);
  }
  setText(node: any, value: string): void { return this._delegate.setText(node, value); }
  listen(target: 'window'|'document'|any, eventName: string, callback: (event: any) => boolean):
      () => void {
    return this._delegate.listen(target, eventName, callback);
  }
}

class DebugContext_ implements DebugContext {
  private nodeDef: NodeDef;
  private elDef: NodeDef;
  constructor(public view: ViewData, public nodeIndex: number) {
    if (nodeIndex == null) {
      this.nodeIndex = nodeIndex = view.parentIndex;
      this.view = view = view.parent;
    }
    this.nodeDef = view.def.nodes[nodeIndex];
    this.elDef = findElementDef(view, nodeIndex);
  }
  get injector(): Injector { return createInjector(this.view, this.elDef.index); }
  get component(): any { return this.view.component; }
  get providerTokens(): any[] {
    const tokens: any[] = [];
    if (this.elDef) {
      for (let i = this.elDef.index + 1; i <= this.elDef.index + this.elDef.childCount; i++) {
        const childDef = this.view.def.nodes[i];
        if (childDef.type === NodeType.Provider) {
          tokens.push(childDef.provider.token);
        } else {
          i += childDef.childCount;
        }
      }
    }
    return tokens;
  }
  get references(): {[key: string]: any} {
    const references: {[key: string]: any} = {};
    if (this.elDef) {
      collectReferences(this.view, this.elDef, references);

      for (let i = this.elDef.index + 1; i <= this.elDef.index + this.elDef.childCount; i++) {
        const childDef = this.view.def.nodes[i];
        if (childDef.type === NodeType.Provider) {
          collectReferences(this.view, childDef, references);
        } else {
          i += childDef.childCount;
        }
      }
    }
    return references;
  }
  get context(): any { return this.view.context; }
  get source(): string {
    if (this.nodeDef.type === NodeType.Text) {
      return this.nodeDef.text.source;
    } else {
      return this.elDef.element.source;
    }
  }
  get componentRenderElement() {
    const elData = findHostElement(this.view);
    return elData ? elData.renderElement : undefined;
  }
  get renderNode(): any {
    let nodeDef = this.nodeDef.type === NodeType.Text ? this.nodeDef : this.elDef;
    return renderNode(this.view, nodeDef);
  }
}

function findHostElement(view: ViewData): ElementData {
  while (view && !isComponentView(view)) {
    view = view.parent;
  }
  if (view.parent) {
    const hostData = asElementData(view.parent, view.parentIndex);
    return hostData;
  }
  return undefined;
}

function collectReferences(view: ViewData, nodeDef: NodeDef, references: {[key: string]: any}) {
  for (let queryId in nodeDef.matchedQueries) {
    if (queryId.startsWith('#')) {
      references[queryId.slice(1)] = getQueryValue(view, nodeDef, queryId);
    }
  }
}

function callWithDebugContext(action: string, fn: any, self: any, args: any[]) {
  const oldAction = _currentAction;
  const oldView = _currentView;
  const oldNodeIndex = _currentNodeIndex;
  try {
    _currentAction = action;
    const result = fn.apply(self, args);
    _currentView = oldView;
    _currentNodeIndex = oldNodeIndex;
    _currentAction = oldAction;
    return result;
  } catch (e) {
    if (isViewDebugError(e) || !_currentView) {
      throw e;
    }
    throw viewWrappedDebugError(e, getCurrentDebugContext());
  }
}

function getCurrentDebugContext() {
  return new DebugContext_(_currentView, _currentNodeIndex);
}