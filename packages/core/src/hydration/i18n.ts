/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Injector} from '../di';
import {I18nNode, I18nNodeKind, I18nPlaceholderType, TI18n} from '../render3/interfaces/i18n';
import {TNode} from '../render3/interfaces/node';
import {RNode} from '../render3/interfaces/renderer_dom';
import {HEADER_OFFSET, HYDRATION, LView, TVIEW} from '../render3/interfaces/view';
import {unwrapRNode} from '../render3/util/view_utils';
import {assertDefined, assertNotEqual} from '../util/assert';

import type {HydrationContext} from './annotate';
import {DehydratedView, I18N_DATA} from './interfaces';
import {locateNextRNode} from './node_lookup_utils';
import {IS_I18N_HYDRATION_ENABLED} from './tokens';
import {getNgContainerSize, initDisconnectedNodes, processTextNodeBeforeSerialization} from './utils';

let _isI18nHydrationSupportEnabled = false;

let _prepareI18nBlockForHydrationImpl: typeof prepareI18nBlockForHydrationImpl = (lView, index) => {
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
 */
export function prepareI18nBlockForHydration(lView: LView, index: number): void {
  _prepareI18nBlockForHydrationImpl(lView, index);
}

export function enablePrepareI18nBlockForHydrationImpl() {
  _prepareI18nBlockForHydrationImpl = prepareI18nBlockForHydrationImpl;
}

export function isI18nHydrationEnabled(injector?: Injector) {
  injector = injector ?? inject(Injector);
  return injector.get(IS_I18N_HYDRATION_ENABLED, false);
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
    lView: LView, index: number, context: HydrationContext): Array<number>|null {
  if (!context.isI18nHydrationEnabled) {
    return null;
  }

  const tView = lView[TVIEW];
  const tI18n = tView.data[index] as TI18n | undefined;
  if (!tI18n || !tI18n.ast) {
    return null;
  }

  const caseQueue: number[] = [];
  tI18n.ast.forEach(node => serializeI18nBlock(lView, caseQueue, context, node));
  return caseQueue.length > 0 ? caseQueue : null;
}

function serializeI18nBlock(
    lView: LView, caseQueue: number[], context: HydrationContext, node: I18nNode) {
  switch (node.kind) {
    case I18nNodeKind.TEXT:
      const rNode = unwrapRNode(lView[node.index]!);
      processTextNodeBeforeSerialization(context, rNode);
      break;

    case I18nNodeKind.ELEMENT:
    case I18nNodeKind.PLACEHOLDER:
      node.children.forEach(node => serializeI18nBlock(lView, caseQueue, context, node));
      break;

    case I18nNodeKind.ICU:
      const currentCase = lView[node.currentCaseLViewIndex] as number | null;
      if (currentCase != null) {
        // i18n uses a negative value to signal a change to a new case, so we
        // need to invert it to get the proper value.
        const caseIdx = currentCase < 0 ? ~currentCase : currentCase;
        caseQueue.push(caseIdx);
        node.cases[caseIdx].forEach(node => serializeI18nBlock(lView, caseQueue, context, node));
      }
      break;
  }
}

/**
 * Describes shared data available during the hydration process.
 */
interface I18nHydrationContext {
  hydrationInfo: DehydratedView;
  i18nNodes: Map<number, RNode|null>;
  disconnectedNodes: Set<number>;
  caseQueue: number[];
}

/**
 * Describes current hydration state.
 */
interface I18nHydrationState {
  // The current node
  currentNode: Node|null;

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

function setCurrentNode(state: I18nHydrationState, node: Node|null) {
  state.currentNode = node;
}

/**
 * Marks the current RNode as the hydration root for the given
 * AST node.
 */
function appendI18nNodeToCollection(
    context: I18nHydrationContext, state: I18nHydrationState, astNode: I18nNode) {
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
function forkChildHydrationState(state: I18nHydrationState) {
  const currentNode = state.currentNode as Node | null;
  return {currentNode: currentNode?.firstChild ?? null, isConnected: state.isConnected};
}

function prepareI18nBlockForHydrationImpl(lView: LView, index: number) {
  if (!isI18nHydrationSupportEnabled()) {
    return;
  }

  const hydrationInfo = lView[HYDRATION];
  if (!hydrationInfo) {
    return;
  }

  const tView = lView[TVIEW];
  const tI18n = tView.data[index] as TI18n;
  ngDevMode &&
      assertDefined(
          tI18n, 'Expected i18n data to be present in a given TView slot during hydration');

  const firstAstNode = tI18n.ast[0];
  if (firstAstNode) {
    // Hydration for an i18n block begins at the RNode for the first AST node.
    //
    // Since the first AST node is a top-level node created by `i18nStartFirstCreatePass`,
    // it should always have a valid TNode. This means we can use the normal `locateNextRNode`
    // function to determine where to begin.
    //
    // It's OK if nothing is located, as that also means that there is nothing to clean up.
    // Downstream error handling will detect this and provide proper context.
    const tNode = tView.data[firstAstNode.index] as TNode;
    ngDevMode && assertDefined(tNode, 'expected top-level i18n AST node to have TNode');

    const rootNode = locateNextRNode(hydrationInfo, tView, lView, tNode) as Node | null;
    const disconnectedNodes = initDisconnectedNodes(hydrationInfo) ?? new Set();
    const i18nNodes = hydrationInfo.i18nNodes ??= new Map<number, RNode|null>();
    const caseQueue = hydrationInfo.data[I18N_DATA]?.[index - HEADER_OFFSET] ?? [];

    collectI18nNodesFromDom(
        {hydrationInfo, i18nNodes, disconnectedNodes, caseQueue},
        {currentNode: rootNode, isConnected: true}, tI18n.ast);

    // Nodes from inactive ICU cases should be considered disconnected. We track them above
    // because they aren't (and shouldn't be) serialized. Since we may mutate or create a
    // new set, we need to be sure to write the expected value back to the DehydratedView.
    hydrationInfo.disconnectedNodes = disconnectedNodes.size === 0 ? null : disconnectedNodes;
  }
}

function collectI18nNodesFromDom(
    context: I18nHydrationContext, state: I18nHydrationState, nodeOrNodes: I18nNode|I18nNode[]) {
  if (Array.isArray(nodeOrNodes)) {
    for (let i = 0; i < nodeOrNodes.length; i++) {
      collectI18nNodesFromDom(context, state, nodeOrNodes[i]);
    }
  } else {
    switch (nodeOrNodes.kind) {
      case I18nNodeKind.TEXT: {
        // Claim a text node for hydration
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }

      case I18nNodeKind.ELEMENT: {
        // Recurse into the current element's children...
        collectI18nNodesFromDom(context, forkChildHydrationState(state), nodeOrNodes.children);

        // And claim the parent element itself.
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }

      case I18nNodeKind.PLACEHOLDER: {
        const containerSize =
            getNgContainerSize(context.hydrationInfo, nodeOrNodes.index - HEADER_OFFSET);

        switch (nodeOrNodes.type) {
          case I18nPlaceholderType.ELEMENT: {
            // Hydration expects to find the head of the element.
            const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);

            if (containerSize === null) {
              // Non-container elements represent an actual node in the DOM, so we
              // need to continue hydration with the children, and claim the node.
              collectI18nNodesFromDom(
                  context, forkChildHydrationState(state), nodeOrNodes.children);
              setCurrentNode(state, currentNode?.nextSibling ?? null);
            } else {
              // Containers only have an anchor comment, so we need to continue
              // hydrating from siblings.
              collectI18nNodesFromDom(context, state, nodeOrNodes.children);

              // Skip over the anchor element too. It will be claimed by the
              // downstream container hydration.
              const nextNode = skipSiblingNodes(state, 1);
              setCurrentNode(state, nextNode);
            }
            break;
          }

          case I18nPlaceholderType.SUBTEMPLATE: {
            ngDevMode &&
                assertNotEqual(
                    containerSize, null,
                    'Expected a container size while hydrating i18n subtemplate');

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
              context, i === selectedCase ? state : childState, nodeOrNodes.cases[i]);
        }

        // Hydration expects to find the ICU anchor element.
        const currentNode = appendI18nNodeToCollection(context, state, nodeOrNodes);
        setCurrentNode(state, currentNode?.nextSibling ?? null);
        break;
      }
    }
  }
}
