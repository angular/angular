/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {DebugElement, DebugNode, EventListener, getDebugNode, indexDebugNode, removeDebugNodeFromIndex} from '../debug/debug_node';
import {Injector} from '../di';
import {ErrorHandler} from '../error_handler';
import {NgModuleRef} from '../linker/ng_module_factory';
import {Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2} from '../render/api';
import {Sanitizer} from '../security';
import {Type} from '../type';

import {isViewDebugError, viewDestroyedError, viewWrappedDebugError} from './errors';
import {resolveDep} from './provider';
import {dirtyParentQueries, getQueryValue} from './query';
import {createInjector, createNgModuleRef} from './refs';
import {ArgumentType, BindingFlags, CheckType, DebugContext, DepDef, ElementData, NgModuleDefinition, NgModuleProviderDef, NodeDef, NodeFlags, NodeLogger, ProviderOverride, RootData, Services, ViewData, ViewDefinition, ViewState, asElementData, asPureExpressionData} from './types';
import {NOOP, isComponentView, renderNode, splitDepsDsl, viewParentEl} from './util';
import {checkAndUpdateNode, checkAndUpdateView, checkNoChangesNode, checkNoChangesView, createComponentView, createEmbeddedView, createRootView, destroyView} from './view';


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
  Services.createComponentView = services.createComponentView;
  Services.createNgModuleRef = services.createNgModuleRef;
  Services.overrideProvider = services.overrideProvider;
  Services.clearProviderOverrides = services.clearProviderOverrides;
  Services.checkAndUpdateView = services.checkAndUpdateView;
  Services.checkNoChangesView = services.checkNoChangesView;
  Services.destroyView = services.destroyView;
  Services.resolveDep = resolveDep;
  Services.createDebugContext = services.createDebugContext;
  Services.handleEvent = services.handleEvent;
  Services.updateDirectives = services.updateDirectives;
  Services.updateRenderer = services.updateRenderer;
  Services.dirtyParentQueries = dirtyParentQueries;
}

function createProdServices() {
  return {
    setCurrentNode: () => {},
    createRootView: createProdRootView,
    createEmbeddedView: createEmbeddedView,
    createComponentView: createComponentView,
    createNgModuleRef: createNgModuleRef,
    overrideProvider: NOOP,
    clearProviderOverrides: NOOP,
    checkAndUpdateView: checkAndUpdateView,
    checkNoChangesView: checkNoChangesView,
    destroyView: destroyView,
    createDebugContext: (view: ViewData, nodeIndex: number) => new DebugContext_(view, nodeIndex),
    handleEvent: (view: ViewData, nodeIndex: number, eventName: string, event: any) =>
                     view.def.handleEvent(view, nodeIndex, eventName, event),
    updateDirectives: (view: ViewData, checkType: CheckType) => view.def.updateDirectives(
                          checkType === CheckType.CheckAndUpdate ? prodCheckAndUpdateNode :
                                                                   prodCheckNoChangesNode,
                          view),
    updateRenderer: (view: ViewData, checkType: CheckType) => view.def.updateRenderer(
                        checkType === CheckType.CheckAndUpdate ? prodCheckAndUpdateNode :
                                                                 prodCheckNoChangesNode,
                        view),
  };
}

function createDebugServices() {
  return {
    setCurrentNode: debugSetCurrentNode,
    createRootView: debugCreateRootView,
    createEmbeddedView: debugCreateEmbeddedView,
    createComponentView: debugCreateComponentView,
    createNgModuleRef: debugCreateNgModuleRef,
    overrideProvider: debugOverrideProvider,
    clearProviderOverrides: debugClearProviderOverrides,
    checkAndUpdateView: debugCheckAndUpdateView,
    checkNoChangesView: debugCheckNoChangesView,
    destroyView: debugDestroyView,
    createDebugContext: (view: ViewData, nodeIndex: number) => new DebugContext_(view, nodeIndex),
    handleEvent: debugHandleEvent,
    updateDirectives: debugUpdateDirectives,
    updateRenderer: debugUpdateRenderer,
  };
}

function createProdRootView(
    elInjector: Injector, projectableNodes: any[][], rootSelectorOrNode: string | any,
    def: ViewDefinition, ngModule: NgModuleRef<any>, context?: any): ViewData {
  const rendererFactory: RendererFactory2 = ngModule.injector.get(RendererFactory2);
  return createRootView(
      createRootData(elInjector, ngModule, rendererFactory, projectableNodes, rootSelectorOrNode),
      def, context);
}

function debugCreateRootView(
    elInjector: Injector, projectableNodes: any[][], rootSelectorOrNode: string | any,
    def: ViewDefinition, ngModule: NgModuleRef<any>, context?: any): ViewData {
  const rendererFactory: RendererFactory2 = ngModule.injector.get(RendererFactory2);
  const root = createRootData(
      elInjector, ngModule, new DebugRendererFactory2(rendererFactory), projectableNodes,
      rootSelectorOrNode);
  const defWithOverride = applyProviderOverridesToView(def);
  return callWithDebugContext(
      DebugAction.create, createRootView, null, [root, defWithOverride, context]);
}

function createRootData(
    elInjector: Injector, ngModule: NgModuleRef<any>, rendererFactory: RendererFactory2,
    projectableNodes: any[][], rootSelectorOrNode: any): RootData {
  const sanitizer = ngModule.injector.get(Sanitizer);
  const errorHandler = ngModule.injector.get(ErrorHandler);
  const renderer = rendererFactory.createRenderer(null, null);
  return {
    ngModule,
    injector: elInjector, projectableNodes,
    selectorOrNode: rootSelectorOrNode, sanitizer, rendererFactory, renderer, errorHandler
  };
}

function debugCreateEmbeddedView(
    parentView: ViewData, anchorDef: NodeDef, viewDef: ViewDefinition, context?: any): ViewData {
  const defWithOverride = applyProviderOverridesToView(viewDef);
  return callWithDebugContext(
      DebugAction.create, createEmbeddedView, null,
      [parentView, anchorDef, defWithOverride, context]);
}

function debugCreateComponentView(
    parentView: ViewData, nodeDef: NodeDef, viewDef: ViewDefinition, hostElement: any): ViewData {
  const defWithOverride = applyProviderOverridesToView(viewDef);
  return callWithDebugContext(
      DebugAction.create, createComponentView, null,
      [parentView, nodeDef, defWithOverride, hostElement]);
}

function debugCreateNgModuleRef(
    moduleType: Type<any>, parentInjector: Injector, bootstrapComponents: Type<any>[],
    def: NgModuleDefinition): NgModuleRef<any> {
  const defWithOverride = applyProviderOverridesToNgModule(def);
  return createNgModuleRef(moduleType, parentInjector, bootstrapComponents, defWithOverride);
}

const providerOverrides = new Map<any, ProviderOverride>();

function debugOverrideProvider(override: ProviderOverride) {
  providerOverrides.set(override.token, override);
}

function debugClearProviderOverrides() {
  providerOverrides.clear();
}

// Notes about the algorithm:
// 1) Locate the providers of an element and check if one of them was overwritten
// 2) Change the providers of that element
//
// We only create new datastructures if we need to, to keep perf impact
// reasonable.
function applyProviderOverridesToView(def: ViewDefinition): ViewDefinition {
  if (providerOverrides.size === 0) {
    return def;
  }
  const elementIndicesWithOverwrittenProviders = findElementIndicesWithOverwrittenProviders(def);
  if (elementIndicesWithOverwrittenProviders.length === 0) {
    return def;
  }
  // clone the whole view definition,
  // as it maintains references between the nodes that are hard to update.
  def = def.factory !(() => NOOP);
  for (let i = 0; i < elementIndicesWithOverwrittenProviders.length; i++) {
    applyProviderOverridesToElement(def, elementIndicesWithOverwrittenProviders[i]);
  }
  return def;

  function findElementIndicesWithOverwrittenProviders(def: ViewDefinition): number[] {
    const elIndicesWithOverwrittenProviders: number[] = [];
    let lastElementDef: NodeDef|null = null;
    for (let i = 0; i < def.nodes.length; i++) {
      const nodeDef = def.nodes[i];
      if (nodeDef.flags & NodeFlags.TypeElement) {
        lastElementDef = nodeDef;
      }
      if (lastElementDef && nodeDef.flags & NodeFlags.CatProviderNoDirective &&
          providerOverrides.has(nodeDef.provider !.token)) {
        elIndicesWithOverwrittenProviders.push(lastElementDef !.index);
        lastElementDef = null;
      }
    }
    return elIndicesWithOverwrittenProviders;
  }

  function applyProviderOverridesToElement(viewDef: ViewDefinition, elIndex: number) {
    for (let i = elIndex + 1; i < viewDef.nodes.length; i++) {
      const nodeDef = viewDef.nodes[i];
      if (nodeDef.flags & NodeFlags.TypeElement) {
        // stop at the next element
        return;
      }
      if (nodeDef.flags & NodeFlags.CatProviderNoDirective) {
        // Make all providers lazy, so that we don't get into trouble
        // with ordering problems of providers on the same element
        nodeDef.flags |= NodeFlags.LazyProvider;
        const provider = nodeDef.provider !;
        const override = providerOverrides.get(provider.token);
        if (override) {
          nodeDef.flags = (nodeDef.flags & ~NodeFlags.CatProviderNoDirective) | override.flags;
          provider.deps = splitDepsDsl(override.deps);
          provider.value = override.value;
        }
      }
    }
  }
}

// Notes about the algorithm:
// We only create new datastructures if we need to, to keep perf impact
// reasonable.
function applyProviderOverridesToNgModule(def: NgModuleDefinition): NgModuleDefinition {
  if (providerOverrides.size === 0 || !hasOverrrides(def)) {
    return def;
  }
  // clone the whole view definition,
  // as it maintains references between the nodes that are hard to update.
  def = def.factory !(() => NOOP);
  applyProviderOverrides(def);
  return def;

  function hasOverrrides(def: NgModuleDefinition): boolean {
    return def.providers.some(
        node =>
            !!(node.flags & NodeFlags.CatProviderNoDirective) && providerOverrides.has(node.token));
  }

  function applyProviderOverrides(def: NgModuleDefinition) {
    for (let i = 0; i < def.providers.length; i++) {
      const provider = def.providers[i];
      // Make all providers lazy, so that we don't get into trouble
      // with ordering problems of providers on the same element
      provider.flags |= NodeFlags.LazyProvider;
      const override = providerOverrides.get(provider.token);
      if (override) {
        provider.flags = (provider.flags & ~NodeFlags.CatProviderNoDirective) | override.flags;
        provider.deps = splitDepsDsl(override.deps);
        provider.value = override.value;
      }
    }
  }
}

function prodCheckAndUpdateNode(
    view: ViewData, nodeIndex: number, argStyle: ArgumentType, v0?: any, v1?: any, v2?: any,
    v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any): any {
  const nodeDef = view.def.nodes[nodeIndex];
  checkAndUpdateNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  return (nodeDef.flags & NodeFlags.CatPureExpression) ?
      asPureExpressionData(view, nodeIndex).value :
      undefined;
}

function prodCheckNoChangesNode(
    view: ViewData, nodeIndex: number, argStyle: ArgumentType, v0?: any, v1?: any, v2?: any,
    v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any): any {
  const nodeDef = view.def.nodes[nodeIndex];
  checkNoChangesNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  return (nodeDef.flags & NodeFlags.CatPureExpression) ?
      asPureExpressionData(view, nodeIndex).value :
      undefined;
}

function debugCheckAndUpdateView(view: ViewData) {
  return callWithDebugContext(DebugAction.detectChanges, checkAndUpdateView, null, [view]);
}

function debugCheckNoChangesView(view: ViewData) {
  return callWithDebugContext(DebugAction.checkNoChanges, checkNoChangesView, null, [view]);
}

function debugDestroyView(view: ViewData) {
  return callWithDebugContext(DebugAction.destroy, destroyView, null, [view]);
}

enum DebugAction {
  create,
  detectChanges,
  checkNoChanges,
  destroy,
  handleEvent
}

let _currentAction: DebugAction;
let _currentView: ViewData;
let _currentNodeIndex: number|null;

function debugSetCurrentNode(view: ViewData, nodeIndex: number | null) {
  _currentView = view;
  _currentNodeIndex = nodeIndex;
}

function debugHandleEvent(view: ViewData, nodeIndex: number, eventName: string, event: any) {
  debugSetCurrentNode(view, nodeIndex);
  return callWithDebugContext(
      DebugAction.handleEvent, view.def.handleEvent, null, [view, nodeIndex, eventName, event]);
}

function debugUpdateDirectives(view: ViewData, checkType: CheckType) {
  if (view.state & ViewState.Destroyed) {
    throw viewDestroyedError(DebugAction[_currentAction]);
  }
  debugSetCurrentNode(view, nextDirectiveWithBinding(view, 0));
  return view.def.updateDirectives(debugCheckDirectivesFn, view);

  function debugCheckDirectivesFn(
      view: ViewData, nodeIndex: number, argStyle: ArgumentType, ...values: any[]) {
    const nodeDef = view.def.nodes[nodeIndex];
    if (checkType === CheckType.CheckAndUpdate) {
      debugCheckAndUpdateNode(view, nodeDef, argStyle, values);
    } else {
      debugCheckNoChangesNode(view, nodeDef, argStyle, values);
    }
    if (nodeDef.flags & NodeFlags.TypeDirective) {
      debugSetCurrentNode(view, nextDirectiveWithBinding(view, nodeIndex));
    }
    return (nodeDef.flags & NodeFlags.CatPureExpression) ?
        asPureExpressionData(view, nodeDef.index).value :
        undefined;
  }
}

function debugUpdateRenderer(view: ViewData, checkType: CheckType) {
  if (view.state & ViewState.Destroyed) {
    throw viewDestroyedError(DebugAction[_currentAction]);
  }
  debugSetCurrentNode(view, nextRenderNodeWithBinding(view, 0));
  return view.def.updateRenderer(debugCheckRenderNodeFn, view);

  function debugCheckRenderNodeFn(
      view: ViewData, nodeIndex: number, argStyle: ArgumentType, ...values: any[]) {
    const nodeDef = view.def.nodes[nodeIndex];
    if (checkType === CheckType.CheckAndUpdate) {
      debugCheckAndUpdateNode(view, nodeDef, argStyle, values);
    } else {
      debugCheckNoChangesNode(view, nodeDef, argStyle, values);
    }
    if (nodeDef.flags & NodeFlags.CatRenderNode) {
      debugSetCurrentNode(view, nextRenderNodeWithBinding(view, nodeIndex));
    }
    return (nodeDef.flags & NodeFlags.CatPureExpression) ?
        asPureExpressionData(view, nodeDef.index).value :
        undefined;
  }
}

function debugCheckAndUpdateNode(
    view: ViewData, nodeDef: NodeDef, argStyle: ArgumentType, givenValues: any[]): void {
  const changed = (<any>checkAndUpdateNode)(view, nodeDef, argStyle, ...givenValues);
  if (changed) {
    const values = argStyle === ArgumentType.Dynamic ? givenValues[0] : givenValues;
    if (nodeDef.flags & NodeFlags.TypeDirective) {
      const bindingValues: {[key: string]: string} = {};
      for (let i = 0; i < nodeDef.bindings.length; i++) {
        const binding = nodeDef.bindings[i];
        const value = values[i];
        if (binding.flags & BindingFlags.TypeProperty) {
          bindingValues[normalizeDebugBindingName(binding.nonMinifiedName !)] =
              normalizeDebugBindingValue(value);
        }
      }
      const elDef = nodeDef.parent !;
      const el = asElementData(view, elDef.index).renderElement;
      if (!elDef.element !.name) {
        // a comment.
        view.renderer.setValue(el, `bindings=${JSON.stringify(bindingValues, null, 2)}`);
      } else {
        // a regular element.
        for (let attr in bindingValues) {
          const value = bindingValues[attr];
          if (value != null) {
            view.renderer.setAttribute(el, attr, value);
          } else {
            view.renderer.removeAttribute(el, attr);
          }
        }
      }
    }
  }
}

function debugCheckNoChangesNode(
    view: ViewData, nodeDef: NodeDef, argStyle: ArgumentType, values: any[]): void {
  (<any>checkNoChangesNode)(view, nodeDef, argStyle, ...values);
}

function normalizeDebugBindingName(name: string) {
  // Attribute names with `$` (eg `x-y$`) are valid per spec, but unsupported by some browsers
  name = camelCaseToDashCase(name.replace(/[$@]/g, '_'));
  return `ng-reflect-${name}`;
}

const CAMEL_CASE_REGEXP = /([A-Z])/g;

function camelCaseToDashCase(input: string): string {
  return input.replace(CAMEL_CASE_REGEXP, (...m: any[]) => '-' + m[1].toLowerCase());
}

function normalizeDebugBindingValue(value: any): string {
  try {
    // Limit the size of the value as otherwise the DOM just gets polluted.
    return value != null ? value.toString().slice(0, 30) : value;
  } catch (e) {
    return '[ERROR] Exception while trying to serialize the value';
  }
}

function nextDirectiveWithBinding(view: ViewData, nodeIndex: number): number|null {
  for (let i = nodeIndex; i < view.def.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.flags & NodeFlags.TypeDirective && nodeDef.bindings && nodeDef.bindings.length) {
      return i;
    }
  }
  return null;
}

function nextRenderNodeWithBinding(view: ViewData, nodeIndex: number): number|null {
  for (let i = nodeIndex; i < view.def.nodes.length; i++) {
    const nodeDef = view.def.nodes[i];
    if ((nodeDef.flags & NodeFlags.CatRenderNode) && nodeDef.bindings && nodeDef.bindings.length) {
      return i;
    }
  }
  return null;
}

class DebugContext_ implements DebugContext {
  private nodeDef: NodeDef;
  private elView: ViewData;
  private elDef: NodeDef;
  constructor(public view: ViewData, public nodeIndex: number|null) {
    if (nodeIndex == null) {
      this.nodeIndex = nodeIndex = 0;
    }
    this.nodeDef = view.def.nodes[nodeIndex];
    let elDef = this.nodeDef;
    let elView = view;
    while (elDef && (elDef.flags & NodeFlags.TypeElement) === 0) {
      elDef = elDef.parent !;
    }
    if (!elDef) {
      while (!elDef && elView) {
        elDef = viewParentEl(elView) !;
        elView = elView.parent !;
      }
    }
    this.elDef = elDef;
    this.elView = elView;
  }
  private get elOrCompView() {
    // Has to be done lazily as we use the DebugContext also during creation of elements...
    return asElementData(this.elView, this.elDef.index).componentView || this.view;
  }
  get injector(): Injector { return createInjector(this.elView, this.elDef); }
  get component(): any { return this.elOrCompView.component; }
  get context(): any { return this.elOrCompView.context; }
  get providerTokens(): any[] {
    const tokens: any[] = [];
    if (this.elDef) {
      for (let i = this.elDef.index + 1; i <= this.elDef.index + this.elDef.childCount; i++) {
        const childDef = this.elView.def.nodes[i];
        if (childDef.flags & NodeFlags.CatProvider) {
          tokens.push(childDef.provider !.token);
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
        if (childDef.flags & NodeFlags.CatProvider) {
          collectReferences(this.elView, childDef, references);
        }
        i += childDef.childCount;
      }
    }
    return references;
  }
  get componentRenderElement() {
    const elData = findHostElement(this.elOrCompView);
    return elData ? elData.renderElement : undefined;
  }
  get renderNode(): any {
    return this.nodeDef.flags & NodeFlags.TypeText ? renderNode(this.view, this.nodeDef) :
                                                     renderNode(this.elView, this.elDef);
  }
  logError(console: Console, ...values: any[]) {
    let logViewDef: ViewDefinition;
    let logNodeIndex: number;
    if (this.nodeDef.flags & NodeFlags.TypeText) {
      logViewDef = this.view.def;
      logNodeIndex = this.nodeDef.index;
    } else {
      logViewDef = this.elView.def;
      logNodeIndex = this.elDef.index;
    }
    // Note: we only generate a log function for text and element nodes
    // to make the generated code as small as possible.
    const renderNodeIndex = getRenderNodeIndex(logViewDef, logNodeIndex);
    let currRenderNodeIndex = -1;
    let nodeLogger: NodeLogger = () => {
      currRenderNodeIndex++;
      if (currRenderNodeIndex === renderNodeIndex) {
        return console.error.bind(console, ...values);
      } else {
        return NOOP;
      }
    };
    logViewDef.factory !(nodeLogger);
    if (currRenderNodeIndex < renderNodeIndex) {
      console.error('Illegal state: the ViewDefinitionFactory did not call the logger!');
      (<any>console.error)(...values);
    }
  }
}

function getRenderNodeIndex(viewDef: ViewDefinition, nodeIndex: number): number {
  let renderNodeIndex = -1;
  for (let i = 0; i <= nodeIndex; i++) {
    const nodeDef = viewDef.nodes[i];
    if (nodeDef.flags & NodeFlags.CatRenderNode) {
      renderNodeIndex++;
    }
  }
  return renderNodeIndex;
}

function findHostElement(view: ViewData): ElementData|null {
  while (view && !isComponentView(view)) {
    view = view.parent !;
  }
  if (view.parent) {
    return asElementData(view.parent, viewParentEl(view) !.index);
  }
  return null;
}

function collectReferences(view: ViewData, nodeDef: NodeDef, references: {[key: string]: any}) {
  for (let refName in nodeDef.references) {
    references[refName] = getQueryValue(view, nodeDef, nodeDef.references[refName]);
  }
}

function callWithDebugContext(action: DebugAction, fn: any, self: any, args: any[]) {
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
    throw viewWrappedDebugError(e, getCurrentDebugContext() !);
  }
}

export function getCurrentDebugContext(): DebugContext|null {
  return _currentView ? new DebugContext_(_currentView, _currentNodeIndex) : null;
}


class DebugRendererFactory2 implements RendererFactory2 {
  constructor(private delegate: RendererFactory2) {}

  createRenderer(element: any, renderData: RendererType2|null): Renderer2 {
    return new DebugRenderer2(this.delegate.createRenderer(element, renderData));
  }

  begin() {
    if (this.delegate.begin) {
      this.delegate.begin();
    }
  }
  end() {
    if (this.delegate.end) {
      this.delegate.end();
    }
  }
}


class DebugRenderer2 implements Renderer2 {
  constructor(private delegate: Renderer2) {}

  get data() { return this.delegate.data; }

  destroyNode(node: any) {
    removeDebugNodeFromIndex(getDebugNode(node) !);
    if (this.delegate.destroyNode) {
      this.delegate.destroyNode(node);
    }
  }

  destroy() { this.delegate.destroy(); }

  createElement(name: string, namespace?: string): any {
    const el = this.delegate.createElement(name, namespace);
    const debugCtx = getCurrentDebugContext();
    if (debugCtx) {
      const debugEl = new DebugElement(el, null, debugCtx);
      debugEl.name = name;
      indexDebugNode(debugEl);
    }
    return el;
  }

  createComment(value: string): any {
    const comment = this.delegate.createComment(value);
    const debugCtx = getCurrentDebugContext();
    if (debugCtx) {
      indexDebugNode(new DebugNode(comment, null, debugCtx));
    }
    return comment;
  }

  createText(value: string): any {
    const text = this.delegate.createText(value);
    const debugCtx = getCurrentDebugContext();
    if (debugCtx) {
      indexDebugNode(new DebugNode(text, null, debugCtx));
    }
    return text;
  }

  appendChild(parent: any, newChild: any): void {
    const debugEl = getDebugNode(parent);
    const debugChildEl = getDebugNode(newChild);
    if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
      debugEl.addChild(debugChildEl);
    }
    this.delegate.appendChild(parent, newChild);
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    const debugEl = getDebugNode(parent);
    const debugChildEl = getDebugNode(newChild);
    const debugRefEl = getDebugNode(refChild) !;
    if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
      debugEl.insertBefore(debugRefEl, debugChildEl);
    }

    this.delegate.insertBefore(parent, newChild, refChild);
  }

  removeChild(parent: any, oldChild: any): void {
    const debugEl = getDebugNode(parent);
    const debugChildEl = getDebugNode(oldChild);
    if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
      debugEl.removeChild(debugChildEl);
    }
    this.delegate.removeChild(parent, oldChild);
  }

  selectRootElement(selectorOrNode: string|any): any {
    const el = this.delegate.selectRootElement(selectorOrNode);
    const debugCtx = getCurrentDebugContext();
    if (debugCtx) {
      indexDebugNode(new DebugElement(el, null, debugCtx));
    }
    return el;
  }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      const fullName = namespace ? namespace + ':' + name : name;
      debugEl.attributes[fullName] = value;
    }
    this.delegate.setAttribute(el, name, value, namespace);
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      const fullName = namespace ? namespace + ':' + name : name;
      debugEl.attributes[fullName] = null;
    }
    this.delegate.removeAttribute(el, name, namespace);
  }

  addClass(el: any, name: string): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.classes[name] = true;
    }
    this.delegate.addClass(el, name);
  }

  removeClass(el: any, name: string): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.classes[name] = false;
    }
    this.delegate.removeClass(el, name);
  }

  setStyle(el: any, style: string, value: any, flags: RendererStyleFlags2): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.styles[style] = value;
    }
    this.delegate.setStyle(el, style, value, flags);
  }

  removeStyle(el: any, style: string, flags: RendererStyleFlags2): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.styles[style] = null;
    }
    this.delegate.removeStyle(el, style, flags);
  }

  setProperty(el: any, name: string, value: any): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.properties[name] = value;
    }
    this.delegate.setProperty(el, name, value);
  }

  listen(
      target: 'document'|'windows'|'body'|any, eventName: string,
      callback: (event: any) => boolean): () => void {
    if (typeof target !== 'string') {
      const debugEl = getDebugNode(target);
      if (debugEl) {
        debugEl.listeners.push(new EventListener(eventName, callback));
      }
    }

    return this.delegate.listen(target, eventName, callback);
  }

  parentNode(node: any): any { return this.delegate.parentNode(node); }
  nextSibling(node: any): any { return this.delegate.nextSibling(node); }
  setValue(node: any, value: string): void { return this.delegate.setValue(node, value); }
}
