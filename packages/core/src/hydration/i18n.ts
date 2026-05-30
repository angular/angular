/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injector} from '../di';
import {isRootTemplateMessage} from '../render3/i18n/i18n_util';
import {createIcuIterator} from '../render3/i18n/i18n_icu_container_visitor';
import {I18nNode, I18nNodeKind, I18nPlaceholderType, TI18n, TIcu} from '../render3/interfaces/i18n';
import {isTNodeShape, TNode, TNodeType} from '../render3/interfaces/node';
import type {Renderer} from '../render3/interfaces/renderer';
import type {RNode} from '../render3/interfaces/renderer_dom';
import {HEADER_OFFSET, HYDRATION, LView, RENDERER, TView, TVIEW} from '../render3/interfaces/view';
import {getFirstNativeNode} from '../render3/node_manipulation';
import {nativeRemoveNode} from '../render3/dom_node_manipulation';
import {unwrapRNode} from '../render3/util/view_utils';
import {assertDefined, assertNotEqual} from '../util/assert';

import type {HydrationContext} from './annotate';
import {DehydratedIcuData, DehydratedView, I18N_DATA} from './interfaces';
import {isDisconnectedRNode, locateNextRNode, tryLocateRNodeByPath} from './node_lookup_utils';
import {isI18nInSkipHydrationBlock} from './skip_hydration';
import {IS_I18N_HYDRATION_ENABLED} from './tokens';
import {
  getNgContainerSize,
  initDisconnectedNodes,
  isDisconnectedNode,
  isSerializedElementContainer,
  processTextNodeBeforeSerialization,
} from './utils';

let _isI18nHydrationSupportEnabled = false;

let _prepareI18nBlockForHydrationImpl: typeof prepareI18nBlockForHydrationImpl = () => {
  // noop unless `enablePrepareI18nBlockForHydrationImpl` is invoked.
};

export function setIsI18nHydrationSupportEnabled(enabled: boolean) {
  _isI18nHydrationSupportEnabled = enabled;
}

export function isI18nHydrationSupportEnabled() {
  return _isI18nHydrationSupportEnabled;
}

/**
 * Prepares an i18n block and its children, located at the given
 * view and instruction index, for hydration.
 *
 * @param lView lView with the i18n block
 * @param index index of the i18n block in the lView
 * @param parentTNode TNode of the parent of the i18n block
 * @param subTemplateIndex sub-template index, or -1 for the main template
 */
export function prepareI18nBlockForHydration(
  lView: LView,
  index: number,
  parentTNode: TNode | null,
  subTemplateIndex: number,
): void {
  _prepareI18nBlockForHydrationImpl(lView, index, parentTNode, subTemplateIndex);
}

export function enablePrepareI18nBlockForHydrationImpl() {
  _prepareI18nBlockForHydrationImpl = prepareI18nBlockForHydrationImpl;
}

export function isI18nHydrationEnabled(injector?: Injector) {
  injector = injector ?? inject(Injector);
  return injector.get(IS_I18N_HYDRATION_ENABLED, false);
}

/**
 * Collects, if not already cached, all of the indices in the
 * given TView which are children of an i18n block.
 *
 * Since i18n blocks don't introduce a parent TNode, this is necessary
 * in order to determine which indices in a LView are translated.
 */
export function getOrComputeI18nChildren(
  tView: TView,
  context: HydrationContext,
): Set<number> | null {
  let i18nChildren = context.i18nChildren.get(tView);
  if (i18nChildren === undefined) {
    i18nChildren = collectI18nChildren(tView);
    context.i18nChildren.set(tView, i18nChildren);
  }
  return i18nChildren;
}

function collectI18nChildren(tView: TView): Set<number> | null {
  const children = new Set<number>();

  function collectI18nViews(node: I18nNode) {
    children.add(node.index);

    switch (node.kind) {
      case I18nNodeKind.ELEMENT:
      case I18nNodeKind.PLACEHOLDER: {
        for (const childNode of node.children) {
          collectI18nViews(childNode);
        }
        break;
      }

      case I18nNodeKind.ICU: {
        for (const caseNodes of node.cases) {
          for (const caseNode of caseNodes) {
            collectI18nViews(caseNode);
          }
        }
        break;
      }
    }
  }

  // Traverse through the AST of each i18n block in the LView,
  // and collect every instruction index.
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const tI18n = tView.data[i] as TI18n | undefined;
    if (!tI18n || !tI18n.ast) {
      continue;
    }

    for (const node of tI18n.ast) {
      collectI18nViews(node);
    }
  }

  return children.size === 0 ? null : children;
}

/**
 * Resulting data from serializing an i18n block.
 */
export interface SerializedI18nBlock {
  /**
   * A queue of active ICU cases from a depth-first traversal
   * of the i18n AST. This is serialized to the client in order
   * to correctly associate DOM nodes with i18n nodes during
   * hydration.
   */
  caseQueue: Array<number>;

  /**
   * A set of indices in the lView of the block for nodes
   * that are disconnected from the DOM. In i18n, this can
   * happen when using content projection but some nodes are
   * not selected by an <ng-content />.
   */
  disconnectedNodes: Set<number>;

  /**
   * A set of indices in the lView of the block for nodes
   * considered "disjoint", indicating that we need to serialize
   * a path to the node in order to hydrate it.
   *
   * A node is considered disjoint when its RNode does not
   * directly follow the RNode of the previous i18n node, for
   * example, because of content projection.
   */
  disjointNodes: Set<number>;
}

/**
 * Attempts to serialize i18n data for an i18n block, located at
 * the given view and instruction index.
 *
 * @param lView lView with the i18n block
 * @param index index of the i18n block in the lView
 * @param context the hydration context
 * @returns the i18n data, or null if there is no relevant data
 */
export function trySerializeI18nBlock(
  lView: LView,
  index: number,
  context: HydrationContext,
): SerializedI18nBlock | null {
  if (!context.isI18nHydrationEnabled) {
    return null;
  }

  const tView = lView[TVIEW];
  const tI18n = tView.data[index] as TI18n | undefined;
  if (!tI18n || !tI18n.ast) {
    return null;
  }

  const parentTNode = tView.data[tI18n.parentTNodeIndex] as TNode;
  if (parentTNode && isI18nInSkipHydrationBlock(parentTNode)) {
    return null;
  }

  const serializedI18nBlock: SerializedI18nBlock = {
    caseQueue: [],
    disconnectedNodes: new Set(),
    disjointNodes: new Set(),
  };
  serializeI18nBlock(lView, serializedI18nBlock, context, tI18n.ast);

  return serializedI18nBlock.caseQueue.length === 0 &&
    serializedI18nBlock.disconnectedNodes.size === 0 &&
    serializedI18nBlock.disjointNodes.size === 0
    ? null
    : serializedI18nBlock;
}

function serializeI18nBlock(
  lView: LView,
  serializedI18nBlock: SerializedI18nBlock,
  context: HydrationContext,
  nodes: I18nNode[],
): Node | null {
  let prevRNode = null;
  for (const node of nodes) {
    const nextRNode = serializeI18nNode(lView, serializedI18nBlock, context, node);
    if (nextRNode) {
      if (isDisjointNode(prevRNode, nextRNode)) {
        serializedI18nBlock.disjointNodes.add(node.index - HEADER_OFFSET);
      }
      prevRNode = nextRNode;
    }
  }
  return prevRNode;
}

/**
 * Helper to determine whether the given nodes are "disjoint".
 *
 * The i18n hydration process walks through the DOM and i18n nodes
 * at the same time. It expects the sibling DOM node of the previous
 * i18n node to be the first node of the next i18n node.
 *
 * In cases of content projection, this won't always be the case. So
 * when we detect that, we mark the node as "disjoint", ensuring that
 * we will serialize the path to the node. This way, when we hydrate the
 * i18n node, we will be able to find the correct place to start.
 */
function isDisjointNode(prevNode: Node | null, nextNode: Node) {
  return prevNode && prevNode.nextSibling !== nextNode;
}

/**
 * Process the given i18n node for serialization.
 * Returns the first RNode for the i18n node to begin hydration.
 */
function serializeI18nNode(
  lView: LView,
  serializedI18nBlock: SerializedI18nBlock,
  context: HydrationContext,
  node: I18nNode,
): Node | null {
  const maybeRNode = unwrapRNode(lView[node.index]!);
  if (!maybeRNode || isDisconnectedRNode(maybeRNode)) {
    serializedI18nBlock.disconnectedNodes.add(node.index - HEADER_OFFSET);
    return null;
  }

  const rNode = maybeRNode as Node;
  switch (node.kind) {
    case I18nNodeKind.TEXT: {
      processTextNodeBeforeSerialization(context, rNode);
      break;
    }

    case I18nNodeKind.ELEMENT:
    case I18nNodeKind.PLACEHOLDER: {
      serializeI18nBlock(lView, serializedI18nBlock, context, node.children);
      break;
    }

    case I18nNodeKind.ICU: {
      const currentCase = lView[node.currentCaseLViewIndex] as number | null;
      if (currentCase != null) {
        // i18n uses a negative value to signal a change to a new case, so we
        // need to invert it to get the proper value.
        const caseIdx = currentCase < 0 ? ~currentCase : currentCase;
        serializedI18nBlock.caseQueue.push(caseIdx);
        serializeI18nBlock(lView, serializedI18nBlock, context, node.cases[caseIdx]);
      }
      break;
    }
  }

  return getFirstNativeNodeForI18nNode(lView, node) as Node | null;
}

/**
 * Helper function to get the first native node to begin hydrating
 * the given i18n node.
 */
function getFirstNativeNodeForI18nNode(lView: LView, node: I18nNode) {
  const tView = lView[TVIEW];
  const maybeTNode = tView.data[node.index];

  if (isTNodeShape(maybeTNode)) {
    // If the node is backed by an actual TNode, we can simply delegate.
    return getFirstNativeNode(lView, maybeTNode);
  } else if (node.kind === I18nNodeKind.ICU) {
    // A nested ICU container won't have an actual TNode. In that case, we can use
    // an iterator to find the first child.
    const icuIterator = createIcuIterator(maybeTNode as TIcu, lView);
    let rNode: RNode | null = icuIterator();

    // If the ICU container has no nodes, then we use the ICU anchor as the node.
    return rNode ?? unwrapRNode(lView[node.index]);
  } else {
    // Otherwise, the node is a text or trivial element in an ICU container,
    // and we can just use the RNode directly.
    return unwrapRNode(lView[node.index]) ?? null;
  }
}

/**
 * Describes shared data available during the hydration process.
 */
interface I18nHydrationContext {
  hydrationInfo: DehydratedView;
  lView: LView;
  i18nNodes: Map<number, RNode | null>;
  disconnectedNodes: Set<number>;
  caseQueue: number[];
  dehydratedIcuData: Map<number, DehydratedIcuData>;
}

/**
 * Describes current hydration state.
 */
interface I18nHydrationState {
  // The current node
  currentNode: Node | null;

  /**
   * Whether the tree should be connected.
   *
   * During hydration, it can happen that we expect to have a
   * current RNode, but we don't. In such cases, we still need
   * to propagate the expectation to the corresponding LViews,
   * so that the proper downstream error handling can provide
   * the correct context for the error.
   */
  isConnected: boolean;
}

function setCurrentNode(state: I18nHydrationState, node: Node | null) {
  state.currentNode = node;
}

/**
 * Marks the current RNode as the hydration root for the given
 * AST node.
 */
function appendI18nNodeToCollection(
  context: I18nHydrationContext,
  state: I18nHydrationState,
  astNode: I18nNode,
) {
  const noOffsetIndex = astNode.index - HEADER_OFFSET;
  const {disconnectedNodes} = context;
  const currentNode = state.currentNode;

  if (state.isConnected) {
    context.i18nNodes.set(noOffsetIndex, currentNode);

    // We expect the node to be connected, so ensure that it
    // is not in the set, regardless of whether we found it,
    // so that the downstream error handling can provide the
    // proper context.
    disconnectedNodes.delete(noOffsetIndex);
  } else {
    disconnectedNodes.add(noOffsetIndex);
  }

  return currentNode;
}

/**
 * Skip over some sibling nodes during hydration.
 *
 * Note: we use this instead of `siblingAfter` as it's expected that
 * sometimes we might encounter null nodes. In those cases, we want to
 * defer to downstream error handling to provide proper context.
 */
function skipSiblingNodes(state: I18nHydrationState, skip: number) {
  let currentNode = state.currentNode;
  for (let i = 0; i < skip; i++) {
    if (!currentNode) {
      break;
    }
    currentNode = currentNode?.nextSibling ?? null;
  }
  return currentNode;
}

/**
 * Fork the given state into a new state for hydrating children.
 */
function forkHydrationState(state: I18nHydrationState, nextNode: Node | null) {
  return {currentNode: nextNode, isConnected: state.isConnected};
}

function prepareI18nBlockForHydrationImpl(
  lView: LView,
  index: number,
  parentTNode: TNode | null,
  subTemplateIndex: number,
) {
  const hydrationInfo = lView[HYDRATION];
  if (!hydrationInfo) {
    return;
  }

  if (
    !isI18nHydrationSupportEnabled() ||
    (parentTNode &&
      (isI18nInSkipHydrationBlock(parentTNode) ||
        isDisconnectedNode(hydrationInfo, parentTNode.index - HEADER_OFFSET)))
  ) {
    return;
  }

  const tView = lView[TVIEW];
  const tI18n = tView.data[index] as TI18n;
  ngDevMode &&
    assertDefined(tI18n, 'Expected i18n data to be present in a given TView slot during hydration');

  function findHydrationRoot() {
    if (isRootTemplateMessage(subTemplateIndex)) {
      // This is the root of an i18n block. In this case, our hydration root will
      // depend on where our parent TNode (i.e. the block with i18n applied) is
      // in the DOM.
      ngDevMode && assertDefined(parentTNode, 'Expected parent TNode while hydrating i18n root');
      const rootNode = locateNextRNode(hydrationInfo!, tView, lView, parentTNode!) as Node;

      // If this i18n block is attached to an <ng-container>, then we want to begin
      // hydrating directly with the RNode. Otherwise, for a TNode with a physical DOM
      // element, we want to recurse into the first child and begin there.
      return parentTNode!.type & TNodeType.ElementContainer ? rootNode : rootNode.firstChild;
    }

    // This is a nested template in an i18n block. In this case, the entire view
    // is translated, and part of a dehydrated view in a container. This means that
    // we can simply begin hydration with the first dehydrated child.
    return hydrationInfo?.firstChild as Node;
  }

  const currentNode = findHydrationRoot();
  ngDevMode && assertDefined(currentNode, 'Expected root i18n node during hydration');

  const disconnectedNodes = initDisconnectedNodes(hydrationInfo) ?? new Set();
  const i18nNodes = (hydrationInfo.i18nNodes ??= new Map<number, RNode | null>());
  const caseQueue = hydrationInfo.data[I18N_DATA]?.[index - HEADER_OFFSET] ?? [];
  const dehydratedIcuData = (hydrationInfo.dehydratedIcuData ??= new Map<
    number,
    DehydratedIcuData
  >());

  collectI18nNodesFromDom(
    {hydrationInfo, lView, i18nNodes, disconnectedNodes, caseQueue, dehydratedIcuData},
    {currentNode, isConnected: true},
    tI18n.ast,
  );

  // Nodes from inactive ICU cases should be considered disconnected. We track them above
  // because they aren't (and shouldn't be) serialized. Since we may mutate or create a
  // new set, we need to be sure to write the expected value back to the DehydratedView.
  hydrationInfo.disconnectedNodes = disconnectedNodes.size === 0 ? null : disconnectedNodes;
}

function collectI18nNodesFromDom(
  context: I18nHydrationContext,
  state: I18nHydrationState,
  nodeOrNodes: I18nNode | I18nNode[],
) {
  if (Array.isArray(nodeOrNodes)) {
    let nextState = state;
    for (const node of nodeOrNodes) {
      // Whenever a node doesn't directly follow the previous RNode, it
      // is given a path. We need to resume collecting nodes from that location
      // until and unless we find another disjoint node.
      const targetNode = tryLocateRNodeByPath(
        context.hydrationInfo,
        context.lView,
        node.index - HEADER_OFFSET,
      );
      if (targetNode) {
        nextState = forkHydrationState(state, targetNode as Node);
      }
      collectI18nNodesFromDom(context, nextState, node);
    }
  } else {
    if (context.disconnectedNodes.has(nodeOrNodes.index - HEADER_OFFSET)) {
      // i18n nodes can be considered disconnected if e.g. they were projected.
      // In that case, we have to make sure to skip over them.
      return;
    }

    switch (nodeOrNodes.kind) {
      case I18nNodeKind.TEXT: {
        // Claim a text node for hydration
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }

      case I18nNodeKind.ELEMENT: {
        // Recurse into the current element's children...
        collectI18nNodesFromDom(
          context,
          forkHydrationState(state, state.currentNode?.firstChild ?? null),
          nodeOrNodes.children,
        );

        // And claim the parent element itself.
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }

      case I18nNodeKind.PLACEHOLDER: {
        const noOffsetIndex = nodeOrNodes.index - HEADER_OFFSET;
        const {hydrationInfo} = context;
        const containerSize = getNgContainerSize(hydrationInfo, noOffsetIndex);

        switch (nodeOrNodes.type) {
          case I18nPlaceholderType.ELEMENT: {
            // Hydration expects to find the head of the element.
            const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);

            // A TNode for the node may not yet if we're hydrating during the first pass,
            // so use the serialized data to determine if this is an <ng-container>.
            if (isSerializedElementContainer(hydrationInfo, noOffsetIndex)) {
              // An <ng-container> doesn't have a physical DOM node, so we need to
              // continue hydrating from siblings.
              collectI18nNodesFromDom(context, state, nodeOrNodes.children);

              // Skip over the anchor element. It will be claimed by the
              // downstream container hydration.
              const nextNode = skipSiblingNodes(state, 1);
              setCurrentNode(state, nextNode);
            } else {
              // Non-container elements represent an actual node in the DOM, so we
              // need to continue hydration with the children, and claim the node.
              collectI18nNodesFromDom(
                context,
                forkHydrationState(state, state.currentNode?.firstChild ?? null),
                nodeOrNodes.children,
              );
              setCurrentNode(state, currentNode?.nextSibling ?? null);

              // Elements can also be the anchor of a view container, so there may
              // be elements after this node that we need to skip.
              if (containerSize !== null) {
                // `+1` stands for an anchor node after all of the views in the container.
                const nextNode = skipSiblingNodes(state, containerSize + 1);
                setCurrentNode(state, nextNode);
              }
            }
            break;
          }

          case I18nPlaceholderType.SUBTEMPLATE: {
            ngDevMode &&
              assertNotEqual(
                containerSize,
                null,
                'Expected a container size while hydrating i18n subtemplate',
              );

            // Hydration expects to find the head of the template.
            appendI18nNodeToCollection(context, state, nodeOrNodes);

            // Skip over all of the template children, as well as the anchor
            // node, since the template itself will handle them instead.
            const nextNode = skipSiblingNodes(state, containerSize! + 1);
            setCurrentNode(state, nextNode);
            break;
          }
        }
        break;
      }

      case I18nNodeKind.ICU: {
        // If the current node is connected, we need to pop the next case from the
        // queue, so that the active case is also considered connected.
        const selectedCase = state.isConnected ? context.caseQueue.shift()! : null;
        const childState = {currentNode: null, isConnected: false};

        // We traverse through each case, even if it's not active,
        // so that we correctly populate disconnected nodes.
        for (let i = 0; i < nodeOrNodes.cases.length; i++) {
          collectI18nNodesFromDom(
            context,
            i === selectedCase ? state : childState,
            nodeOrNodes.cases[i],
          );
        }

        if (selectedCase !== null) {
          // ICUs represent a branching state, and the selected case could be different
          // than what it was on the server. In that case, we need to be able to clean
          // up the nodes from the original case. To do that, we store the selected case.
          context.dehydratedIcuData.set(nodeOrNodes.index, {case: selectedCase, node: nodeOrNodes});
        }

        // Hydration expects to find the ICU anchor element.
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }
    }
  }
}

let _claimDehydratedIcuCaseImpl: typeof claimDehydratedIcuCaseImpl = () => {
  // noop unless `enableClaimDehydratedIcuCaseImpl` is invoked
};

/**
 * Mark the case for the ICU node at the given index in the view as claimed,
 * allowing its nodes to be hydrated and not cleaned up.
 */
export function claimDehydratedIcuCase(lView: LView, icuIndex: number, caseIndex: number) {
  _claimDehydratedIcuCaseImpl(lView, icuIndex, caseIndex);
}

export function enableClaimDehydratedIcuCaseImpl() {
  _claimDehydratedIcuCaseImpl = claimDehydratedIcuCaseImpl;
}

function claimDehydratedIcuCaseImpl(lView: LView, icuIndex: number, caseIndex: number) {
  const dehydratedIcuDataMap = lView[HYDRATION]?.dehydratedIcuData;
  if (dehydratedIcuDataMap) {
    const dehydratedIcuData = dehydratedIcuDataMap.get(icuIndex);
    if (dehydratedIcuData?.case === caseIndex) {
      // If the case we're attempting to claim matches the dehydrated one,
      // we remove it from the map to mark it as "claimed."
      dehydratedIcuDataMap.delete(icuIndex);
    }
  }
}

/**
 * Clean up all i18n hydration data associated with the given view.
 */
export function cleanupI18nHydrationData(lView: LView) {
  const hydrationInfo = lView[HYDRATION];
  if (hydrationInfo) {
    const {i18nNodes, dehydratedIcuData: dehydratedIcuDataMap} = hydrationInfo;
    if (i18nNodes && dehydratedIcuDataMap) {
      const renderer = lView[RENDERER];
      for (const dehydratedIcuData of dehydratedIcuDataMap.values()) {
        cleanupDehydratedIcuData(renderer, i18nNodes, dehydratedIcuData);
      }
    }

    hydrationInfo.i18nNodes = undefined;
    hydrationInfo.dehydratedIcuData = undefined;
  }
}

function cleanupDehydratedIcuData(
  renderer: Renderer,
  i18nNodes: Map<number, RNode | null>,
  dehydratedIcuData: DehydratedIcuData,
) {
  for (const node of dehydratedIcuData.node.cases[dehydratedIcuData.case]) {
    const rNode = i18nNodes.get(node.index - HEADER_OFFSET);
    if (rNode) {
      nativeRemoveNode(renderer, rNode, false);
    }
  }
}
