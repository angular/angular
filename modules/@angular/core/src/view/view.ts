/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../metadata/view';
import {RendererTypeV2, RendererV2} from '../render/api';

import {checkAndUpdateElementDynamic, checkAndUpdateElementInline, createElement, listenToElementOutputs} from './element';
import {expressionChangedAfterItHasBeenCheckedError} from './errors';
import {appendNgContent} from './ng_content';
import {callLifecycleHooksChildrenFirst, checkAndUpdateDirectiveDynamic, checkAndUpdateDirectiveInline, createDirectiveInstance, createPipeInstance, createProviderInstance} from './provider';
import {checkAndUpdatePureExpressionDynamic, checkAndUpdatePureExpressionInline, createPureExpression} from './pure_expression';
import {checkAndUpdateQuery, createQuery, queryDef} from './query';
import {checkAndUpdateTextDynamic, checkAndUpdateTextInline, createText} from './text';
import {ArgumentType, CheckType, ElementData, ElementDef, NodeData, NodeDef, NodeFlags, NodeType, ProviderData, ProviderDef, RootData, Services, TextDef, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewHandleEventFn, ViewState, ViewUpdateFn, asElementData, asProviderData, asPureExpressionData, asQueryList, asTextData} from './types';
import {checkBindingNoChanges, isComponentView, resolveViewDefinition, viewParentEl} from './util';

const NOOP = (): any => undefined;

export function viewDef(
    flags: ViewFlags, nodes: NodeDef[], updateDirectives?: ViewUpdateFn,
    updateRenderer?: ViewUpdateFn): ViewDefinition {
  // clone nodes and set auto calculated values
  if (nodes.length === 0) {
    throw new Error(`Illegal State: Views without nodes are not allowed!`);
  }

  const reverseChildNodes: NodeDef[] = new Array(nodes.length);
  let viewBindingCount = 0;
  let viewDisposableCount = 0;
  let viewNodeFlags = 0;
  let viewMatchedQueries = 0;
  let currentParent: NodeDef = null;
  let currentElementHasPublicProviders = false;
  let currentElementHasPrivateProviders = false;
  let lastRenderRootNode: NodeDef = null;
  for (let i = 0; i < nodes.length; i++) {
    while (currentParent && i > currentParent.index + currentParent.childCount) {
      const newParent = currentParent.parent;
      if (newParent) {
        newParent.childFlags |= currentParent.childFlags;
        newParent.childMatchedQueries |= currentParent.childMatchedQueries;
      }
      currentParent = newParent;
    }
    const node = nodes[i];
    node.index = i;
    node.parent = currentParent;
    node.bindingIndex = viewBindingCount;
    node.outputIndex = viewDisposableCount;
    node.reverseChildIndex =
        calculateReverseChildIndex(currentParent, i, node.childCount, nodes.length);

    // renderParent needs to account for ng-container!
    let currentRenderParent: NodeDef;
    if (currentParent && currentParent.type === NodeType.Element && !currentParent.element.name) {
      currentRenderParent = currentParent.renderParent;
    } else {
      currentRenderParent = currentParent;
    }
    node.renderParent = currentRenderParent;

    if (node.element) {
      const elDef = node.element;
      elDef.publicProviders =
          currentParent ? currentParent.element.publicProviders : Object.create(null);
      elDef.allProviders = elDef.publicProviders;
      // Note: We assume that all providers of an element are before any child element!
      currentElementHasPublicProviders = false;
      currentElementHasPrivateProviders = false;
    }
    reverseChildNodes[node.reverseChildIndex] = node;
    validateNode(currentParent, node, nodes.length);

    viewNodeFlags |= node.flags;
    viewMatchedQueries |= node.matchedQueryIds;
    if (node.element && node.element.template) {
      viewMatchedQueries |= node.element.template.nodeMatchedQueries;
    }
    if (currentParent) {
      currentParent.childFlags |= node.flags;
      currentParent.childMatchedQueries |= node.matchedQueryIds;
      if (node.element && node.element.template) {
        currentParent.childMatchedQueries |= node.element.template.nodeMatchedQueries;
      }
    }

    viewBindingCount += node.bindings.length;
    viewDisposableCount += node.outputs.length;

    if (!currentRenderParent && (node.type === NodeType.Element || node.type === NodeType.Text)) {
      lastRenderRootNode = node;
    }
    if (node.type === NodeType.Provider || node.type === NodeType.Directive) {
      if (!currentElementHasPublicProviders) {
        currentElementHasPublicProviders = true;
        // Use protoypical inheritance to not get O(n^2) complexity...
        currentParent.element.publicProviders =
            Object.create(currentParent.element.publicProviders);
        currentParent.element.allProviders = currentParent.element.publicProviders;
      }
      const isPrivateService = (node.flags & NodeFlags.PrivateProvider) !== 0;
      const isComponent = (node.flags & NodeFlags.IsComponent) !== 0;
      if (!isPrivateService || isComponent) {
        currentParent.element.publicProviders[node.provider.tokenKey] = node;
      } else {
        if (!currentElementHasPrivateProviders) {
          currentElementHasPrivateProviders = true;
          // Use protoypical inheritance to not get O(n^2) complexity...
          currentParent.element.allProviders = Object.create(currentParent.element.publicProviders);
        }
        currentParent.element.allProviders[node.provider.tokenKey] = node;
      }
      if (isComponent) {
        currentParent.element.componentProvider = node;
      }
    }
    if (node.childCount) {
      currentParent = node;
    }
  }
  while (currentParent) {
    const newParent = currentParent.parent;
    if (newParent) {
      newParent.childFlags |= currentParent.childFlags;
      newParent.childMatchedQueries |= currentParent.childMatchedQueries;
    }
    currentParent = newParent;
  }
  const handleEvent: ViewHandleEventFn = (view, nodeIndex, eventName, event) =>
      nodes[nodeIndex].element.handleEvent(view, eventName, event);
  return {
    nodeFlags: viewNodeFlags,
    nodeMatchedQueries: viewMatchedQueries, flags,
    nodes: nodes, reverseChildNodes,
    updateDirectives: updateDirectives || NOOP,
    updateRenderer: updateRenderer || NOOP,
    handleEvent: handleEvent || NOOP,
    bindingCount: viewBindingCount,
    outputCount: viewDisposableCount, lastRenderRootNode
  };
}



function calculateReverseChildIndex(
    currentParent: NodeDef, i: number, childCount: number, nodeCount: number) {
  // Notes about reverse child order:
  // - Every node is directly before its children, in dfs and reverse child order.
  // - node.childCount contains all children, in dfs and reverse child order.
  // - In dfs order, every node is before its first child
  // - In reverse child order, every node is before its last child

  // Algorithm, main idea:
  // - In reverse child order, the ranges for each child + its transitive children are mirrored
  //   regarding their position inside of their parent

  // Visualization:
  // Given the following tree:
  // Nodes: n0
  //             n1         n2
  //                n11 n12    n21 n22
  // dfs:    0   1   2   3  4   5   6
  // result: 0   4   6   5  1   3   2
  //
  // Example:
  // Current node = 1
  // 1) lastChildIndex = 3
  // 2) lastChildOffsetRelativeToParentInDfsOrder = 2
  // 3) parentEndIndexInReverseChildOrder = 6
  // 4) result = 4
  let lastChildOffsetRelativeToParentInDfsOrder: number;
  let parentEndIndexInReverseChildOrder: number;
  if (currentParent) {
    const lastChildIndex = i + childCount;
    lastChildOffsetRelativeToParentInDfsOrder = lastChildIndex - currentParent.index - 1;
    parentEndIndexInReverseChildOrder = currentParent.reverseChildIndex + currentParent.childCount;
  } else {
    lastChildOffsetRelativeToParentInDfsOrder = i + childCount;
    parentEndIndexInReverseChildOrder = nodeCount - 1;
  }
  return parentEndIndexInReverseChildOrder - lastChildOffsetRelativeToParentInDfsOrder;
}

function validateNode(parent: NodeDef, node: NodeDef, nodeCount: number) {
  const template = node.element && node.element.template;
  if (template) {
    if (template.lastRenderRootNode &&
        template.lastRenderRootNode.flags & NodeFlags.HasEmbeddedViews) {
      throw new Error(
          `Illegal State: Last root node of a template can't have embedded views, at index ${node.index}!`);
    }
  }
  if (node.type === NodeType.Provider || node.type === NodeType.Directive) {
    const parentType = parent ? parent.type : null;
    if (parentType !== NodeType.Element) {
      throw new Error(
          `Illegal State: Provider/Directive nodes need to be children of elements or anchors, at index ${node.index}!`);
    }
  }
  if (node.query) {
    if (node.flags & NodeFlags.HasContentQuery && (!parent || parent.type !== NodeType.Directive)) {
      throw new Error(
          `Illegal State: Content Query nodes need to be children of directives, at index ${node.index}!`);
    }
    if (node.flags & NodeFlags.HasViewQuery && parent) {
      throw new Error(
          `Illegal State: View Query nodes have to be top level nodes, at index ${node.index}!`);
    }
  }
  if (node.childCount) {
    const parentEnd = parent ? parent.index + parent.childCount : nodeCount - 1;
    if (node.index <= parentEnd && node.index + node.childCount > parentEnd) {
      throw new Error(
          `Illegal State: childCount of node leads outside of parent, at index ${node.index}!`);
    }
  }
}

export function createEmbeddedView(parent: ViewData, anchorDef: NodeDef, context?: any): ViewData {
  // embedded views are seen as siblings to the anchor, so we need
  // to get the parent of the anchor and use it as parentIndex.
  const view =
      createView(parent.root, parent.renderer, parent, anchorDef, anchorDef.element.template);
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

function createView(
    root: RootData, renderer: RendererV2, parent: ViewData, parentNodeDef: NodeDef,
    def: ViewDefinition): ViewData {
  const nodes: NodeData[] = new Array(def.nodes.length);
  const disposables = def.outputCount ? new Array(def.outputCount) : undefined;
  const view: ViewData = {
    def,
    parent,
    viewContainerParent: undefined, parentNodeDef,
    context: undefined,
    component: undefined, nodes,
    state: ViewState.FirstCheck | ViewState.ChecksEnabled, root, renderer,
    oldValues: new Array(def.bindingCount), disposables
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
    renderHost = asElementData(view.parent, hostDef.parent.index).renderElement;
  }
  const def = view.def;
  const nodes = view.nodes;
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    Services.setCurrentNode(view, i);
    let nodeData: any;
    switch (nodeDef.type) {
      case NodeType.Element:
        const el = createElement(view, renderHost, nodeDef) as any;
        let componentView: ViewData;
        if (nodeDef.flags & NodeFlags.HasComponent) {
          const compViewDef = resolveViewDefinition(nodeDef.element.componentView);
          const rendererType = nodeDef.element.componentRendererType;
          let compRenderer: RendererV2;
          if (!rendererType) {
            compRenderer = view.root.renderer;
          } else {
            compRenderer = view.root.rendererFactory.createRenderer(el, rendererType);
          }
          componentView = createView(
              view.root, compRenderer, view, nodeDef.element.componentProvider, compViewDef);
        }
        listenToElementOutputs(view, componentView, nodeDef, el);
        nodeData = <ElementData>{
          renderElement: el,
          componentView,
          embeddedViews: (nodeDef.flags & NodeFlags.HasEmbeddedViews) ? [] : undefined,
          projectedViews: undefined
        };
        break;
      case NodeType.Text:
        nodeData = createText(view, renderHost, nodeDef) as any;
        break;
      case NodeType.Provider: {
        const instance = createProviderInstance(view, nodeDef);
        nodeData = <ProviderData>{instance};
        break;
      }
      case NodeType.Pipe: {
        const instance = createPipeInstance(view, nodeDef);
        nodeData = <ProviderData>{instance};
        break;
      }
      case NodeType.Directive: {
        const instance = createDirectiveInstance(view, nodeDef);
        nodeData = <ProviderData>{instance};
        if (nodeDef.flags & NodeFlags.IsComponent) {
          const compView = asElementData(view, nodeDef.parent.index).componentView;
          initView(compView, instance, instance);
        }
        break;
      }
      case NodeType.PureExpression:
        nodeData = createPureExpression(view, nodeDef) as any;
        break;
      case NodeType.Query:
        nodeData = createQuery() as any;
        break;
      case NodeType.NgContent:
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
      view, NodeFlags.HasContentQuery | NodeFlags.HasViewQuery, NodeFlags.HasStaticQuery,
      CheckType.CheckAndUpdate);
}

export function checkNoChangesView(view: ViewData) {
  Services.updateDirectives(view, CheckType.CheckNoChanges);
  execEmbeddedViewsAction(view, ViewAction.CheckNoChanges);
  execQueriesAction(
      view, NodeFlags.HasContentQuery, NodeFlags.HasDynamicQuery, CheckType.CheckNoChanges);
  Services.updateRenderer(view, CheckType.CheckNoChanges);
  execComponentViewsAction(view, ViewAction.CheckNoChanges);
  execQueriesAction(
      view, NodeFlags.HasViewQuery, NodeFlags.HasDynamicQuery, CheckType.CheckNoChanges);
}

export function checkAndUpdateView(view: ViewData) {
  Services.updateDirectives(view, CheckType.CheckAndUpdate);
  execEmbeddedViewsAction(view, ViewAction.CheckAndUpdate);
  execQueriesAction(
      view, NodeFlags.HasContentQuery, NodeFlags.HasDynamicQuery, CheckType.CheckAndUpdate);

  callLifecycleHooksChildrenFirst(
      view, NodeFlags.AfterContentChecked |
          (view.state & ViewState.FirstCheck ? NodeFlags.AfterContentInit : 0));

  Services.updateRenderer(view, CheckType.CheckAndUpdate);

  execComponentViewsAction(view, ViewAction.CheckAndUpdate);
  execQueriesAction(
      view, NodeFlags.HasViewQuery, NodeFlags.HasDynamicQuery, CheckType.CheckAndUpdate);

  callLifecycleHooksChildrenFirst(
      view, NodeFlags.AfterViewChecked |
          (view.state & ViewState.FirstCheck ? NodeFlags.AfterViewInit : 0));

  if (view.def.flags & ViewFlags.OnPush) {
    view.state &= ~ViewState.ChecksEnabled;
  }
  view.state &= ~ViewState.FirstCheck;
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

function checkAndUpdateNodeInline(
    view: ViewData, nodeDef: NodeDef, v0?: any, v1?: any, v2?: any, v3?: any, v4?: any, v5?: any,
    v6?: any, v7?: any, v8?: any, v9?: any): boolean {
  let changed = false;
  switch (nodeDef.type) {
    case NodeType.Element:
      changed = checkAndUpdateElementInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
      break;
    case NodeType.Text:
      changed = checkAndUpdateTextInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
      break;
    case NodeType.Directive:
      changed =
          checkAndUpdateDirectiveInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
      break;
    case NodeType.PureExpression:
      changed =
          checkAndUpdatePureExpressionInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
      break;
  }
  return changed;
}

function checkAndUpdateNodeDynamic(view: ViewData, nodeDef: NodeDef, values: any[]): boolean {
  let changed = false;
  switch (nodeDef.type) {
    case NodeType.Element:
      changed = checkAndUpdateElementDynamic(view, nodeDef, values);
      break;
    case NodeType.Text:
      changed = checkAndUpdateTextDynamic(view, nodeDef, values);
      break;
    case NodeType.Directive:
      changed = checkAndUpdateDirectiveDynamic(view, nodeDef, values);
      break;
    case NodeType.PureExpression:
      changed = checkAndUpdatePureExpressionDynamic(view, nodeDef, values);
      break;
  }
  if (changed) {
    // Update oldValues after all bindings have been updated,
    // as a setter for a property might update other properties.
    const bindLen = nodeDef.bindings.length;
    const bindingStart = nodeDef.bindingIndex;
    const oldValues = view.oldValues;
    for (let i = 0; i < bindLen; i++) {
      oldValues[bindingStart + i] = values[i];
    }
  }
  return changed;
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

function checkNoChangesQuery(view: ViewData, nodeDef: NodeDef) {
  const queryList = asQueryList(view, nodeDef.index);
  if (queryList.dirty) {
    throw expressionChangedAfterItHasBeenCheckedError(
        Services.createDebugContext(view, nodeDef.index), `Query ${nodeDef.query.id} not dirty`,
        `Query ${nodeDef.query.id} dirty`, (view.state & ViewState.FirstCheck) !== 0);
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
    if (def.type === NodeType.Element) {
      view.renderer.destroyNode(asElementData(view, i).renderElement);
    } else if (def.type === NodeType.Text) {
      view.renderer.destroyNode(asTextData(view, i).renderText);
    }
  }
}

enum ViewAction {
  CreateViewNodes,
  CheckNoChanges,
  CheckAndUpdate,
  Destroy
}

function execComponentViewsAction(view: ViewData, action: ViewAction) {
  const def = view.def;
  if (!(def.nodeFlags & NodeFlags.HasComponent)) {
    return;
  }
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    if (nodeDef.flags & NodeFlags.HasComponent) {
      // a leaf
      callViewAction(asElementData(view, i).componentView, action);
    } else if ((nodeDef.childFlags & NodeFlags.HasComponent) === 0) {
      // a parent with leafs
      // no child is a component,
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}

function execEmbeddedViewsAction(view: ViewData, action: ViewAction) {
  const def = view.def;
  if (!(def.nodeFlags & NodeFlags.HasEmbeddedViews)) {
    return;
  }
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    if (nodeDef.flags & NodeFlags.HasEmbeddedViews) {
      // a leaf
      const embeddedViews = asElementData(view, i).embeddedViews;
      if (embeddedViews) {
        for (let k = 0; k < embeddedViews.length; k++) {
          callViewAction(embeddedViews[k], action);
        }
      }
    } else if ((nodeDef.childFlags & NodeFlags.HasEmbeddedViews) === 0) {
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
      if ((viewState & ViewState.ChecksEnabled) &&
          (viewState & (ViewState.Errored | ViewState.Destroyed)) === 0) {
        checkNoChangesView(view);
      }
      break;
    case ViewAction.CheckAndUpdate:
      if ((viewState & ViewState.ChecksEnabled) &&
          (viewState & (ViewState.Errored | ViewState.Destroyed)) === 0) {
        checkAndUpdateView(view);
      }
      break;
    case ViewAction.Destroy:
      destroyView(view);
      break;
    case ViewAction.CreateViewNodes:
      createViewNodes(view);
      break;
  }
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
      Services.setCurrentNode(view, nodeDef.index);
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
