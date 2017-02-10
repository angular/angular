/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../metadata/view';

import {checkAndUpdateElementDynamic, checkAndUpdateElementInline, createElement} from './element';
import {expressionChangedAfterItHasBeenCheckedError} from './errors';
import {appendNgContent} from './ng_content';
import {callLifecycleHooksChildrenFirst, checkAndUpdateProviderDynamic, checkAndUpdateProviderInline, createProviderInstance} from './provider';
import {checkAndUpdatePureExpressionDynamic, checkAndUpdatePureExpressionInline, createPureExpression} from './pure_expression';
import {checkAndUpdateQuery, createQuery, queryDef} from './query';
import {checkAndUpdateTextDynamic, checkAndUpdateTextInline, createText} from './text';
import {ArgumentType, ComponentDefinition, ElementDef, NodeData, NodeDef, NodeFlags, NodeType, ProviderData, ProviderDef, RootData, Services, TextDef, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewHandleEventFn, ViewState, ViewUpdateFn, asElementData, asProviderData, asPureExpressionData, asQueryList} from './types';
import {checkBindingNoChanges, isComponentView, queryIdIsReference, resolveViewDefinition} from './util';

const NOOP = (): any => undefined;

export function viewDef(
    flags: ViewFlags, nodesWithoutIndices: NodeDef[], update?: ViewUpdateFn,
    handleEvent?: ViewHandleEventFn, compId?: string, encapsulation?: ViewEncapsulation,
    styles?: string[]): ViewDefinition {
  // clone nodes and set auto calculated values
  if (nodesWithoutIndices.length === 0) {
    throw new Error(`Illegal State: Views without nodes are not allowed!`);
  }

  const nodes: NodeDef[] = new Array(nodesWithoutIndices.length);
  const reverseChildNodes: NodeDef[] = new Array(nodesWithoutIndices.length);
  let viewBindingCount = 0;
  let viewDisposableCount = 0;
  let viewNodeFlags = 0;
  let viewMatchedQueries: {[queryId: string]: boolean} = {};
  let currentParent: NodeDef = null;
  let lastRootNode: NodeDef = null;
  for (let i = 0; i < nodesWithoutIndices.length; i++) {
    while (currentParent && i > currentParent.index + currentParent.childCount) {
      const newParent = nodes[currentParent.parent];
      if (newParent) {
        newParent.childFlags |= currentParent.childFlags;
        copyQueryMatchesInto(currentParent.childMatchedQueries, newParent.childMatchedQueries);
      }
      currentParent = newParent;
    }
    const nodeWithoutIndices = nodesWithoutIndices[i];
    const reverseChildIndex = calculateReverseChildIndex(
        currentParent, i, nodeWithoutIndices.childCount, nodesWithoutIndices.length);

    const node = cloneAndModifyNode(nodeWithoutIndices, {
      index: i,
      parent: currentParent ? currentParent.index : undefined,
      bindingIndex: viewBindingCount,
      disposableIndex: viewDisposableCount, reverseChildIndex,
    });
    if (node.element) {
      node.element = cloneAndModifyElement(node.element, {
        // Use protoypical inheritance to not get O(n^2) complexity...
        providerIndices:
            Object.create(currentParent ? currentParent.element.providerIndices : null),
      });
    }
    nodes[i] = node;
    reverseChildNodes[reverseChildIndex] = node;
    validateNode(currentParent, node, nodesWithoutIndices.length);

    viewNodeFlags |= node.flags;
    copyQueryMatchesInto(node.matchedQueries, viewMatchedQueries);
    viewBindingCount += node.bindings.length;
    viewDisposableCount += node.disposableCount;
    if (currentParent) {
      currentParent.childFlags |= node.flags;
      copyQueryMatchesInto(node.matchedQueries, currentParent.childMatchedQueries);
      if (node.element && node.element.template) {
        copyQueryMatchesInto(
            node.element.template.nodeMatchedQueries, currentParent.childMatchedQueries);
      }
    }

    if (!currentParent) {
      lastRootNode = node;
    }
    if (node.provider) {
      currentParent.element.providerIndices[node.provider.tokenKey] = i;
    }
    if (node.query) {
      const elementDef = nodes[currentParent.parent];
      elementDef.element.providerIndices[node.query.id] = i;
    }
    if (node.childCount) {
      currentParent = node;
    }
  }
  while (currentParent) {
    const newParent = nodes[currentParent.parent];
    if (newParent) {
      newParent.childFlags |= currentParent.childFlags;
      copyQueryMatchesInto(currentParent.childMatchedQueries, newParent.childMatchedQueries);
    }
    currentParent = newParent;
  }
  const componentDef =
      compId ? <ComponentDefinition>{id: compId, encapsulation, styles} : undefined;
  return {
    nodeFlags: viewNodeFlags,
    nodeMatchedQueries: viewMatchedQueries, flags,
    nodes: nodes, reverseChildNodes,
    update: update || NOOP,
    handleEvent: handleEvent || NOOP,
    component: componentDef,
    bindingCount: viewBindingCount,
    disposableCount: viewDisposableCount, lastRootNode
  };
}

function copyQueryMatchesInto(
    source: {[queryId: string]: any}, target: {[queryId: string]: boolean}) {
  for (let prop in source) {
    if (!queryIdIsReference(prop)) {
      target[prop] = true;
    }
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

function validateNode(parent: NodeDef, node: NodeDef, nodeCount: number) {
  const template = node.element && node.element.template;
  if (template) {
    if (template.lastRootNode && template.lastRootNode.flags & NodeFlags.HasEmbeddedViews) {
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
  if (node.query) {
    const parentType = parent ? parent.type : null;
    if (parentType !== NodeType.Provider) {
      throw new Error(
          `Illegal State: Query nodes need to be children of providers, at index ${node.index}!`);
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

function cloneAndModifyNode(nodeDef: NodeDef, values: {
  index: number,
  reverseChildIndex: number,
  parent: number,
  bindingIndex: number,
  disposableIndex: number,
}): NodeDef {
  // Attention: don't use copyInto here to prevent v8 from treating this object
  // as a dictionary!
  return {
    type: nodeDef.type,
    index: values.index,
    reverseChildIndex: values.reverseChildIndex,
    parent: values.parent,
    childFlags: 0,
    childMatchedQueries: {},
    bindingIndex: values.bindingIndex,
    disposableIndex: values.disposableIndex,
    flags: nodeDef.flags,
    matchedQueries: nodeDef.matchedQueries,
    ngContentIndex: nodeDef.ngContentIndex,
    childCount: nodeDef.childCount,
    bindings: nodeDef.bindings,
    disposableCount: nodeDef.disposableCount,
    element: nodeDef.element,
    provider: nodeDef.provider,
    text: nodeDef.text,
    pureExpression: nodeDef.pureExpression,
    query: nodeDef.query,
    ngContent: nodeDef.ngContent
  };
}

function cloneAndModifyElement(
    elementDef: ElementDef, values: {providerIndices: {[tokenKey: string]: number}}): ElementDef {
  // Attention: don't use copyInto here to prevent v8 from treating this object
  // as a dictionary!
  return {
    name: elementDef.name,
    attrs: elementDef.attrs,
    outputs: elementDef.outputs,
    template: elementDef.template,
    providerIndices: values.providerIndices,
    source: elementDef.source
  };
}

export function createEmbeddedView(parent: ViewData, anchorDef: NodeDef, context?: any): ViewData {
  // embedded views are seen as siblings to the anchor, so we need
  // to get the parent of the anchor and use it as parentIndex.
  const view = createView(parent.root, parent, anchorDef.index, anchorDef.element.template);
  initView(view, parent.component, context);
  createViewNodes(view);
  return view;
}

export function createRootView(root: RootData, def: ViewDefinition, context?: any): ViewData {
  const view = createView(root, null, null, def);
  initView(view, context, context);
  createViewNodes(view);
  return view;
}

function createView(
    root: RootData, parent: ViewData, parentIndex: number, def: ViewDefinition): ViewData {
  const nodes: NodeData[] = new Array(def.nodes.length);
  const disposables = def.disposableCount ? new Array(def.disposableCount) : undefined;
  const view: ViewData = {
    def,
    parent,
    parentIndex,
    context: undefined,
    component: undefined, nodes,
    state: ViewState.FirstCheck | ViewState.ChecksEnabled, root,
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
    renderHost = asElementData(view.parent, view.parentIndex).renderElement;
  }

  const def = view.def;
  const nodes = view.nodes;
  for (let i = 0; i < def.nodes.length; i++) {
    const nodeDef = def.nodes[i];
    Services.setCurrentNode(view, i);
    switch (nodeDef.type) {
      case NodeType.Element:
        nodes[i] = createElement(view, renderHost, nodeDef) as any;
        break;
      case NodeType.Text:
        nodes[i] = createText(view, renderHost, nodeDef) as any;
        break;
      case NodeType.Provider:
        if (nodeDef.provider.component) {
          // Components can inject a ChangeDetectorRef that needs a references to
          // the component view. Therefore, we create the component view first
          // and set the ProviderData in ViewData, and then instantiate the provider.
          const componentView = createView(
              view.root, view, nodeDef.parent, resolveViewDefinition(nodeDef.provider.component));
          const providerData = <ProviderData>{componentView, instance: undefined};
          nodes[i] = providerData as any;
          const instance = providerData.instance = createProviderInstance(view, nodeDef);
          initView(componentView, instance, instance);
        } else {
          const instance = createProviderInstance(view, nodeDef);
          const providerData = <ProviderData>{componentView: undefined, instance};
          nodes[i] = providerData as any;
        }
        break;
      case NodeType.PureExpression:
        nodes[i] = createPureExpression(view, nodeDef) as any;
        break;
      case NodeType.Query:
        nodes[i] = createQuery() as any;
        break;
      case NodeType.NgContent:
        appendNgContent(view, renderHost, nodeDef);
        // no runtime data needed for NgContent...
        nodes[i] = undefined;
        break;
    }
  }
  // Create the ViewData.nodes of component views after we created everything else,
  // so that e.g. ng-content works
  execComponentViewsAction(view, ViewAction.CreateViewNodes);
}

export function checkNoChangesView(view: ViewData) {
  Services.updateView(checkNoChangesNode, view);
  execEmbeddedViewsAction(view, ViewAction.CheckNoChanges);
  execQueriesAction(view, NodeFlags.HasContentQuery, QueryAction.CheckNoChanges);
  execComponentViewsAction(view, ViewAction.CheckNoChanges);
  execQueriesAction(view, NodeFlags.HasViewQuery, QueryAction.CheckNoChanges);
}

export function checkAndUpdateView(view: ViewData) {
  Services.updateView(checkAndUpdateNode, view);
  execEmbeddedViewsAction(view, ViewAction.CheckAndUpdate);
  execQueriesAction(view, NodeFlags.HasContentQuery, QueryAction.CheckAndUpdate);

  callLifecycleHooksChildrenFirst(
      view, NodeFlags.AfterContentChecked |
          (view.state & ViewState.FirstCheck ? NodeFlags.AfterContentInit : 0));
  execComponentViewsAction(view, ViewAction.CheckAndUpdate);
  execQueriesAction(view, NodeFlags.HasViewQuery, QueryAction.CheckAndUpdate);

  callLifecycleHooksChildrenFirst(
      view, NodeFlags.AfterViewChecked |
          (view.state & ViewState.FirstCheck ? NodeFlags.AfterViewInit : 0));

  if (view.def.flags & ViewFlags.OnPush) {
    view.state &= ~ViewState.ChecksEnabled;
  }
  view.state &= ~ViewState.FirstCheck;
}

function checkAndUpdateNode(
    view: ViewData, nodeIndex: number, argStyle: ArgumentType, v0?: any, v1?: any, v2?: any,
    v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any): any {
  if (argStyle === ArgumentType.Inline) {
    return checkAndUpdateNodeInline(view, nodeIndex, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  } else {
    return checkAndUpdateNodeDynamic(view, nodeIndex, v0);
  }
}

function checkAndUpdateNodeInline(
    view: ViewData, nodeIndex: number, v0?: any, v1?: any, v2?: any, v3?: any, v4?: any, v5?: any,
    v6?: any, v7?: any, v8?: any, v9?: any): any {
  const nodeDef = view.def.nodes[nodeIndex];
  switch (nodeDef.type) {
    case NodeType.Element:
      return checkAndUpdateElementInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case NodeType.Text:
      return checkAndUpdateTextInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case NodeType.Provider:
      return checkAndUpdateProviderInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case NodeType.PureExpression:
      return checkAndUpdatePureExpressionInline(
          view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  }
}

function checkAndUpdateNodeDynamic(view: ViewData, nodeIndex: number, values: any[]): any {
  const nodeDef = view.def.nodes[nodeIndex];
  switch (nodeDef.type) {
    case NodeType.Element:
      return checkAndUpdateElementDynamic(view, nodeDef, values);
    case NodeType.Text:
      return checkAndUpdateTextDynamic(view, nodeDef, values);
    case NodeType.Provider:
      return checkAndUpdateProviderDynamic(view, nodeDef, values);
    case NodeType.PureExpression:
      return checkAndUpdatePureExpressionDynamic(view, nodeDef, values);
  }
}

function checkNoChangesNode(
    view: ViewData, nodeIndex: number, argStyle: ArgumentType, v0?: any, v1?: any, v2?: any,
    v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any): any {
  if (argStyle === ArgumentType.Inline) {
    return checkNoChangesNodeInline(view, nodeIndex, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  } else {
    return checkNoChangesNodeDynamic(view, nodeIndex, v0);
  }
}

function checkNoChangesNodeInline(
    view: ViewData, nodeIndex: number, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any,
    v6: any, v7: any, v8: any, v9: any): void {
  const nodeDef = view.def.nodes[nodeIndex];
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
  return nodeDef.type === NodeType.PureExpression ? asPureExpressionData(view, nodeIndex).value :
                                                    undefined;
}

function checkNoChangesNodeDynamic(view: ViewData, nodeIndex: number, values: any[]): void {
  const nodeDef = view.def.nodes[nodeIndex];
  for (let i = 0; i < values.length; i++) {
    checkBindingNoChanges(view, nodeDef, i, values[i]);
  }
  return nodeDef.type === NodeType.PureExpression ? asPureExpressionData(view, nodeIndex).value :
                                                    undefined;
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
  callLifecycleHooksChildrenFirst(view, NodeFlags.OnDestroy);
  if (view.disposables) {
    for (let i = 0; i < view.disposables.length; i++) {
      view.disposables[i]();
    }
  }
  execComponentViewsAction(view, ViewAction.Destroy);
  execEmbeddedViewsAction(view, ViewAction.Destroy);
  view.state |= ViewState.Destroyed;
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
      const providerData = asProviderData(view, i);
      callViewAction(providerData.componentView, action);
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

enum QueryAction {
  CheckAndUpdate,
  CheckNoChanges
}

function execQueriesAction(view: ViewData, queryFlags: NodeFlags, action: QueryAction) {
  if (!(view.def.nodeFlags & queryFlags)) {
    return;
  }
  const nodeCount = view.def.nodes.length;
  for (let i = 0; i < nodeCount; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.flags & queryFlags) {
      Services.setCurrentNode(view, nodeDef.index);
      switch (action) {
        case QueryAction.CheckAndUpdate:
          checkAndUpdateQuery(view, nodeDef);
          break;
        case QueryAction.CheckNoChanges:
          checkNoChangesQuery(view, nodeDef);
          break;
      }
    } else if ((nodeDef.childFlags & queryFlags) === 0) {
      // no child has a content query
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}
