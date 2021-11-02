/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Renderer2} from '../render/api';

import {checkAndUpdateElementDynamic, checkAndUpdateElementInline, createElement, listenToElementOutputs} from './element';
import {expressionChangedAfterItHasBeenCheckedError} from './errors';
import {appendNgContent} from './ng_content';
import {callLifecycleHooksChildrenFirst, checkAndUpdateDirectiveDynamic, checkAndUpdateDirectiveInline, createDirectiveInstance, createPipeInstance, createProviderInstance} from './provider';
import {checkAndUpdatePureExpressionDynamic, checkAndUpdatePureExpressionInline, createPureExpression} from './pure_expression';
import {checkAndUpdateQuery, createQuery} from './query';
import {createTemplateData, createViewContainerData} from './refs';
import {checkAndUpdateTextDynamic, checkAndUpdateTextInline, createText} from './text';
import {ArgumentType, asElementData, asQueryList, asTextData, CheckType, ElementData, NodeData, NodeDef, NodeFlags, ProviderData, RootData, Services, shiftInitState, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewState, ViewUpdateFn} from './types';
import {checkBindingNoChanges, isComponentView, markParentViewsForCheckProjectedViews, NOOP, resolveDefinition, tokenKey} from './util';
import {detachProjectedView} from './view_attach';

export function viewDef(
    flags: ViewFlags, nodes: NodeDef[], updateDirectives?: null|ViewUpdateFn,
    updateRenderer?: null|ViewUpdateFn): ViewDefinition {
  // clone nodes and set auto calculated values
  let viewBindingCount = 0;
  let viewDisposableCount = 0;
  let viewNodeFlags = 0;
  let viewRootNodeFlags = 0;
  let viewMatchedQueries = 0;
  let currentParent: NodeDef|null = null;
  let currentRenderParent: NodeDef|null = null;
  let currentElementHasPublicProviders = false;
  let currentElementHasPrivateProviders = false;
  let lastRenderRootNode: NodeDef|null = null;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    node.nodeIndex = i;
    node.parent = currentParent;
    node.bindingIndex = viewBindingCount;
    node.outputIndex = viewDisposableCount;
    node.renderParent = currentRenderParent;

    viewNodeFlags |= node.flags;
    viewMatchedQueries |= node.matchedQueryIds;

    if (node.element) {
      const elDef = node.element;
      elDef.publicProviders =
          currentParent ? currentParent.element!.publicProviders : Object.create(null);
      elDef.allProviders = elDef.publicProviders;
      // Note: We assume that all providers of an element are before any child element!
      currentElementHasPublicProviders = false;
      currentElementHasPrivateProviders = false;

      if (node.element.template) {
        viewMatchedQueries |= node.element.template.nodeMatchedQueries;
      }
    }
    validateNode(currentParent, node, nodes.length);


    viewBindingCount += node.bindings.length;
    viewDisposableCount += node.outputs.length;

    if (!currentRenderParent && (node.flags & NodeFlags.CatRenderNode)) {
      lastRenderRootNode = node;
    }

    if (node.flags & NodeFlags.CatProvider) {
      if (!currentElementHasPublicProviders) {
        currentElementHasPublicProviders = true;
        // Use prototypical inheritance to not get O(n^2) complexity...
        currentParent!.element!.publicProviders =
            Object.create(currentParent!.element!.publicProviders);
        currentParent!.element!.allProviders = currentParent!.element!.publicProviders;
      }
      const isPrivateService = (node.flags & NodeFlags.PrivateProvider) !== 0;
      const isComponent = (node.flags & NodeFlags.Component) !== 0;
      if (!isPrivateService || isComponent) {
        currentParent!.element!.publicProviders![tokenKey(node.provider!.token)] = node;
      } else {
        if (!currentElementHasPrivateProviders) {
          currentElementHasPrivateProviders = true;
          // Use prototypical inheritance to not get O(n^2) complexity...
          currentParent!.element!.allProviders =
              Object.create(currentParent!.element!.publicProviders);
        }
        currentParent!.element!.allProviders![tokenKey(node.provider!.token)] = node;
      }
      if (isComponent) {
        currentParent!.element!.componentProvider = node;
      }
    }

    if (currentParent) {
      currentParent.childFlags |= node.flags;
      currentParent.directChildFlags |= node.flags;
      currentParent.childMatchedQueries |= node.matchedQueryIds;
      if (node.element && node.element.template) {
        currentParent.childMatchedQueries |= node.element.template.nodeMatchedQueries;
      }
    } else {
      viewRootNodeFlags |= node.flags;
    }

    if (node.childCount > 0) {
      currentParent = node;

      if (!isNgContainer(node)) {
        currentRenderParent = node;
      }
    } else {
      // When the current node has no children, check if it is the last children of its parent.
      // When it is, propagate the flags up.
      // The loop is required because an element could be the last transitive children of several
      // elements. We loop to either the root or the highest opened element (= with remaining
      // children)
      while (currentParent && i === currentParent.nodeIndex + currentParent.childCount) {
        const newParent: NodeDef|null = currentParent.parent;
        if (newParent) {
          newParent.childFlags |= currentParent.childFlags;
          newParent.childMatchedQueries |= currentParent.childMatchedQueries;
        }
        currentParent = newParent;
        // We also need to update the render parent & account for ng-container
        if (currentParent && isNgContainer(currentParent)) {
          currentRenderParent = currentParent.renderParent;
        } else {
          currentRenderParent = currentParent;
        }
      }
    }
  }

  const handleEvent: ViewHandleEventFn = (view, nodeIndex, eventName, event) =>
      nodes[nodeIndex].element!.handleEvent!(view, eventName, event);

  return {
    // Will be filled later...
    factory: null,
    nodeFlags: viewNodeFlags,
    rootNodeFlags: viewRootNodeFlags,
    nodeMatchedQueries: viewMatchedQueries,
    flags,
    nodes: nodes,
    updateDirectives: updateDirectives || NOOP,
    updateRenderer: updateRenderer || NOOP,
    handleEvent,
    bindingCount: viewBindingCount,
    outputCount: viewDisposableCount,
    lastRenderRootNode
  };
}

function isNgContainer(node: NodeDef): boolean {
  return (node.flags & NodeFlags.TypeElement) !== 0 && node.element!.name === null;
}

function validateNode(parent: NodeDef|null, node: NodeDef, nodeCount: number) {
  const template = node.element && node.element.template;
  if (template) {
    if (!template.lastRenderRootNode) {
      throw new Error(`Illegal State: Embedded templates without nodes are not allowed!`);
    }
    if (template.lastRenderRootNode &&
        template.lastRenderRootNode.flags & NodeFlags.EmbeddedViews) {
      throw new Error(
          `Illegal State: Last root node of a template can't have embedded views, at index ${
              node.nodeIndex}!`);
    }
  }
  if (node.flags & NodeFlags.CatProvider) {
    const parentFlags = parent ? parent.flags : 0;
    if ((parentFlags & NodeFlags.TypeElement) === 0) {
      throw new Error(
          `Illegal State: StaticProvider/Directive nodes need to be children of elements or anchors, at index ${
              node.nodeIndex}!`);
    }
  }
  if (node.query) {
    if (node.flags & NodeFlags.TypeContentQuery &&
        (!parent || (parent.flags & NodeFlags.TypeDirective) === 0)) {
      throw new Error(
          `Illegal State: Content Query nodes need to be children of directives, at index ${
              node.nodeIndex}!`);
    }
    if (node.flags & NodeFlags.TypeViewQuery && parent) {
      throw new Error(`Illegal State: View Query nodes have to be top level nodes, at index ${
          node.nodeIndex}!`);
    }
  }
  if (node.childCount) {
    const parentEnd = parent ? parent.nodeIndex + parent.childCount : nodeCount - 1;
    if (node.nodeIndex <= parentEnd && node.nodeIndex + node.childCount > parentEnd) {
      throw new Error(
          `Illegal State: childCount of node leads outside of parent, at index ${node.nodeIndex}!`);
    }
  }
}

export function createEmbeddedView(
    parent: ViewData, anchorDef: NodeDef, viewDef: ViewDefinition, context?: any): ViewData {
  // embedded views are seen as siblings to the anchor, so we need
  // to get the parent of the anchor and use it as parentIndex.
  const view = createView(parent.root, parent.renderer, parent, anchorDef, viewDef);
  initView(view, parent.component, context);
  createViewNodes(view);
  return view;
}

export function createRootView(root: RootData, def: ViewDefinition, context?: any): ViewData {
  const view = createView(root, root.renderer, null, null, def);
  initView(view, context, context);
  createViewNodes(view);
  return view;
}

export function createComponentView(
    parentView: ViewData, nodeDef: NodeDef, viewDef: ViewDefinition, hostElement: any): ViewData {
  const rendererType = nodeDef.element!.componentRendererType;
  let compRenderer: Renderer2;
  if (!rendererType) {
    compRenderer = parentView.root.renderer;
  } else {
    compRenderer = parentView.root.rendererFactory.createRenderer(hostElement, rendererType);
  }
  return createView(
      parentView.root, compRenderer, parentView, nodeDef.element!.componentProvider, viewDef);
}

function createView(
    root: RootData, renderer: Renderer2, parent: ViewData|null, parentNodeDef: NodeDef|null,
    def: ViewDefinition): ViewData {
  const nodes: NodeData[] = new Array(def.nodes.length);
  const disposables = def.outputCount ? new Array(def.outputCount) : null;
  const view: ViewData = {
    def,
    parent,
    viewContainerParent: null,
    parentNodeDef,
    context: null,
    component: null,
    nodes,
    state: ViewState.CatInit,
    root,
    renderer,
    oldValues: new Array(def.bindingCount),
    disposables,
    initIndex: -1
  };
  return view;
}

function initView(view: ViewData, component: any, context: any) {
  view.component = component;
  view.context = context;
}

function createViewNodes(view: ViewData) {
  let renderHost: any;
  if (isComponentView(view)) {
    const hostDef = view.parentNodeDef;
    renderHost = asElementData(view.parent!, hostDef!.parent!.nodeIndex).renderElement;
  }
  const def = view.def;
  const nodes = view.nodes;
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    Services.setCurrentNode(view, i);
    let nodeData: any;
    switch (nodeDef.flags & NodeFlags.Types) {
      case NodeFlags.TypeElement:
        const el = createElement(view, renderHost, nodeDef) as any;
        let componentView: ViewData = undefined!;
        if (nodeDef.flags & NodeFlags.ComponentView) {
          const compViewDef = resolveDefinition(nodeDef.element!.componentView!);
          componentView = Services.createComponentView(view, nodeDef, compViewDef, el);
        }
        listenToElementOutputs(view, componentView, nodeDef, el);
        nodeData = <ElementData>{
          renderElement: el,
          componentView,
          viewContainer: null,
          template: nodeDef.element!.template ? createTemplateData(view, nodeDef) : undefined
        };
        if (nodeDef.flags & NodeFlags.EmbeddedViews) {
          nodeData.viewContainer = createViewContainerData(view, nodeDef, nodeData);
        }
        break;
      case NodeFlags.TypeText:
        nodeData = createText(view, renderHost, nodeDef) as any;
        break;
      case NodeFlags.TypeClassProvider:
      case NodeFlags.TypeFactoryProvider:
      case NodeFlags.TypeUseExistingProvider:
      case NodeFlags.TypeValueProvider: {
        nodeData = nodes[i];
        if (!nodeData && !(nodeDef.flags & NodeFlags.LazyProvider)) {
          const instance = createProviderInstance(view, nodeDef);
          nodeData = <ProviderData>{instance};
        }
        break;
      }
      case NodeFlags.TypePipe: {
        const instance = createPipeInstance(view, nodeDef);
        nodeData = <ProviderData>{instance};
        break;
      }
      case NodeFlags.TypeDirective: {
        nodeData = nodes[i];
        if (!nodeData) {
          const instance = createDirectiveInstance(view, nodeDef);
          nodeData = <ProviderData>{instance};
        }
        if (nodeDef.flags & NodeFlags.Component) {
          const compView = asElementData(view, nodeDef.parent!.nodeIndex).componentView;
          initView(compView, nodeData.instance, nodeData.instance);
        }
        break;
      }
      case NodeFlags.TypePureArray:
      case NodeFlags.TypePureObject:
      case NodeFlags.TypePurePipe:
        nodeData = createPureExpression(view, nodeDef) as any;
        break;
      case NodeFlags.TypeContentQuery:
      case NodeFlags.TypeViewQuery:
        nodeData = createQuery(
                       (nodeDef.flags & NodeFlags.EmitDistinctChangesOnly) ===
                       NodeFlags.EmitDistinctChangesOnly) as any;
        break;
      case NodeFlags.TypeNgContent:
        appendNgContent(view, renderHost, nodeDef);
        // no runtime data needed for NgContent...
        nodeData = undefined;
        break;
    }
    nodes[i] = nodeData;
  }
  // Create the ViewData.nodes of component views after we created everything else,
  // so that e.g. ng-content works
  execComponentViewsAction(view, ViewAction.CreateViewNodes);

  // fill static content and view queries
  execQueriesAction(
      view, NodeFlags.TypeContentQuery | NodeFlags.TypeViewQuery, NodeFlags.StaticQuery,
      CheckType.CheckAndUpdate);
}

export function checkNoChangesView(view: ViewData) {
  markProjectedViewsForCheck(view);
  Services.updateDirectives(view, CheckType.CheckNoChanges);
  execEmbeddedViewsAction(view, ViewAction.CheckNoChanges);
  Services.updateRenderer(view, CheckType.CheckNoChanges);
  execComponentViewsAction(view, ViewAction.CheckNoChanges);
  // Note: We don't check queries for changes as we didn't do this in v2.x.
  // TODO(tbosch): investigate if we can enable the check again in v5.x with a nicer error message.
  view.state &= ~(ViewState.CheckProjectedViews | ViewState.CheckProjectedView);
}

export function checkAndUpdateView(view: ViewData) {
  if (view.state & ViewState.BeforeFirstCheck) {
    view.state &= ~ViewState.BeforeFirstCheck;
    view.state |= ViewState.FirstCheck;
  } else {
    view.state &= ~ViewState.FirstCheck;
  }
  shiftInitState(view, ViewState.InitState_BeforeInit, ViewState.InitState_CallingOnInit);
  markProjectedViewsForCheck(view);
  Services.updateDirectives(view, CheckType.CheckAndUpdate);
  execEmbeddedViewsAction(view, ViewAction.CheckAndUpdate);
  execQueriesAction(
      view, NodeFlags.TypeContentQuery, NodeFlags.DynamicQuery, CheckType.CheckAndUpdate);
  let callInit = shiftInitState(
      view, ViewState.InitState_CallingOnInit, ViewState.InitState_CallingAfterContentInit);
  callLifecycleHooksChildrenFirst(
      view, NodeFlags.AfterContentChecked | (callInit ? NodeFlags.AfterContentInit : 0));

  Services.updateRenderer(view, CheckType.CheckAndUpdate);

  execComponentViewsAction(view, ViewAction.CheckAndUpdate);
  execQueriesAction(
      view, NodeFlags.TypeViewQuery, NodeFlags.DynamicQuery, CheckType.CheckAndUpdate);
  callInit = shiftInitState(
      view, ViewState.InitState_CallingAfterContentInit, ViewState.InitState_CallingAfterViewInit);
  callLifecycleHooksChildrenFirst(
      view, NodeFlags.AfterViewChecked | (callInit ? NodeFlags.AfterViewInit : 0));

  if (view.def.flags & ViewFlags.OnPush) {
    view.state &= ~ViewState.ChecksEnabled;
  }
  view.state &= ~(ViewState.CheckProjectedViews | ViewState.CheckProjectedView);
  shiftInitState(view, ViewState.InitState_CallingAfterViewInit, ViewState.InitState_AfterInit);
}

export function checkAndUpdateNode(
    view: ViewData, nodeDef: NodeDef, argStyle: ArgumentType, v0?: any, v1?: any, v2?: any,
    v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any): boolean {
  if (argStyle === ArgumentType.Inline) {
    return checkAndUpdateNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  } else {
    return checkAndUpdateNodeDynamic(view, nodeDef, v0);
  }
}

function markProjectedViewsForCheck(view: ViewData) {
  const def = view.def;
  if (!(def.nodeFlags & NodeFlags.ProjectedTemplate)) {
    return;
  }
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    if (nodeDef.flags & NodeFlags.ProjectedTemplate) {
      const projectedViews = asElementData(view, i).template._projectedViews;
      if (projectedViews) {
        for (let i = 0; i < projectedViews.length; i++) {
          const projectedView = projectedViews[i];
          projectedView.state |= ViewState.CheckProjectedView;
          markParentViewsForCheckProjectedViews(projectedView, view);
        }
      }
    } else if ((nodeDef.childFlags & NodeFlags.ProjectedTemplate) === 0) {
      // a parent with leafs
      // no child is a component,
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}

function checkAndUpdateNodeInline(
    view: ViewData, nodeDef: NodeDef, v0?: any, v1?: any, v2?: any, v3?: any, v4?: any, v5?: any,
    v6?: any, v7?: any, v8?: any, v9?: any): boolean {
  switch (nodeDef.flags & NodeFlags.Types) {
    case NodeFlags.TypeElement:
      return checkAndUpdateElementInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case NodeFlags.TypeText:
      return checkAndUpdateTextInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case NodeFlags.TypeDirective:
      return checkAndUpdateDirectiveInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case NodeFlags.TypePureArray:
    case NodeFlags.TypePureObject:
    case NodeFlags.TypePurePipe:
      return checkAndUpdatePureExpressionInline(
          view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    default:
      throw 'unreachable';
  }
}

function checkAndUpdateNodeDynamic(view: ViewData, nodeDef: NodeDef, values: any[]): boolean {
  switch (nodeDef.flags & NodeFlags.Types) {
    case NodeFlags.TypeElement:
      return checkAndUpdateElementDynamic(view, nodeDef, values);
    case NodeFlags.TypeText:
      return checkAndUpdateTextDynamic(view, nodeDef, values);
    case NodeFlags.TypeDirective:
      return checkAndUpdateDirectiveDynamic(view, nodeDef, values);
    case NodeFlags.TypePureArray:
    case NodeFlags.TypePureObject:
    case NodeFlags.TypePurePipe:
      return checkAndUpdatePureExpressionDynamic(view, nodeDef, values);
    default:
      throw 'unreachable';
  }
}

export function checkNoChangesNode(
    view: ViewData, nodeDef: NodeDef, argStyle: ArgumentType, v0?: any, v1?: any, v2?: any,
    v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any): any {
  if (argStyle === ArgumentType.Inline) {
    checkNoChangesNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  } else {
    checkNoChangesNodeDynamic(view, nodeDef, v0);
  }
  // Returning false is ok here as we would have thrown in case of a change.
  return false;
}

function checkNoChangesNodeInline(
    view: ViewData, nodeDef: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any): void {
  const bindLen = nodeDef.bindings.length;
  if (bindLen > 0) checkBindingNoChanges(view, nodeDef, 0, v0);
  if (bindLen > 1) checkBindingNoChanges(view, nodeDef, 1, v1);
  if (bindLen > 2) checkBindingNoChanges(view, nodeDef, 2, v2);
  if (bindLen > 3) checkBindingNoChanges(view, nodeDef, 3, v3);
  if (bindLen > 4) checkBindingNoChanges(view, nodeDef, 4, v4);
  if (bindLen > 5) checkBindingNoChanges(view, nodeDef, 5, v5);
  if (bindLen > 6) checkBindingNoChanges(view, nodeDef, 6, v6);
  if (bindLen > 7) checkBindingNoChanges(view, nodeDef, 7, v7);
  if (bindLen > 8) checkBindingNoChanges(view, nodeDef, 8, v8);
  if (bindLen > 9) checkBindingNoChanges(view, nodeDef, 9, v9);
}

function checkNoChangesNodeDynamic(view: ViewData, nodeDef: NodeDef, values: any[]): void {
  for (let i = 0; i < values.length; i++) {
    checkBindingNoChanges(view, nodeDef, i, values[i]);
  }
}

/**
 * Workaround https://github.com/angular/tsickle/issues/497
 * @suppress {misplacedTypeAnnotation}
 */
function checkNoChangesQuery(view: ViewData, nodeDef: NodeDef) {
  const queryList = asQueryList(view, nodeDef.nodeIndex);
  if (queryList.dirty) {
    throw expressionChangedAfterItHasBeenCheckedError(
        Services.createDebugContext(view, nodeDef.nodeIndex),
        `Query ${nodeDef.query!.id} not dirty`, `Query ${nodeDef.query!.id} dirty`,
        (view.state & ViewState.BeforeFirstCheck) !== 0);
  }
}

export function destroyView(view: ViewData) {
  if (view.state & ViewState.Destroyed) {
    return;
  }
  execEmbeddedViewsAction(view, ViewAction.Destroy);
  execComponentViewsAction(view, ViewAction.Destroy);
  callLifecycleHooksChildrenFirst(view, NodeFlags.OnDestroy);
  if (view.disposables) {
    for (let i = 0; i < view.disposables.length; i++) {
      view.disposables[i]();
    }
  }
  detachProjectedView(view);
  if (view.renderer.destroyNode) {
    destroyViewNodes(view);
  }
  if (isComponentView(view)) {
    view.renderer.destroy();
  }
  view.state |= ViewState.Destroyed;
}

function destroyViewNodes(view: ViewData) {
  const len = view.def.nodes.length;
  for (let i = 0; i < len; i++) {
    const def = view.def.nodes[i];
    if (def.flags & NodeFlags.TypeElement) {
      view.renderer.destroyNode!(asElementData(view, i).renderElement);
    } else if (def.flags & NodeFlags.TypeText) {
      view.renderer.destroyNode!(asTextData(view, i).renderText);
    } else if (def.flags & NodeFlags.TypeContentQuery || def.flags & NodeFlags.TypeViewQuery) {
      asQueryList(view, i).destroy();
    }
  }
}

enum ViewAction {
  CreateViewNodes,
  CheckNoChanges,
  CheckNoChangesProjectedViews,
  CheckAndUpdate,
  CheckAndUpdateProjectedViews,
  Destroy
}

function execComponentViewsAction(view: ViewData, action: ViewAction) {
  const def = view.def;
  if (!(def.nodeFlags & NodeFlags.ComponentView)) {
    return;
  }
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    if (nodeDef.flags & NodeFlags.ComponentView) {
      // a leaf
      callViewAction(asElementData(view, i).componentView, action);
    } else if ((nodeDef.childFlags & NodeFlags.ComponentView) === 0) {
      // a parent with leafs
      // no child is a component,
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}

function execEmbeddedViewsAction(view: ViewData, action: ViewAction) {
  const def = view.def;
  if (!(def.nodeFlags & NodeFlags.EmbeddedViews)) {
    return;
  }
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    if (nodeDef.flags & NodeFlags.EmbeddedViews) {
      // a leaf
      const embeddedViews = asElementData(view, i).viewContainer!._embeddedViews;
      for (let k = 0; k < embeddedViews.length; k++) {
        callViewAction(embeddedViews[k], action);
      }
    } else if ((nodeDef.childFlags & NodeFlags.EmbeddedViews) === 0) {
      // a parent with leafs
      // no child is a component,
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}

function callViewAction(view: ViewData, action: ViewAction) {
  const viewState = view.state;
  switch (action) {
    case ViewAction.CheckNoChanges:
      if ((viewState & ViewState.Destroyed) === 0) {
        if ((viewState & ViewState.CatDetectChanges) === ViewState.CatDetectChanges) {
          checkNoChangesView(view);
        } else if (viewState & ViewState.CheckProjectedViews) {
          execProjectedViewsAction(view, ViewAction.CheckNoChangesProjectedViews);
        }
      }
      break;
    case ViewAction.CheckNoChangesProjectedViews:
      if ((viewState & ViewState.Destroyed) === 0) {
        if (viewState & ViewState.CheckProjectedView) {
          checkNoChangesView(view);
        } else if (viewState & ViewState.CheckProjectedViews) {
          execProjectedViewsAction(view, action);
        }
      }
      break;
    case ViewAction.CheckAndUpdate:
      if ((viewState & ViewState.Destroyed) === 0) {
        if ((viewState & ViewState.CatDetectChanges) === ViewState.CatDetectChanges) {
          checkAndUpdateView(view);
        } else if (viewState & ViewState.CheckProjectedViews) {
          execProjectedViewsAction(view, ViewAction.CheckAndUpdateProjectedViews);
        }
      }
      break;
    case ViewAction.CheckAndUpdateProjectedViews:
      if ((viewState & ViewState.Destroyed) === 0) {
        if (viewState & ViewState.CheckProjectedView) {
          checkAndUpdateView(view);
        } else if (viewState & ViewState.CheckProjectedViews) {
          execProjectedViewsAction(view, action);
        }
      }
      break;
    case ViewAction.Destroy:
      // Note: destroyView recurses over all views,
      // so we don't need to special case projected views here.
      destroyView(view);
      break;
    case ViewAction.CreateViewNodes:
      createViewNodes(view);
      break;
  }
}

function execProjectedViewsAction(view: ViewData, action: ViewAction) {
  execEmbeddedViewsAction(view, action);
  execComponentViewsAction(view, action);
}

function execQueriesAction(
    view: ViewData, queryFlags: NodeFlags, staticDynamicQueryFlag: NodeFlags,
    checkType: CheckType) {
  if (!(view.def.nodeFlags & queryFlags) || !(view.def.nodeFlags & staticDynamicQueryFlag)) {
    return;
  }
  const nodeCount = view.def.nodes.length;
  for (let i = 0; i < nodeCount; i++) {
    const nodeDef = view.def.nodes[i];
    if ((nodeDef.flags & queryFlags) && (nodeDef.flags & staticDynamicQueryFlag)) {
      Services.setCurrentNode(view, nodeDef.nodeIndex);
      switch (checkType) {
        case CheckType.CheckAndUpdate:
          checkAndUpdateQuery(view, nodeDef);
          break;
        case CheckType.CheckNoChanges:
          checkNoChangesQuery(view, nodeDef);
          break;
      }
    }
    if (!(nodeDef.childFlags & queryFlags) || !(nodeDef.childFlags & staticDynamicQueryFlag)) {
      // no child has a matching query
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}
