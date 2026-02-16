/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DEFER_BLOCK_STATE,
  DeferBlockInternalState,
  DeferBlockState,
  DeferBlockTrigger,
  LDeferBlockDetails,
  LOADING_AFTER_SLOT,
  MINIMUM_SLOT,
  SSR_UNIQUE_ID,
  TDeferBlockDetails,
} from '../../defer/interfaces';
import {DEHYDRATED_BLOCK_REGISTRY, DehydratedBlockRegistry} from '../../defer/registry';
import {
  getLDeferBlockDetails,
  getTDeferBlockDetails,
  isTDeferBlockDetails,
} from '../../defer/utils';
import {NUM_ROOT_NODES} from '../../hydration/interfaces';
import {NGH_DEFER_BLOCKS_KEY} from '../../hydration/utils';
import {TransferState} from '../../transfer_state';
import {assertLView} from '../assert';
import {collectNativeNodes} from '../collect_native_nodes';
import {getLContext} from '../context_discovery';
import {CONTAINER_HEADER_OFFSET, LContainer, NATIVE} from '../interfaces/container';
import {HOST, INJECTOR, LView, TVIEW, HEADER_OFFSET} from '../interfaces/view';
import {getNativeByTNode} from './view_utils';
import {isLContainer, isLView} from '../interfaces/type_checks';

import {
  ControlFlowBlock,
  ControlFlowBlockViewFinder,
  ControlFlowBlockViewFinderConfig,
  ControlFlowBlockType,
  DeferBlockData,
  ForLoopBlockData,
  RepeaterMetadataShape,
} from './control_flow_types';
import {TNode} from '../interfaces/node';

/**
 * Gets all of the control flow blocks that are present inside the specified DOM node.
 * @param node Node in which to look for control flow blocks.
 *
 * @publicApi
 */
export function getControlFlowBlocks(node: Node): ControlFlowBlock[] {
  const results: ControlFlowBlock[] = [];
  const lView = getLContext(node)?.lView;

  if (lView) {
    findControlFlowBlocks(node, lView, results);
  }

  return results;
}

/**
 * Finds and returns all `@defer` blocks in a LView.
 *
 * @param config Finder configuration object.
 * @returns
 */
const deferBlockFinder: ControlFlowBlockViewFinder = ({
  node,
  lView,
  tView,
  slotIdx,
}: ControlFlowBlockViewFinderConfig) => {
  const slot = lView[slotIdx];
  if (!isLContainer(slot)) {
    return null;
  }

  const lContainer = slot;

  // An LContainer may represent an instance of a defer block, in which case
  // we store it as a result. Otherwise, keep iterating over LContainer views and
  // look for defer blocks.
  const isLast = slotIdx === tView.bindingStartIndex - 1;

  if (!isLast) {
    const tNode = tView.data[slotIdx] as TNode;
    const tDetails = getTDeferBlockDetails(tView, tNode);

    if (isTDeferBlockDetails(tDetails)) {
      // return {lContainer, lView, tNode, tDetails};

      const native = getNativeByTNode(tNode, lView);
      const lDetails = getLDeferBlockDetails(lView, tNode);

      // The LView from `getLContext` might be the view the element is placed in.
      // Filter out defer blocks that aren't inside the specified root node.
      if (!node.contains(native as Node)) {
        return null;
      }

      const viewInjector = lView[INJECTOR];
      const registry = viewInjector.get(DEHYDRATED_BLOCK_REGISTRY, null, {optional: true});

      const renderedLView = getRendererLView(lContainer);
      const rootNodes: Node[] = [];
      const hydrationState = inferHydrationState(tDetails, lDetails, registry);

      if (renderedLView !== null) {
        collectNativeNodes(
          renderedLView[TVIEW],
          renderedLView,
          renderedLView[TVIEW].firstChild,
          rootNodes,
        );
      } else if (hydrationState === 'dehydrated') {
        // We'll find the number of root nodes in the transfer state and
        // collect that number of elements that precede the defer block comment node.

        const transferState = viewInjector.get(TransferState);
        const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});

        const deferId = lDetails[SSR_UNIQUE_ID]!;
        const deferData = deferBlockParents[deferId];
        const numberOfRootNodes = deferData[NUM_ROOT_NODES];

        let collectedNodeCount = 0;
        const deferBlockCommentNode = lContainer[NATIVE] as Node;
        let currentNode: Node | null = deferBlockCommentNode.previousSibling;

        while (collectedNodeCount < numberOfRootNodes && currentNode) {
          rootNodes.unshift(currentNode);
          currentNode = currentNode.previousSibling;
          collectedNodeCount++;
        }
      }

      return {
        type: ControlFlowBlockType.Defer,
        state: stringifyState(lDetails[DEFER_BLOCK_STATE]),
        incrementalHydrationState: hydrationState,
        hasErrorBlock: tDetails.errorTmplIndex !== null,
        loadingBlock: {
          exists: tDetails.loadingTmplIndex !== null,
          minimumTime: tDetails.loadingBlockConfig?.[MINIMUM_SLOT] ?? null,
          afterTime: tDetails.loadingBlockConfig?.[LOADING_AFTER_SLOT] ?? null,
        },
        placeholderBlock: {
          exists: tDetails.placeholderTmplIndex !== null,
          minimumTime: tDetails.placeholderBlockConfig?.[MINIMUM_SLOT] ?? null,
        },
        triggers: tDetails.debug?.triggers ? Array.from(tDetails.debug.triggers).sort() : [],
        hostNode: lContainer[HOST] as Node,
        rootNodes,
      } satisfies DeferBlockData;
    }
  }

  return null;
};

/**
 * Finds and returns all `@for` blocks in a LView.
 *
 * @param config Finder configuration object.
 * @returns
 */
const forLoopFinder: ControlFlowBlockViewFinder = ({
  lView,
  slotIdx,
}: ControlFlowBlockViewFinderConfig) => {
  const slot = lView[slotIdx];

  if (!isRepeaterMetadata(slot)) {
    return null;
  }

  const metadata = slot;
  const liveCollection = metadata.liveCollection;
  const items: unknown[] = [];

  if (liveCollection) {
    for (let j = 0; j < liveCollection.length; j++) {
      items.push(liveCollection.at(j));
    }
  }

  const containerIndex = slotIdx + 1;
  const lContainer = lView[containerIndex];
  const rootNodes: Node[] = [];

  if (isLContainer(lContainer)) {
    // Collect root nodes from each view in the container
    for (let viewIdx = CONTAINER_HEADER_OFFSET; viewIdx < lContainer.length; viewIdx++) {
      const viewAtIdx = lContainer[viewIdx];
      if (isLView(viewAtIdx)) {
        const viewTView = viewAtIdx[TVIEW];
        const viewNodes = collectNativeNodes(viewTView, viewAtIdx, viewTView.firstChild, []);
        rootNodes.push(...viewNodes);
      }
    }
  }

  return {
    type: ControlFlowBlockType.For,
    items,
    hasEmptyBlock: metadata.hasEmptyBlock,
    rootNodes,
    hostNode: lContainer[HOST] as Node,
    trackExpression: getTrackExpression(metadata),
  } satisfies ForLoopBlockData;
};

// Represents all supported control flow block finders.
const CONTROL_FLOW_BLOCK_FINDERS: ControlFlowBlockViewFinder[] = [deferBlockFinder, forLoopFinder];

/**
 * Finds all the control flow blocks inside a specific node and view.
 *
 * @param node Node in which to search for blocks.
 * @param lView View within the node in which to search for blocks.
 * @param results Array to which to add blocks once they're found.
 */
function findControlFlowBlocks(node: Node, lView: LView, results: ControlFlowBlock[]) {
  const tView = lView[TVIEW];

  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const slot = lView[i];

    for (const finder of CONTROL_FLOW_BLOCK_FINDERS) {
      const block = finder({node, lView, tView, slotIdx: i});
      if (block) {
        results.push(block);
        break;
      }
    }

    if (isLContainer(slot)) {
      const lContainer = slot;

      // The host can be an `LView` if this is the container
      // for a component that injects `ViewContainerRef`.
      if (isLView(lContainer[HOST])) {
        findControlFlowBlocks(node, lContainer[HOST], results);
      }

      for (let j = CONTAINER_HEADER_OFFSET; j < lContainer.length; j++) {
        findControlFlowBlocks(node, lContainer[j], results);
      }
    } else if (isLView(slot)) {
      // This is a component, enter the `findControlFlowBlocks` recursively.
      findControlFlowBlocks(node, slot, results);
    }
  }
}

/**
 * Turns the `DeferBlockState` into a string which is more readable than the enum form.
 *
 * @param lDetails Information about the
 * @returns
 */
function stringifyState(state: DeferBlockState | DeferBlockInternalState): DeferBlockData['state'] {
  switch (state) {
    case DeferBlockState.Complete:
      return 'complete';
    case DeferBlockState.Loading:
      return 'loading';
    case DeferBlockState.Placeholder:
      return 'placeholder';
    case DeferBlockState.Error:
      return 'error';
    case DeferBlockInternalState.Initial:
      return 'initial';
    default:
      throw new Error(`Unrecognized state ${state}`);
  }
}

/**
 * Infers the hydration state of a specific defer block.
 * @param tDetails Static defer block information.
 * @param lDetails Instance defer block information.
 * @param registry Registry coordinating the hydration of defer blocks.
 */
function inferHydrationState(
  tDetails: TDeferBlockDetails,
  lDetails: LDeferBlockDetails,
  registry: DehydratedBlockRegistry | null,
): DeferBlockData['incrementalHydrationState'] {
  if (
    registry === null ||
    lDetails[SSR_UNIQUE_ID] === null ||
    tDetails.hydrateTriggers === null ||
    tDetails.hydrateTriggers.has(DeferBlockTrigger.Never)
  ) {
    return 'not-configured';
  }
  return registry.has(lDetails[SSR_UNIQUE_ID]) ? 'dehydrated' : 'hydrated';
}

/**
 * Gets the current LView that is rendered out in a defer block.
 * @param details Instance information about the block.
 */
function getRendererLView(lContainer: LContainer): LView | null {
  // Defer block containers can only ever contain one view.
  // If they're empty, it means that nothing is rendered.
  if (lContainer.length <= CONTAINER_HEADER_OFFSET) {
    return null;
  }

  const lView = lContainer[CONTAINER_HEADER_OFFSET];
  ngDevMode && assertLView(lView);
  return lView;
}

/**
 * Checks if a value looks like RepeaterMetadata by duck-typing.
 * Can't use instanceof because that would require importing from control_flow.ts.
 */
function isRepeaterMetadata(value: unknown): value is RepeaterMetadataShape {
  return (
    value !== null &&
    typeof value === 'object' &&
    'hasEmptyBlock' in value &&
    'trackByFn' in value &&
    typeof (value as RepeaterMetadataShape).trackByFn === 'function'
  );
}

/**
 * Returns the string representation of the track expression.
 *
 * @param metadata Metadata containing the track function.
 * @returns
 */
function getTrackExpression(metadata: RepeaterMetadataShape): string {
  const trackByFn = metadata.trackByFn;
  if (trackByFn.name === 'ɵɵrepeaterTrackByIndex') {
    return '$index';
  }
  if (trackByFn.name === 'ɵɵrepeaterTrackByIdentity') {
    return 'item';
  }
  return 'function';
}
