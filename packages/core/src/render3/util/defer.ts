/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DeferBlockDetails, getDeferBlocks as getDeferBlocksInternal} from '../../defer/discovery';
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
import {getLDeferBlockDetails} from '../../defer/utils';
import {NUM_ROOT_NODES} from '../../hydration/interfaces';
import {NGH_DEFER_BLOCKS_KEY} from '../../hydration/utils';
import {TransferState} from '../../transfer_state';
import {assertLView} from '../assert';
import {collectNativeNodes} from '../collect_native_nodes';
import {getLContext} from '../context_discovery';
import {CONTAINER_HEADER_OFFSET, NATIVE} from '../interfaces/container';
import {INJECTOR, LView, TVIEW} from '../interfaces/view';
import {getNativeByTNode} from './view_utils';

/** Retrieved information about a `@defer` block. */
export interface DeferBlockData {
  /** Current state of the block. */
  state: 'placeholder' | 'loading' | 'complete' | 'error' | 'initial';

  /** Hydration state of the block. */
  incrementalHydrationState: 'not-configured' | 'hydrated' | 'dehydrated';

  /** Wherther the block has a connected `@error` block. */
  hasErrorBlock: boolean;

  /** Information about the connected `@loading` block. */
  loadingBlock: {
    /** Whether the block is defined. */
    exists: boolean;

    /** Minimum amount of milliseconds that the block should be shown. */
    minimumTime: number | null;

    /** Amount of time after which the block should be shown. */
    afterTime: number | null;
  };

  /** Information about the connected `@placeholder` block. */
  placeholderBlock: {
    /** Whether the block is defined. */
    exists: boolean;

    /** Minimum amount of time that block should be shown. */
    minimumTime: number | null;
  };

  /** Stringified version of the block's triggers. */
  triggers: string[];

  /** Element root nodes that are currently being shown in the block. */
  rootNodes: Node[];
}

/**
 * Gets all of the `@defer` blocks that are present inside the specified DOM node.
 * @param node Node in which to look for `@defer` blocks.
 *
 * @publicApi
 */
export function getDeferBlocks(node: Node): DeferBlockData[] {
  const results: DeferBlockData[] = [];
  const lView = getLContext(node)?.lView;

  if (lView) {
    findDeferBlocks(node, lView, results);
  }

  return results;
}

/**
 * Finds all the `@defer` blocks inside a specific node and view.
 * @param node Node in which to search for blocks.
 * @param lView View within the node in which to search for blocks.
 * @param results Array to which to add blocks once they're found.
 */
function findDeferBlocks(node: Node, lView: LView, results: DeferBlockData[]) {
  const viewInjector = lView[INJECTOR];
  const registry = viewInjector.get(DEHYDRATED_BLOCK_REGISTRY, null, {optional: true});
  const blocks: DeferBlockDetails[] = [];
  getDeferBlocksInternal(lView, blocks);

  const transferState = viewInjector.get(TransferState);
  const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});

  for (const details of blocks) {
    const native = getNativeByTNode(details.tNode, details.lView);
    const lDetails = getLDeferBlockDetails(details.lView, details.tNode);

    // The LView from `getLContext` might be the view the element is placed in.
    // Filter out defer blocks that aren't inside the specified root node.
    if (!node.contains(native as Node)) {
      continue;
    }

    const tDetails = details.tDetails;
    const renderedLView = getRendererLView(details);
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

      const deferId = lDetails[SSR_UNIQUE_ID]!;
      const deferData = deferBlockParents[deferId];
      const numberOfRootNodes = deferData[NUM_ROOT_NODES];

      let collectedNodeCount = 0;
      const deferBlockCommentNode = details.lContainer[NATIVE] as Node;
      let currentNode: Node | null = deferBlockCommentNode.previousSibling;

      while (collectedNodeCount < numberOfRootNodes && currentNode) {
        rootNodes.unshift(currentNode);
        currentNode = currentNode.previousSibling;
        collectedNodeCount++;
      }
    }

    const data: DeferBlockData = {
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
      rootNodes,
    };

    results.push(data);

    // `getDeferBlocks` does not resolve nested defer blocks so we have to recurse manually.
    if (renderedLView !== null) {
      findDeferBlocks(node, renderedLView, results);
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
function getRendererLView(details: DeferBlockDetails): LView | null {
  // Defer block containers can only ever contain one view.
  // If they're empty, it means that nothing is rendered.
  if (details.lContainer.length <= CONTAINER_HEADER_OFFSET) {
    return null;
  }

  const lView = details.lContainer[CONTAINER_HEADER_OFFSET];
  ngDevMode && assertLView(lView);
  return lView;
}
