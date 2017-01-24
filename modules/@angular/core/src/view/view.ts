/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ExpressionChangedAfterItHasBeenCheckedError} from '../linker/errors';
import {RenderComponentType, Renderer} from '../render/api';

import {checkAndUpdateElementDynamic, checkAndUpdateElementInline, createElement} from './element';
import {QueryAction, callLifecycleHooksChildrenFirst, checkAndUpdateProviderDynamic, checkAndUpdateProviderInline, createProvider, execContentQueriesAction, updateViewQueries} from './provider';
import {checkAndUpdatePureExpressionDynamic, checkAndUpdatePureExpressionInline, createPureExpression} from './pure_expression';
import {checkAndUpdateTextDynamic, checkAndUpdateTextInline, createText} from './text';
import {ElementDef, NodeData, NodeDef, NodeFlags, NodeType, NodeUpdater, ProviderData, ProviderDef, Services, TextDef, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn} from './types';
import {checkBindingNoChanges} from './util';

const NOOP = (): any => undefined;

export function viewDef(
    flags: ViewFlags, nodesWithoutIndices: NodeDef[], update?: ViewUpdateFn,
    handleEvent?: ViewHandleEventFn, componentType?: RenderComponentType): ViewDefinition {
  // clone nodes and set auto calculated values
  if (nodesWithoutIndices.length === 0) {
    throw new Error(`Illegal State: Views without nodes are not allowed!`);
  }
  const nodes: NodeDef[] = new Array(nodesWithoutIndices.length);
  const reverseChildNodes: NodeDef[] = new Array(nodesWithoutIndices.length);
  let viewBindingCount = 0;
  let viewDisposableCount = 0;
  let viewFlags = 0;
  let viewMatchedQueries: {[queryId: string]: boolean} = {};
  let currentParent: NodeDef = null;
  let lastRootNode: NodeDef = null;
  for (let i = 0; i < nodesWithoutIndices.length; i++) {
    while (currentParent && i > currentParent.index + currentParent.childCount) {
      const newParent = nodes[currentParent.parent];
      if (newParent) {
        newParent.childFlags |= currentParent.childFlags;
        copyInto(currentParent.childMatchedQueries, newParent.childMatchedQueries);
      }
      currentParent = newParent;
    }
    const reverseChildIndex = calculateReverseChildIndex(
        currentParent, i, nodesWithoutIndices[i].childCount, nodesWithoutIndices.length);
    const node = cloneAndModifyNode(nodesWithoutIndices[i], {
      index: i,
      parent: currentParent ? currentParent.index : undefined,
      bindingIndex: viewBindingCount,
      disposableIndex: viewDisposableCount, reverseChildIndex,
      providerIndices: Object.create(currentParent ? currentParent.providerIndices : null)
    });
    nodes[i] = node;
    reverseChildNodes[reverseChildIndex] = node;
    validateNode(currentParent, node);

    viewFlags |= node.flags;
    copyInto(node.matchedQueries, viewMatchedQueries);
    viewBindingCount += node.bindings.length;
    viewDisposableCount += node.disposableCount;
    if (currentParent) {
      currentParent.childFlags |= node.flags;
      copyInto(node.matchedQueries, currentParent.childMatchedQueries);
      if (node.element && node.element.template) {
        copyInto(node.element.template.nodeMatchedQueries, currentParent.childMatchedQueries);
      }
    }

    if (!currentParent) {
      lastRootNode = node;
    }
    if (node.provider) {
      currentParent.providerIndices[node.provider.tokenKey] = i;
      for (let k = 0; k < node.provider.contentQueries.length; k++) {
        currentParent.providerIndices[node.provider.contentQueries[k].id] = i;
      }
      for (let k = 0; k < node.provider.viewQueries.length; k++) {
        currentParent.providerIndices[node.provider.viewQueries[k].id] = i;
      }
    }
    if (node.childCount) {
      currentParent = node;
    }
  }
  while (currentParent) {
    const newParent = nodes[currentParent.parent];
    if (newParent) {
      newParent.childFlags |= currentParent.childFlags;
      copyInto(currentParent.childMatchedQueries, newParent.childMatchedQueries);
    }
    currentParent = newParent;
  }

  return {
    nodeFlags: viewFlags,
    nodeMatchedQueries: viewMatchedQueries, flags,
    nodes: nodes, reverseChildNodes,
    update: update || NOOP,
    handleEvent: handleEvent || NOOP, componentType,
    bindingCount: viewBindingCount,
    disposableCount: viewDisposableCount,
    lastRootNode: lastRootNode.index
  };
}

function copyInto(source: any, target: any) {
  for (let prop in source) {
    target[prop] = source[prop];
  }
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

function validateNode(parent: NodeDef, node: NodeDef) {
  const template = node.element && node.element.template;
  if (template) {
    if (template.lastRootNode != null &&
        template.nodes[template.lastRootNode].flags & NodeFlags.HasEmbeddedViews) {
      throw new Error(
          `Illegal State: Last root node of a template can't have embedded views, at index ${node.index}!`);
    }
  }
  if (node.provider) {
    const parentType = parent ? parent.type : null;
    if (parentType !== NodeType.Element) {
      throw new Error(
          `Illegal State: Provider nodes need to be children of elements or anchors, at index ${node.index}!`);
    }
  }
  if (node.childCount) {
    if (parent) {
      const parentEnd = parent.index + parent.childCount;
      if (node.index <= parentEnd && node.index + node.childCount > parentEnd) {
        throw new Error(
            `Illegal State: childCount of node leads outside of parent, at index ${node.index}!`);
      }
    }
  }
}

function cloneAndModifyNode(nodeDef: NodeDef, values: {
  index: number,
  reverseChildIndex: number,
  parent: number,
  bindingIndex: number,
  disposableIndex: number,
  providerIndices: {[tokenKey: string]: number}
}): NodeDef {
  const clonedNode: NodeDef = <any>{};
  copyInto(nodeDef, clonedNode);

  clonedNode.index = values.index;
  clonedNode.bindingIndex = values.bindingIndex;
  clonedNode.disposableIndex = values.disposableIndex;
  clonedNode.parent = values.parent;
  clonedNode.reverseChildIndex = values.reverseChildIndex;
  clonedNode.providerIndices = values.providerIndices;
  // Note: We can't set the value immediately, as we need to walk the children first.
  clonedNode.childFlags = 0;
  clonedNode.childMatchedQueries = {};
  return clonedNode;
}

export function createEmbeddedView(parent: ViewData, anchorDef: NodeDef, context?: any): ViewData {
  // embedded views are seen as siblings to the anchor, so we need
  // to get the parent of the anchor and use it as parentIndex.
  const view = createView(
      parent.services, parent, anchorDef.index, anchorDef.parent, anchorDef.element.template);
  initView(view, null, parent.component, context);
  return view;
}

export function createRootView(services: Services, def: ViewDefinition, context?: any): ViewData {
  const view = createView(services, null, null, null, def);
  initView(view, null, context, context);
  return view;
}

function createView(
    services: Services, parent: ViewData, parentIndex: number, parentDiIndex: number,
    def: ViewDefinition): ViewData {
  const nodes: NodeData[] = new Array(def.nodes.length);
  let renderer: Renderer;
  if (def.flags != null && (def.flags & ViewFlags.DirectDom)) {
    renderer = null;
  } else {
    renderer = def.componentType ? services.renderComponent(def.componentType) : parent.renderer;
  }
  const disposables = def.disposableCount ? new Array(def.disposableCount) : undefined;
  const view: ViewData = {
    def,
    parent,
    parentIndex,
    parentDiIndex,
    context: undefined,
    component: undefined, nodes,
    firstChange: true, renderer, services,
    oldValues: new Array(def.bindingCount), disposables
  };
  return view;
}

function initView(view: ViewData, renderHost: any, component: any, context: any) {
  view.component = component;
  view.context = context;
  const def = view.def;
  const nodes = view.nodes;
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    let nodeData: any;
    switch (nodeDef.type) {
      case NodeType.Element:
        nodeData = createElement(view, renderHost, nodeDef);
        break;
      case NodeType.Text:
        nodeData = createText(view, renderHost, nodeDef);
        break;
      case NodeType.Provider:
        let componentView: ViewData;
        if (nodeDef.provider.component) {
          componentView = createView(view.services, view, i, i, nodeDef.provider.component());
        }
        nodeData = createProvider(view, nodeDef, componentView);
        break;
      case NodeType.PureExpression:
        nodeData = createPureExpression(view, nodeDef);
        break;
    }
    nodes[i] = nodeData;
  }
  execComponentViewsAction(view, ViewAction.InitComponent);
}

export function checkNoChangesView(view: ViewData) {
  view.def.update(CheckNoChanges, view);
  execEmbeddedViewsAction(view, ViewAction.CheckNoChanges);
  execContentQueriesAction(view, QueryAction.CheckNoChanges);
  execComponentViewsAction(view, ViewAction.CheckNoChanges);
  updateViewQueries(view, QueryAction.CheckNoChanges);
}

const CheckNoChanges: NodeUpdater = {
  checkInline: (view: ViewData, index: number, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any,
                v6: any, v7: any, v8: any, v9: any): void => {
    const nodeDef = view.def.nodes[index];
    // Note: fallthrough is intended!
    switch (nodeDef.bindings.length) {
      case 10:
        checkBindingNoChanges(view, nodeDef, 9, v9);
      case 9:
        checkBindingNoChanges(view, nodeDef, 8, v8);
      case 8:
        checkBindingNoChanges(view, nodeDef, 7, v7);
      case 7:
        checkBindingNoChanges(view, nodeDef, 6, v6);
      case 6:
        checkBindingNoChanges(view, nodeDef, 5, v5);
      case 5:
        checkBindingNoChanges(view, nodeDef, 4, v4);
      case 4:
        checkBindingNoChanges(view, nodeDef, 3, v3);
      case 3:
        checkBindingNoChanges(view, nodeDef, 2, v2);
      case 2:
        checkBindingNoChanges(view, nodeDef, 1, v1);
      case 1:
        checkBindingNoChanges(view, nodeDef, 0, v0);
    }
    if (nodeDef.type === NodeType.PureExpression) {
      return view.nodes[index].pureExpression.value;
    }
    return undefined;
  },
  checkDynamic: (view: ViewData, index: number, values: any[]): void => {
    const nodeDef = view.def.nodes[index];
    for (let i = 0; i < values.length; i++) {
      checkBindingNoChanges(view, nodeDef, i, values[i]);
    }
    if (nodeDef.type === NodeType.PureExpression) {
      return view.nodes[index].pureExpression.value;
    }
    return undefined;
  }
};

export function checkAndUpdateView(view: ViewData) {
  view.def.update(CheckAndUpdate, view);
  execEmbeddedViewsAction(view, ViewAction.CheckAndUpdate);
  execContentQueriesAction(view, QueryAction.CheckAndUpdate);

  callLifecycleHooksChildrenFirst(
      view, NodeFlags.AfterContentChecked | (view.firstChange ? NodeFlags.AfterContentInit : 0));
  execComponentViewsAction(view, ViewAction.CheckAndUpdate);
  updateViewQueries(view, QueryAction.CheckAndUpdate);

  callLifecycleHooksChildrenFirst(
      view, NodeFlags.AfterViewChecked | (view.firstChange ? NodeFlags.AfterViewInit : 0));
  view.firstChange = false;
}

const CheckAndUpdate: NodeUpdater = {
  checkInline: (view: ViewData, index: number, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any,
                v6: any, v7: any, v8: any, v9: any): void => {
    const nodeDef = view.def.nodes[index];
    switch (nodeDef.type) {
      case NodeType.Element:
        checkAndUpdateElementInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        return undefined;
      case NodeType.Text:
        checkAndUpdateTextInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        return undefined;
      case NodeType.Provider:
        checkAndUpdateProviderInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        return undefined;
      case NodeType.PureExpression:
        checkAndUpdatePureExpressionInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        return view.nodes[index].pureExpression.value;
    }
  },
  checkDynamic: (view: ViewData, index: number, values: any[]): void => {
    const nodeDef = view.def.nodes[index];
    switch (nodeDef.type) {
      case NodeType.Element:
        checkAndUpdateElementDynamic(view, nodeDef, values);
        return undefined;
      case NodeType.Text:
        checkAndUpdateTextDynamic(view, nodeDef, values);
        return undefined;
      case NodeType.Provider:
        checkAndUpdateProviderDynamic(view, nodeDef, values);
        return undefined;
      case NodeType.PureExpression:
        checkAndUpdatePureExpressionDynamic(view, nodeDef, values);
        return view.nodes[index].pureExpression.value;
    }
  }
};

export function destroyView(view: ViewData) {
  callLifecycleHooksChildrenFirst(view, NodeFlags.OnDestroy);
  if (view.disposables) {
    for (let i = 0; i < view.disposables.length; i++) {
      view.disposables[i]();
    }
  }
  execComponentViewsAction(view, ViewAction.Destroy);
  execEmbeddedViewsAction(view, ViewAction.Destroy);
}

enum ViewAction {
  InitComponent,
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
      const nodeData = view.nodes[i];
      if (action === ViewAction.InitComponent) {
        let renderHost = view.nodes[nodeDef.parent].elementOrText.node;
        if (view.renderer) {
          renderHost = view.renderer.createViewRoot(renderHost);
        }
        initView(
            nodeData.provider.componentView, renderHost, nodeData.provider.instance,
            nodeData.provider.instance);
      } else {
        callViewAction(nodeData.provider.componentView, action);
      }
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
      const nodeData = view.nodes[i];
      const embeddedViews = nodeData.elementOrText.embeddedViews;
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
  switch (action) {
    case ViewAction.CheckNoChanges:
      checkNoChangesView(view);
      break;
    case ViewAction.CheckAndUpdate:
      checkAndUpdateView(view);
      break;
    case ViewAction.Destroy:
      destroyView(view);
      break;
  }
}
