/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {Injector} from '../di';
import {RendererV2} from '../render/api';
import {Sanitizer, SecurityContext} from '../security';

import {isViewDebugError, viewDestroyedError, viewWrappedDebugError} from './errors';
import {resolveDep} from './provider';
import {getQueryValue} from './query';
import {createInjector} from './refs';
import {ArgumentType, BindingType, DebugContext, DepFlags, ElementData, NodeCheckFn, NodeData, NodeDef, NodeFlags, NodeType, RootData, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewState, asElementData, asProviderData} from './types';
import {checkBinding, isComponentView, renderNode, viewParentEl} from './util';
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
  Services.updateDirectives = services.updateDirectives;
  Services.updateRenderer = services.updateRenderer;
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
    updateDirectives: (check: NodeCheckFn, view: ViewData) =>
                          view.def.updateDirectives(check, view),
    updateRenderer: (check: NodeCheckFn, view: ViewData) => view.def.updateRenderer(check, view),
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
    updateDirectives: debugUpdateDirectives,
    updateRenderer: debugUpdateRenderer
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
    selectorOrNode: root.selectorOrNode,
    renderer: new DebugRenderer(root.renderer),
    sanitizer: root.sanitizer
  };
  return callWithDebugContext('create', createRootView, null, [debugRoot, def, context]);
}

function createRootData(
    injector: Injector, projectableNodes: any[][], rootSelectorOrNode: any): RootData {
  const sanitizer = injector.get(Sanitizer);
  const renderer = injector.get(RendererV2);

  const rootElement =
      rootSelectorOrNode ? renderer.selectRootElement(rootSelectorOrNode) : undefined;
  return {injector, projectableNodes, selectorOrNode: rootSelectorOrNode, sanitizer, renderer};
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

function debugUpdateDirectives(check: NodeCheckFn, view: ViewData) {
  if (view.state & ViewState.Destroyed) {
    throw viewDestroyedError(_currentAction);
  }
  debugSetCurrentNode(view, nextDirectiveWithBinding(view, 0));
  return view.def.updateDirectives(debugCheckDirectivesFn, view);

  function debugCheckDirectivesFn(
      view: ViewData, nodeIndex: number, argStyle: ArgumentType, ...values: any[]) {
    const result = debugCheckFn(check, view, nodeIndex, argStyle, values);
    debugSetCurrentNode(view, nextDirectiveWithBinding(view, nodeIndex));
    return result;
  };
}

function debugUpdateRenderer(check: NodeCheckFn, view: ViewData) {
  if (view.state & ViewState.Destroyed) {
    throw viewDestroyedError(_currentAction);
  }
  debugSetCurrentNode(view, nextRenderNodeWithBinding(view, 0));
  return view.def.updateRenderer(debugCheckRenderNodeFn, view);

  function debugCheckRenderNodeFn(
      view: ViewData, nodeIndex: number, argStyle: ArgumentType, ...values: any[]) {
    const result = debugCheckFn(check, view, nodeIndex, argStyle, values);
    debugSetCurrentNode(view, nextRenderNodeWithBinding(view, nodeIndex));
    return result;
  }
}

function debugCheckFn(
    delegate: NodeCheckFn, view: ViewData, nodeIndex: number, argStyle: ArgumentType,
    givenValues: any[]) {
  const values = argStyle === ArgumentType.Dynamic ? givenValues[0] : givenValues;
  const nodeDef = view.def.nodes[nodeIndex];
  for (let i = 0; i < nodeDef.bindings.length; i++) {
    const binding = nodeDef.bindings[i];
    const value = values[i];
    if ((binding.type === BindingType.ElementProperty ||
         binding.type === BindingType.DirectiveProperty) &&
        checkBinding(view, nodeDef, i, value)) {
      const elDef = nodeDef.type === NodeType.Directive ? nodeDef.parent : nodeDef;
      setBindingDebugInfo(
          view.root.renderer, asElementData(view, elDef.index).renderElement,
          binding.nonMinifiedName, value);
    }
  }
  return (<any>delegate)(view, nodeIndex, argStyle, ...givenValues);
};

function setBindingDebugInfo(renderer: RendererV2, renderNode: any, propName: string, value: any) {
  const renderName = `ng-reflect-${camelCaseToDashCase(propName)}`;
  if (value) {
    try {
      renderer.setBindingDebugInfo(renderNode, renderName, value.toString());
    } catch (e) {
      renderer.setBindingDebugInfo(
          renderNode, renderName, '[ERROR] Exception while trying to serialize the value');
    }
  } else {
    renderer.removeBindingDebugInfo(renderNode, renderName);
  }
}

const CAMEL_CASE_REGEXP = /([A-Z])/g;

function camelCaseToDashCase(input: string): string {
  return input.replace(CAMEL_CASE_REGEXP, (...m: any[]) => '-' + m[1].toLowerCase());
}

function nextDirectiveWithBinding(view: ViewData, nodeIndex: number): number {
  for (let i = nodeIndex; i < view.def.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.type === NodeType.Directive && nodeDef.bindings && nodeDef.bindings.length) {
      return i;
    }
  }
  return undefined;
}

function nextRenderNodeWithBinding(view: ViewData, nodeIndex: number): number {
  for (let i = nodeIndex; i < view.def.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    if ((nodeDef.type === NodeType.Element || nodeDef.type === NodeType.Text) && nodeDef.bindings &&
        nodeDef.bindings.length) {
      return i;
    }
  }
  return undefined;
}

class DebugRenderer implements RendererV2 {
  constructor(private _delegate: RendererV2) {}

  createElement(name: string, namespace?: string): any {
    return this._delegate.createElement(name, namespace, getCurrentDebugContext());
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
  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    return this._delegate.setAttribute(el, name, value, namespace);
  }
  removeAttribute(el: any, name: string, namespace?: string): void {
    return this._delegate.removeAttribute(el, name, namespace);
  }
  setBindingDebugInfo(el: any, propertyName: string, propertyValue: string): void {
    this._delegate.setBindingDebugInfo(el, propertyName, propertyValue);
  }
  removeBindingDebugInfo(el: any, propertyName: string): void {
    this._delegate.removeBindingDebugInfo(el, propertyName);
  }
  addClass(el: any, name: string): void { return this._delegate.addClass(el, name); }
  removeClass(el: any, name: string): void { return this._delegate.removeClass(el, name); }
  setStyle(el: any, style: string, value: any, hasVendorPrefix: boolean, hasImportant: boolean):
      void {
    return this._delegate.setStyle(el, style, value, hasVendorPrefix, hasImportant);
  }
  removeStyle(el: any, style: string, hasVendorPrefix: boolean): void {
    return this._delegate.removeStyle(el, style, hasVendorPrefix);
  }
  setProperty(el: any, name: string, value: any): void {
    return this._delegate.setProperty(el, name, value);
  }
  setText(node: any, value: string): void { return this._delegate.setText(node, value); }
  listen(
      target: 'window'|'document'|'body'|any, eventName: string,
      callback: (event: any) => boolean): () => void {
    return this._delegate.listen(target, eventName, callback);
  }
}

class DebugContext_ implements DebugContext {
  private nodeDef: NodeDef;
  private elView: ViewData;
  private elDef: NodeDef;
  private compProviderDef: NodeDef;
  constructor(public view: ViewData, public nodeIndex: number) {
    if (nodeIndex == null) {
      this.nodeIndex = 0;
    }
    this.nodeDef = view.def.nodes[nodeIndex];
    let elDef = this.nodeDef;
    let elView = view;
    while (elDef && elDef.type !== NodeType.Element) {
      elDef = elDef.parent;
    }
    if (!elDef) {
      while (!elDef && elView) {
        elDef = viewParentEl(elView);
        elView = elView.parent;
      }
    }
    this.elDef = elDef;
    this.elView = elView;
    this.compProviderDef = elView ? this.elDef.element.component : null;
  }
  get injector(): Injector { return createInjector(this.elView, this.elDef); }
  get component(): any {
    if (this.compProviderDef) {
      return asProviderData(this.elView, this.compProviderDef.index).instance;
    }
    return this.view.component;
  }
  get context(): any {
    if (this.compProviderDef) {
      return asProviderData(this.elView, this.compProviderDef.index).instance;
    }
    return this.view.context;
  }
  get providerTokens(): any[] {
    const tokens: any[] = [];
    if (this.elDef) {
      for (let i = this.elDef.index + 1; i <= this.elDef.index + this.elDef.childCount; i++) {
        const childDef = this.elView.def.nodes[i];
        if (childDef.type === NodeType.Provider || childDef.type === NodeType.Directive) {
          tokens.push(childDef.provider.token);
        }
        i += childDef.childCount;
      }
    }
    return tokens;
  }
  get references(): {[key: string]: any} {
    const references: {[key: string]: any} = {};
    if (this.elDef) {
      collectReferences(this.elView, this.elDef, references);

      for (let i = this.elDef.index + 1; i <= this.elDef.index + this.elDef.childCount; i++) {
        const childDef = this.elView.def.nodes[i];
        if (childDef.type === NodeType.Provider || childDef.type === NodeType.Directive) {
          collectReferences(this.elView, childDef, references);
        }
        i += childDef.childCount;
      }
    }
    return references;
  }
  get source(): string {
    if (this.nodeDef.type === NodeType.Text) {
      return this.nodeDef.text.source;
    } else {
      return this.elDef.element.source;
    }
  }
  get componentRenderElement() {
    const view = this.compProviderDef ?
        asProviderData(this.elView, this.compProviderDef.index).componentView :
        this.view;
    const elData = findHostElement(view);
    return elData ? elData.renderElement : undefined;
  }
  get renderNode(): any {
    return this.nodeDef.type === NodeType.Text ? renderNode(this.view, this.nodeDef) :
                                                 renderNode(this.elView, this.elDef);
  }
}

function findHostElement(view: ViewData): ElementData {
  while (view && !isComponentView(view)) {
    view = view.parent;
  }
  if (view.parent) {
    return asElementData(view.parent, viewParentEl(view).index);
  }
  return undefined;
}

function collectReferences(view: ViewData, nodeDef: NodeDef, references: {[key: string]: any}) {
  for (let refName in nodeDef.references) {
    references[refName] = getQueryValue(view, nodeDef, nodeDef.references[refName]);
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
    _currentView.state |= ViewState.Errored;
    throw viewWrappedDebugError(e, getCurrentDebugContext());
  }
}

function getCurrentDebugContext() {
  return new DebugContext_(_currentView, _currentNodeIndex);
}